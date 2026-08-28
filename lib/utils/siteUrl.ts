// La dirección pública del producto, en un solo lugar.
//
// Vivía repetida en tres archivos y con dos respaldos distintos: dos decían
// `foodtruckos.vercel.app` y uno `foodtruckos.com`, un dominio que nunca fue
// nuestro. El día que faltara la variable de entorno, los correos de aviso
// habrían mandado al equipo a un sitio ajeno mientras los QR seguían apuntando
// bien — el peor tipo de defecto, porque cada mitad parece correcta por su lado.
//
// El respaldo es el dominio que de verdad está sirviendo hoy. Cuando se mueva a
// uno propio, se cambia la variable en Vercel; esta constante es solo la red
// para cuando falta, no la configuración.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pavessa.com"
