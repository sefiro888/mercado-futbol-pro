// =============================================================================
// Fórmulas económicas de los fichajes.
// Todas las cifras se expresan en millones de euros (M€).
// Estas funciones son puras: no dependen del DOM ni de React, lo que facilita
// reutilizarlas en un futuro backend o en tests.
// =============================================================================

import { formatMoney, formatPercent } from './format.js'

/**
 * 1) Diferencia respecto al valor de mercado.
 *    diferenciaValor = precioTraspaso - valorMercado
 * @returns {number|null} diferencia en M€ (null si falta algún dato).
 */
export function diferenciaValor(transferFee, marketValue) {
  if (transferFee == null || marketValue == null) return null
  return transferFee - marketValue
}

/**
 * Texto descriptivo de la diferencia respecto al valor de mercado.
 *  - positivo: "+X M€ sobre valor de mercado"
 *  - negativo: "X M€ por debajo del valor de mercado"
 */
export function diferenciaValorTexto(transferFee, marketValue) {
  const diff = diferenciaValor(transferFee, marketValue)
  if (diff === null) return 'No disponible'
  if (diff === 0) return 'Igual al valor de mercado'
  if (diff > 0) return `+${formatMoney(diff)} sobre valor de mercado`
  return `${formatMoney(Math.abs(diff))} por debajo del valor de mercado`
}

/**
 * 2) Ganancia o pérdida real del club vendedor.
 *    gananciaVendedor = precioTraspaso - precioCompraAnterior
 * @returns {number|null} null si no hay precio de compra anterior.
 */
export function gananciaVendedor(transferFee, previousPurchaseFee) {
  if (transferFee == null || previousPurchaseFee == null) return null
  return transferFee - previousPurchaseFee
}

/**
 * Texto de la ganancia/pérdida del vendedor.
 * Devuelve "No disponible" si no existe precio de compra anterior.
 */
export function gananciaVendedorTexto(transferFee, previousPurchaseFee) {
  const ganancia = gananciaVendedor(transferFee, previousPurchaseFee)
  if (ganancia === null) return 'No disponible'
  if (ganancia === 0) return 'Sin ganancia ni pérdida'
  if (ganancia > 0) return `+${formatMoney(ganancia)} de ganancia`
  return `${formatMoney(Math.abs(ganancia))} de pérdida`
}

/**
 * 3) Porcentaje de diferencia respecto al valor de mercado.
 *    porcentajeDiferencia = ((precioTraspaso - valorMercado) / valorMercado) * 100
 * @returns {number|null} porcentaje sin redondear (null si valor de mercado es 0/ausente).
 */
export function porcentajeDiferencia(transferFee, marketValue) {
  if (transferFee == null || marketValue == null || marketValue === 0) return null
  return ((transferFee - marketValue) / marketValue) * 100
}

/** Texto del porcentaje de diferencia, redondeado y con signo. */
export function porcentajeDiferenciaTexto(transferFee, marketValue) {
  const pct = porcentajeDiferencia(transferFee, marketValue)
  return formatPercent(pct)
}

/**
 * Calcula y adjunta todos los valores derivados de un fichaje.
 * Se usa para no repetir cálculos en los componentes.
 */
export function enrichTransfer(transfer) {
  return {
    ...transfer,
    diff: diferenciaValor(transfer.transferFee, transfer.marketValueAtTransfer),
    diffText: diferenciaValorTexto(transfer.transferFee, transfer.marketValueAtTransfer),
    gain: gananciaVendedor(transfer.transferFee, transfer.previousPurchaseFee),
    gainText: gananciaVendedorTexto(transfer.transferFee, transfer.previousPurchaseFee),
    diffPct: porcentajeDiferencia(transfer.transferFee, transfer.marketValueAtTransfer),
    diffPctText: porcentajeDiferenciaTexto(transfer.transferFee, transfer.marketValueAtTransfer),
  }
}
