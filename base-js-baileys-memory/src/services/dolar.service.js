const DOLAR_API_URL = 'https://api.bluelytics.com.ar/v2/latest'

function formatPrice(value) {
    if (value === null || value === undefined) return 'N/A'

    return Number(value).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export async function getDolarListMessage() {
    const response = await fetch(DOLAR_API_URL)

    if (!response.ok) {
        throw new Error(
            `Dolar API error: ${response.status} ${response.statusText}`
        )
    }

    const data = await response.json()

    const oficialCompra = data.oficial?.value_buy
    const oficialVenta = data.oficial?.value_sell

    const blueCompra = data.blue?.value_buy
    const blueVenta = data.blue?.value_sell

    const lines = [
        '📈 Cotizaciones del dólar',
        '',
        `🏦 BNA / Oficial`,
        `Compra: $${formatPrice(oficialCompra)}`,
        `Venta: $${formatPrice(oficialVenta)}`,
        '',
        `💙 Blue`,
        `Compra: $${formatPrice(blueCompra)}`,
        `Venta: $${formatPrice(blueVenta)}`,
        '',
        `🕒 Actualizado: ${new Date().toLocaleString('es-AR')}`,
        '',
        'Fuente: Bluelytics',
    ]

    return lines.join('\n')
}