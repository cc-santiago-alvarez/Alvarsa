// Formato de moneda COP (enteros, sin decimales).
export function money(n: number): string {
  return '$' + Number(n || 0).toLocaleString('es-CO');
}
