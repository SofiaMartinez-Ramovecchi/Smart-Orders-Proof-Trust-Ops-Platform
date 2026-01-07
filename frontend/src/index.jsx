import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import "./styles.css";

/* ================= ENV ================= */
const PROGRAM_ID = new PublicKey(process.env.PARCEL_PROGRAM_ID);
const RPC_URL = process.env.PARCEL_RPC_URL;

/* ============== DISCRIMINATORS (TU IDL) ============== */
const DISC = {
  create_order: [141, 54, 37, 207, 237, 210, 250, 215],
  mark_paid: [51, 120, 9, 160, 70, 29, 18, 205],
  mark_shipping: [107, 10, 9, 13, 122, 112, 208, 39],
  mark_delivered: [240, 118, 188, 142, 64, 85, 107, 18],
  mark_received: [177, 77, 161, 166, 182, 72, 36, 169],
};

/* ============== HELPERS BINARY ============== */
const u64LE = (n) => {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, BigInt(n), true);
  return new Uint8Array(buf);
};

const i64LE = (n) => {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigInt64(0, BigInt(n), true);
  return new Uint8Array(buf);
};

const u32LE = (n) => {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, n, true);
  return new Uint8Array(buf);
};

const anchorString = (s) => {
  const bytes = new TextEncoder().encode(s ?? "");
  return new Uint8Array([...u32LE(bytes.length), ...bytes]);
};

const short = (pk) => (pk ? pk.slice(0, 4) + "…" + pk.slice(-4) : "");

/* ============== ORDER STATUS ============== */
const STATUS = ["Created", "Paid", "Shipping", "Delivered", "Received", "Canceled"];

function App() {
  const [wallet, setWallet] = useState(null);
  const [role, setRole] = useState("customer"); // customer | finance | logistics
  const [loading, setLoading] = useState(false);

  // form create order
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [finance, setFinance] = useState("");
  const [logistics, setLogistics] = useState("");

  // list + ui
  const [orders, setOrders] = useState([]);
  const [selectedOrderPda, setSelectedOrderPda] = useState(null);
  const [lastTx, setLastTx] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const connection = useMemo(() => new Connection(RPC_URL, "confirmed"), []);

  /* ================= WALLET ================= */
  const connectWallet = async () => {
    const provider = window.solana;
    if (!provider?.isPhantom) return alert("Instalá Phantom");

    const res = await provider.connect();
    setWallet(res.publicKey);
  };

  const disconnectWallet = async () => {
    const provider = window.solana;
    try { await provider?.disconnect?.(); } catch {}
    setWallet(null);
    setOrders([]);
    setSelectedOrderPda(null);
    setLastTx(null);
  };

  /* ================= PDA ================= */
  const getOrderPda = (customerPk, orderIdU64) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("order"),
        customerPk.toBuffer(),
        Buffer.from(u64LE(orderIdU64)),
      ],
      PROGRAM_ID
    );
    return pda;
  };

  /* ================= SERIALIZE IX ================= */
  function buildIxCreateOrder({ orderId, title, details, amount, financePk, logisticsPk }) {
    return Buffer.from([
      ...DISC.create_order,
      ...u64LE(orderId),
      ...anchorString(title),
      ...anchorString(details),
      ...u64LE(amount),
      ...financePk.toBytes(),
      ...logisticsPk.toBytes(),
    ]);
  }

  function buildIxNoArgs(discriminator) {
    return Buffer.from([...discriminator]);
  }

  /* ================= DECODE ORDER ACCOUNT =================
     Layout (según tu IDL + Anchor):
     8   discriminator
     8   order_id u64
     32  customer pubkey
     32  finance pubkey
     32  logistics pubkey
     4+  title string
     4+  details string
     8   amount u64
     1   status enum u8
     8x5 timestamps i64: created_at, paid_at, shipped_at, delivered_at, received_at
  */
  function decodeOrder(data) {
    let off = 8;

    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const order_id = dv.getBigUint64(off, true); off += 8;

    const customer = new PublicKey(data.slice(off, off + 32)); off += 32;
    const finance = new PublicKey(data.slice(off, off + 32)); off += 32;
    const logistics = new PublicKey(data.slice(off, off + 32)); off += 32;

    const titleLen = dv.getUint32(off, true); off += 4;
    const title = new TextDecoder().decode(data.slice(off, off + titleLen)); off += titleLen;

    const detailsLen = dv.getUint32(off, true); off += 4;
    const details = new TextDecoder().decode(data.slice(off, off + detailsLen)); off += detailsLen;

    const amount = dv.getBigUint64(off, true); off += 8;

    const statusU8 = data[off]; off += 1;
    const status = STATUS[statusU8] ?? `Unknown(${statusU8})`;

    const created_at = dv.getBigInt64(off, true); off += 8;
    const paid_at = dv.getBigInt64(off, true); off += 8;
    const shipped_at = dv.getBigInt64(off, true); off += 8;
    const delivered_at = dv.getBigInt64(off, true); off += 8;
    const received_at = dv.getBigInt64(off, true); off += 8;

    return {
      order_id,
      customer,
      finance,
      logistics,
      title,
      details,
      amount,
      statusU8,
      status,
      created_at,
      paid_at,
      shipped_at,
      delivered_at,
      received_at,
    };
  }

  const fmtTime = (bi) => {
    const n = Number(bi);
    if (!n) return "—";
    const d = new Date(n * 1000);
    return d.toLocaleString();
  };

  /* ================= LIST ORDERS (ON-CHAIN) =================
     Filtramos por rol usando memcmp en offsets fijos:

     discriminator(8) + order_id(8) = 16
     customer pubkey offset = 16
     finance  pubkey offset = 48
     logistics pubkey offset = 80
  */
  const loadOrders = async () => {
    if (!wallet) return;

    setLoading(true);
    try {
      const offsetByRole = {
        customer: 16,
        finance: 48,
        logistics: 80,
      };

      const offset = offsetByRole[role] ?? 16;

      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { memcmp: { offset, bytes: wallet.toBase58() } },
        ],
      });

      const decoded = accounts
        .map((acc) => {
          try {
            const order = decodeOrder(acc.account.data);
            return {
              pda: acc.pubkey,
              ...order,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => Number(b.order_id - a.order_id));

      setOrders(decoded);

      // mantener selection razonable
      if (decoded.length && !selectedOrderPda) {
        setSelectedOrderPda(decoded[0].pda.toBase58());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, role, refreshKey]);

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.pda.toBase58() === selectedOrderPda) ?? null;
  }, [orders, selectedOrderPda]);

  /* ================= NEXT ORDER ID ================= */
  const getNextOrderId = () => {
    // para customer: max+1 de sus órdenes
    const mine = orders;
    if (!mine.length) return 1;
    const max = mine.reduce((m, o) => {
      const id = Number(o.order_id);
      return id > m ? id : m;
    }, 0);
    return max + 1;
  };

  /* ================= SEND TX HELPERS ================= */
  const sendTx = async (tx) => {
    const provider = window.solana;
    tx.feePayer = provider.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await provider.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    setLastTx(sig);
    setRefreshKey((k) => k + 1);
    return sig;
  };

  /* ================= ACTIONS ================= */
  const onCreateOrder = async () => {
    if (!wallet) return alert("Conectá Phantom");

    // validaciones rápidas
    if (!title.trim()) return alert("Poné un título");
    if (!details.trim()) return alert("Poné detalles");
    if (!amount || Number(amount) <= 0) return alert("Monto inválido");
    let financePk, logisticsPk;
    try { financePk = new PublicKey(finance); } catch { return alert("Wallet Finanzas inválida"); }
    try { logisticsPk = new PublicKey(logistics); } catch { return alert("Wallet Logística inválida"); }

    const orderId = getNextOrderId();
    const orderPda = getOrderPda(wallet, orderId);

    const data = buildIxCreateOrder({
      orderId,
      title: title.trim(),
      details: details.trim(),
      amount: BigInt(amount),
      financePk,
      logisticsPk,
    });

    const ix = {
      programId: PROGRAM_ID,
      keys: [
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: true }, // customer
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    };

    setLoading(true);
    try {
      const tx = new Transaction().add(ix);
      const sig = await sendTx(tx);

      // limpiar form (no tocar finance/logistics si querés reusar)
      setTitle("");
      setDetails("");
      setAmount("");

      alert(`Orden creada ✔\nID: ${orderId}\nTX: ${sig}`);
    } catch (e) {
      console.error(e);
      alert("Falló crear orden. Mirá consola para logs.");
    } finally {
      setLoading(false);
    }
  };

  const actOnSelected = async (kind) => {
    if (!wallet) return alert("Conectá Phantom");
    if (!selectedOrder) return alert("Elegí una orden");

    const orderPubkey = new PublicKey(selectedOrder.pda);

    const discriminator =
      kind === "mark_paid" ? DISC.mark_paid :
      kind === "mark_shipping" ? DISC.mark_shipping :
      kind === "mark_delivered" ? DISC.mark_delivered :
      kind === "mark_received" ? DISC.mark_received :
      null;

    if (!discriminator) return;

    // cuentas esperadas por tu IDL:
    // mark_paid:      [order, finance signer]
    // mark_shipping:  [order, logistics signer]
    // mark_delivered: [order, logistics signer]
    // mark_received:  [order, customer signer]
    const signerKey =
      kind === "mark_paid" ? "finance" :
      (kind === "mark_shipping" || kind === "mark_delivered") ? "logistics" :
      "customer";

    const ix = {
      programId: PROGRAM_ID,
      keys: [
        { pubkey: orderPubkey, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: true },
      ],
      data: buildIxNoArgs(discriminator),
    };

    setLoading(true);
    try {
      const tx = new Transaction().add(ix);
      const sig = await sendTx(tx);
      alert(`${kind} ✔\nTX: ${sig}`);
    } catch (e) {
      console.error(e);
      alert("Falló la acción. Mirá consola.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI PERMISSIONS ================= */
  const canMarkPaid = selectedOrder?.status === "Created" && role === "finance";
  const canMarkShipping = selectedOrder?.status === "Paid" && role === "logistics";
  const canMarkDelivered = selectedOrder?.status === "Shipping" && role === "logistics";
  const canMarkReceived = selectedOrder?.status === "Delivered" && role === "customer";

  return (
    <div className="bg">
      <div className="shell">
        <header className="header glass">
          <div>
            <div className="kicker">Devnet • Program</div>
            <div className="title">Smart Orders MVP</div>
            <div className="sub">
              <span className="pill">{short(PROGRAM_ID.toBase58())}</span>
              <span className="pill">{short(RPC_URL)}</span>
            </div>
          </div>

          <div className="headerRight">
            {!wallet ? (
              <button className="btn" onClick={connectWallet}>Conectar Phantom</button>
            ) : (
              <div className="walletBox">
                <div className="walletLine">
                  <span className="dot" />
                  <span className="mono">{short(wallet.toBase58())}</span>
                </div>
                <button className="btn ghost" onClick={disconnectWallet}>Desconectar</button>
              </div>
            )}
          </div>
        </header>

        {wallet && (
          <div className="grid">
            {/* LEFT */}
            <section className="glass card">
              <div className="cardTitle">Rol</div>
              <div className="roleRow">
                <button
                  className={`chip ${role === "customer" ? "chipOn" : ""}`}
                  onClick={() => setRole("customer")}
                >
                  Cliente
                </button>
                <button
                  className={`chip ${role === "finance" ? "chipOn" : ""}`}
                  onClick={() => setRole("finance")}
                >
                  Finanzas
                </button>
                <button
                  className={`chip ${role === "logistics" ? "chipOn" : ""}`}
                  onClick={() => setRole("logistics")}
                >
                  Logística
                </button>
              </div>

              {role === "customer" && (
                <>
                  <div className="divider" />
                  <div className="cardTitle">Crear orden</div>

                  <label className="label">Título</label>
                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Hierro 12mm x 10u" />

                  <label className="label">Detalles</label>
                  <textarea className="input textarea" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Ej: Entrega en Monte Grande, horario 14–18, etc." />

                  <label className="label">Monto (u64)</label>
                  <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 1500" />

                  <label className="label">Wallet Finanzas</label>
                  <input className="input mono" value={finance} onChange={(e) => setFinance(e.target.value)} placeholder="Pubkey finanzas" />

                  <label className="label">Wallet Logística</label>
                  <input className="input mono" value={logistics} onChange={(e) => setLogistics(e.target.value)} placeholder="Pubkey logística" />

                  <button className="btn full" disabled={loading} onClick={onCreateOrder}>
                    {loading ? "Procesando…" : `Crear orden (ID auto: ${getNextOrderId()})`}
                  </button>
                  <div className="hint">
                    Se crea una PDA única por <b>(customer + order_id)</b>.
                  </div>
                </>
              )}

              <div className="divider" />
              <div className="cardTitle">Acciones por estado</div>

              <div className="actions">
                <button className="btn full" disabled={!canMarkPaid || loading} onClick={() => actOnSelected("mark_paid")}>
                  Finanzas: Marcar Paid
                </button>
                <button className="btn full" disabled={!canMarkShipping || loading} onClick={() => actOnSelected("mark_shipping")}>
                  Logística: Marcar Shipping
                </button>
                <button className="btn full" disabled={!canMarkDelivered || loading} onClick={() => actOnSelected("mark_delivered")}>
                  Logística: Marcar Delivered
                </button>
                <button className="btn full" disabled={!canMarkReceived || loading} onClick={() => actOnSelected("mark_received")}>
                  Cliente: Confirmar Received
                </button>
              </div>

              {lastTx && (
                <>
                  <div className="divider" />
                  <a
                    className="link"
                    href={`https://explorer.solana.com/tx/${lastTx}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver última TX en Explorer ↗
                  </a>
                </>
              )}
            </section>

            {/* RIGHT */}
            <section className="glass card">
              <div className="rowBetween">
                <div>
                  <div className="cardTitle">Órdenes ({orders.length})</div>
                  <div className="hint">
                    Lista on-chain filtrada por rol: <b>{role}</b>
                  </div>
                </div>
                <button className="btn ghost" disabled={loading} onClick={() => setRefreshKey((k) => k + 1)}>
                  Refrescar
                </button>
              </div>

              <div className="ordersList">
                {orders.length === 0 && (
                  <div className="empty">
                    No hay órdenes para este rol/wallet todavía.
                  </div>
                )}

                {orders.map((o) => {
                  const active = selectedOrderPda === o.pda.toBase58();
                  return (
                    <button
                      key={o.pda.toBase58()}
                      className={`orderItem ${active ? "orderActive" : ""}`}
                      onClick={() => setSelectedOrderPda(o.pda.toBase58())}
                    >
                      <div className="orderTop">
                        <div className="orderTitle">{o.title}</div>
                        <div className={`badge b${o.status}`}>{o.status}</div>
                      </div>
                      <div className="orderMeta">
                        <span className="pill">ID {Number(o.order_id)}</span>
                        <span className="pill mono">{short(o.pda.toBase58())}</span>
                        <span className="pill">Monto {o.amount.toString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedOrder && (
                <>
                  <div className="divider" />
                  <div className="cardTitle">Detalle</div>

                  <div className="detailGrid">
                    <div className="detailBox">
                      <div className="detailLabel">Order ID</div>
                      <div className="detailValue">{Number(selectedOrder.order_id)}</div>
                    </div>
                    <div className="detailBox">
                      <div className="detailLabel">Estado</div>
                      <div className="detailValue">{selectedOrder.status}</div>
                    </div>
                    <div className="detailBox">
                      <div className="detailLabel">Monto</div>
                      <div className="detailValue">{selectedOrder.amount.toString()}</div>
                    </div>
                    <div className="detailBox">
                      <div className="detailLabel">PDA</div>
                      <div className="detailValue mono">{selectedOrder.pda.toBase58()}</div>
                    </div>
                  </div>

                  <div className="detailBox big">
                    <div className="detailLabel">Detalles</div>
                    <div className="detailValue">{selectedOrder.details}</div>
                  </div>

                  <div className="detailGrid">
                    <div className="detailBox">
                      <div className="detailLabel">Cliente</div>
                      <div className="detailValue mono">{selectedOrder.customer.toBase58()}</div>
                    </div>
                    <div className="detailBox">
                      <div className="detailLabel">Finanzas</div>
                      <div className="detailValue mono">{selectedOrder.finance.toBase58()}</div>
                    </div>
                    <div className="detailBox">
                      <div className="detailLabel">Logística</div>
                      <div className="detailValue mono">{selectedOrder.logistics.toBase58()}</div>
                    </div>
                  </div>

                  <div className="divider" />
                  <div className="cardTitle">Timeline</div>

                  <div className="timeline">
                    <TimeRow label="Created" value={fmtTime(selectedOrder.created_at)} />
                    <TimeRow label="Paid" value={fmtTime(selectedOrder.paid_at)} />
                    <TimeRow label="Shipping" value={fmtTime(selectedOrder.shipped_at)} />
                    <TimeRow label="Delivered" value={fmtTime(selectedOrder.delivered_at)} />
                    <TimeRow label="Received" value={fmtTime(selectedOrder.received_at)} />
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        <footer className="footer">
          <span className="muted">MVP on-chain sin indexer • Devnet</span>
        </footer>
      </div>
    </div>
  );
}

function TimeRow({ label, value }) {
  return (
    <div className="timeRow">
      <div className="timeDot" />
      <div className="timeLabel">{label}</div>
      <div className="timeValue">{value}</div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
