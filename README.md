# Smart Orders – Proof of Concept

This repository contains a **Proof of Concept** for Smart Orders Platform:
a verifiable operations system based on signed workflows and immutable state transitions.

The project is composed of:
- **Backend**: NestJS API + Solana integration
- **Frontend**: React + Parcel UI

---

## 🚀 Quick start (recommended)

### Requirements
- Docker
- Docker Compose

### Run everything

```bash
git clone https://github.com/your-org/smart-orders.git
cd smart-orders

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build


📌 What this PoC demonstrates

Orders modeled as immutable on-chain state machines

Role-based transitions validated on-chain

Cryptographic signatures per role

Multi-order support using PDAs

Full historical traceability

User-friendly UI abstraction

⚠️ This is a Proof of Concept, not production-ready software.

🧠 Project status

Core technical hypothesis: ✅ validated

On-chain workflow rules: ✅ validated

UI usability: ✅ validated

Production hardening: ❌ pending

Enterprise features: ❌ out of scope


esis de Producto – Smart Orders Platform

## Introducción

Este documento reúne y ordena todo el proceso de análisis, investigación, validación técnica y definición estratégica que realicé para el desarrollo de **Smart Orders Platform**. No se trata de una especificación técnica cerrada ni de un simple resumen ejecutivo, sino de una **tesis de producto**: explica el problema, el razonamiento detrás de cada decisión, las pruebas realizadas, las conclusiones obtenidas y el camino elegido para convertir esta idea en un producto real, vendible y escalable.

El objetivo principal es que cualquier lector —técnico, inversor, potencial socio o cliente— pueda comprender **por qué este producto existe, qué problema resuelve, cómo lo hace, qué ya fue validado y qué falta construir**, sin depender de conversaciones previas ni conocimiento implícito.

---

## 1. Problema de fondo

Durante años, la mayoría de las empresas resolvió sus operaciones comerciales críticas (pagos, entregas, aprobaciones, recepciones) utilizando una combinación de ERPs tradicionales, correos electrónicos, planillas, mensajes y sistemas internos. Aunque estas herramientas funcionan para registrar datos, **fallan sistemáticamente cuando aparece un conflicto**.

En la práctica, los problemas más comunes son:

- Finanzas afirma haber pagado, logística afirma no haber recibido confirmación.
    
- Logística afirma haber entregado, el cliente afirma no haber recibido.
    
- No queda claro quién aprobó una acción ni en qué momento.
    
- Auditar estos procesos es caro, lento y muchas veces inconcluso.
    

El problema no es la falta de software, sino la **falta de confianza verificable**. Los sistemas tradicionales son centralizados, editables y dependen de la autoridad interna de la empresa. Cuando las partes tienen intereses distintos, esa confianza se rompe.

---

## 2. Hipótesis central

La hipótesis que guía este proyecto es simple, pero fuerte:

> La mayoría de los conflictos operativos entre áreas o empresas no se deben a errores técnicos, sino a la ausencia de pruebas objetivas, firmadas e inmutables sobre lo que realmente ocurrió.

Si cada acción crítica quedara registrada de forma verificable, con identidad clara del responsable y un timestamp inalterable, **la discusión dejaría de ser subjetiva**. El sistema no tendría que decidir quién tiene razón: los hechos hablarían por sí mismos.

---

## 3. Solución propuesta

Smart Orders Platform nace como una **capa de verdad y auditoría** sobre procesos comerciales. No busca reemplazar personas, ni sistemas existentes, ni actuar como intermediario financiero. Su único rol es **registrar hechos**.

Cada proceso se modela como una **orden**, que avanza por una serie de estados explícitos. Cada cambio de estado requiere la firma criptográfica del rol responsable. Una vez firmado, el evento queda registrado y no puede ser modificado.

El sistema no confía en usuarios, contraseñas ni permisos blandos. Confía en **firmas criptográficas asociadas a wallets**, lo que permite demostrar, sin ambigüedad, quién ejecutó cada acción.

---

## 4. Prueba de Concepto (PoC)

Antes de avanzar hacia un MVP comercial, desarrollé una **prueba de concepto funcional** para validar los riesgos técnicos principales.

La PoC permitió confirmar que:

- Es posible modelar procesos internos de empresas mediante órdenes con estados y roles asociados.
    
- Cada rol utiliza una wallet propia para firmar acciones, demostrando autoría exclusiva.
    
- Las órdenes y su historial no son editables una vez registradas.
    
- Se puede recuperar el historial completo de una orden para auditoría y visualización.
    
- Mediante **PDA (Program Derived Addresses)** es posible manejar múltiples órdenes por usuario sin colisiones.
    
- Una misma orden puede contener firmas de múltiples roles distintos.
    
- Toda esta información puede presentarse en una interfaz comprensible para usuarios no técnicos.
    

Esta validación reduce significativamente el riesgo técnico del proyecto: **el core funciona**.

---

## 5. Reglas de workflow validadas

Las reglas del proceso no se validan en la interfaz ni únicamente en backend, sino **directamente on-chain**, lo que impide bypasses.

- El cliente puede crear la orden y confirmar la recepción final.
    
- Finanzas solo puede avanzar de `Created` a `Paid`.
    
- Logística solo puede avanzar de `Paid` a `Shipping` y luego a `Delivered`.
    
- Ningún rol puede ejecutar transiciones fuera de su responsabilidad.
    

Estas reglas garantizan separación de funciones y no repudio.

---

## 6. Qué se puede auditar

A partir del ledger on-chain, hoy ya es posible obtener métricas que normalmente requieren sistemas complejos o auditorías manuales:

- Tiempos totales e intermedios por orden.
    
- Tiempo promedio de aprobación de pagos.
    
- Tiempo promedio de envío y entrega.
    
- Órdenes pendientes por área.
    
- Ranking de eficiencia por usuario o rol.
    
- Cumplimiento de SLA.
    
- Variación de carga operativa por día o semana.
    

La diferencia clave es que **estos datos no pueden ser adulterados**.

---

## 7. Segmentos de clientes y enfoque de mercado

No existe “un cliente”. Existen segmentos con dolores distintos.

El punto de entrada al mercado son empresas medianas (20–300 empleados) con fricción inter-áreas. Estas empresas ya sufren conflictos reales, pero no pueden justificar un ERP enterprise completo ni auditorías constantes.

A partir de ahí, el producto escala hacia ecosistemas multi-empresa y, finalmente, hacia empresas grandes con requerimientos fuertes de compliance.

---

## 8. Propuesta de valor

Smart Orders no se vende como blockchain ni como ERP. Se vende como **evidencia**.

- Evidencia de quién hizo qué.
    
- Evidencia de cuándo ocurrió.
    
- Evidencia verificable por terceros.
    

El mensaje correcto no es “reemplazamos tu ERP”, sino:

> “No tocamos tu ERP. Lo hacemos auditable.”

---

## 9. Modelo de negocio y pricing

El modelo se basa en SaaS + uso. No se cobra por tecnología, sino por **conflictos evitados y riesgo reducido**.

Los precios están diseñados para que el ROI sea evidente incluso para SMBs. Un solo reclamo evitado suele pagar varios meses de uso.

---

## 10. Unit economics y viabilidad

La unidad económica no es el cliente, sino **la orden trazada y firmada**.

Con un revenue promedio de USD 0,20 por orden y un costo aproximado de USD 0,06, el margen de contribución ronda el 70%. Esto permite escalar sin que los costos crezcan de forma proporcional.

El análisis de CAC, LTV y proyecciones financieras muestra que el modelo es viable y robusto ante variaciones razonables.

---

## 11. Riesgos y mitigaciones

El proyecto tiene riesgos reales: técnicos, de mercado y legales. La mayoría son mitigables mediante arquitectura híbrida, UX cuidadosa, contratos claros y una estrategia de entrada gradual. Algunos riesgos —como prohibiciones estatales extremas— no lo son, y se asumen explícitamente.

---

## 12. MVP y plan de lanzamiento

El MVP se enfoca únicamente en el núcleo probado:

- Órdenes multi-rol.
    
- Estados y firmas on-chain.
    
- Timeline auditable.
    
- Dashboard simple.
    

El lanzamiento no busca escala inmediata, sino validación comercial: pocos clientes reales, onboarding manual y feedback intensivo.

---

## 13. Conclusión

Smart Orders Platform no es una aplicación cripto ni un ERP tradicional. Es una **infraestructura de confianza**.

La prueba de concepto demuestra que la solución es técnicamente viable. El análisis de mercado y de costos demuestra que es comercialmente viable. El próximo desafío ya no es técnico: es ejecutar correctamente el producto y el go-to-market.

Esta tesis documenta el camino recorrido y justifica por qué este producto merece existir.