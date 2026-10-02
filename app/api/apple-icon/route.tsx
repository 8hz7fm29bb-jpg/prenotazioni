export const runtime = "edge";
export async function GET() {
  const response = await fetch(new URL("/booking-icon-512.png", "https://prenotazioni.vercel.app"));
  const bytes = await response.arrayBuffer();
  return new Response(bytes, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=0, must-revalidate" } });
}
