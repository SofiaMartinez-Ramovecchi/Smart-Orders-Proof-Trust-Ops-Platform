use anchor_lang::prelude::*;

declare_id!("GHzEHaJZEzznRU8H8gBLMTFKPnhcWvZQWddzK9DHkRP");  

#[program]
pub mod solana_smart_contract {
    use super::*;

    /// CLIENTE crea una nueva orden
    pub fn create_order(
        ctx: Context<CreateOrder>,
        order_id: u64,
        title: String,
        details: String,
        amount: u64,
        finance: Pubkey,
        logistics: Pubkey,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            title.len() <= Order::MAX_TITLE_LEN,
            CustomError::TitleTooLong
        );
        require!(
            details.len() <= Order::MAX_DETAILS_LEN,
            CustomError::DetailsTooLong
        );

        order.order_id = order_id;
        order.customer = ctx.accounts.customer.key();
        order.finance = finance;
        order.logistics = logistics;

        order.title = title;
        order.details = details;
        order.amount = amount;

        order.status = OrderStatus::Created;

        let now = Clock::get()?.unix_timestamp;
        order.created_at = now;
        order.paid_at = 0;
        order.shipped_at = 0;
        order.delivered_at = 0;
        order.received_at = 0;

        Ok(())
    }

    /// FINANZAS marca la orden como pagada
    pub fn mark_paid(ctx: Context<FinanceAction>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Created,
            CustomError::InvalidState
        );
        // has_one=finance ya valida que el signer sea el dueño correcto
        order.status = OrderStatus::Paid;
        order.paid_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// LOGÍSTICA marca la orden como "en envío"
    pub fn mark_shipping(ctx: Context<LogisticsAction>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Paid,
            CustomError::InvalidState
        );

        order.status = OrderStatus::Shipping;
        order.shipped_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// LOGÍSTICA marca la orden como "entregada" (llegó al domicilio)
    pub fn mark_delivered(ctx: Context<LogisticsAction>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Shipping,
            CustomError::InvalidState
        );

        order.status = OrderStatus::Delivered;
        order.delivered_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// CLIENTE confirma que efectivamente recibió el pedido
    pub fn mark_received(ctx: Context<CustomerAction>) -> Result<()> {
        let order = &mut ctx.accounts.order;

        require!(
            order.status == OrderStatus::Delivered,
            CustomError::InvalidState
        );

        order.status = OrderStatus::Received;
        order.received_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

/* ==========================
   CONTEXTOS (ACCOUNTS)
   ========================== */

/// Crear una nueva orden (solo cliente)
#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct CreateOrder<'info> {
    #[account(
        init,
        payer = customer,
        space = 8 + Order::SIZE,
        seeds = [
            b"order",
            customer.key().as_ref(),
            &order_id.to_le_bytes()
        ],
        bump
    )]
    pub order: Account<'info, Order>,

    /// Cliente que crea la orden
    #[account(mut)]
    pub customer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Acción de finanzas (marcar Paid)
#[derive(Accounts)]
pub struct FinanceAction<'info> {
    #[account(
        mut,
        has_one = finance,
    )]
    pub order: Account<'info, Order>,

    /// Wallet del área de finanzas
    #[account(mut)]
    pub finance: Signer<'info>,
}

/// Acción de logística (Shipping / Delivered)
#[derive(Accounts)]
pub struct LogisticsAction<'info> {
    #[account(
        mut,
        has_one = logistics,
    )]
    pub order: Account<'info, Order>,

    /// Wallet del área de logística
    #[account(mut)]
    pub logistics: Signer<'info>,
}

/// Acción del cliente (Received)
#[derive(Accounts)]
pub struct CustomerAction<'info> {
    #[account(
        mut,
        has_one = customer,
    )]
    pub order: Account<'info, Order>,

    /// Wallet del cliente
    #[account(mut)]
    pub customer: Signer<'info>,
}

/* ==========================
   ACCOUNT: ORDER
   ========================== */

#[account]
pub struct Order {
    pub order_id: u64,

    pub customer: Pubkey,
    pub finance: Pubkey,
    pub logistics: Pubkey,

    pub title: String,
    pub details: String,
    pub amount: u64,

    pub status: OrderStatus,

    pub created_at: i64,
    pub paid_at: i64,
    pub shipped_at: i64,
    pub delivered_at: i64,
    pub received_at: i64,
}

impl Order {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DETAILS_LEN: usize = 280;

    // Tamaño sin el discriminator (Anchor añade 8 bytes aparte)
    pub const SIZE: usize =
        8 + // order_id
        32 + // customer
        32 + // finance
        32 + // logistics
        4 + Self::MAX_TITLE_LEN + // String title
        4 + Self::MAX_DETAILS_LEN + // String details
        8 + // amount
        1 + // status (enum como u8)
        8 + // created_at
        8 + // paid_at
        8 + // shipped_at
        8 + // delivered_at
        8;  // received_at
}

/* ==========================
   ENUMS & ERRORES
   ========================== */

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
    Eq
)]
pub enum OrderStatus {
    Created,
    Paid,
    Shipping,
    Delivered,
    Received,
    Canceled,
}

#[error_code]
pub enum CustomError {
    #[msg("No tenés permiso para ejecutar esta acción.")]
    Unauthorized,
    #[msg("El estado actual de la orden no permite esta transición.")]
    InvalidState,
    #[msg("El título es demasiado largo.")]
    TitleTooLong,
    #[msg("Los detalles son demasiado largos.")]
    DetailsTooLong,
}
