export function res(
  type: "error" | "success",
  status: number,
  message: string,
) {
  return new Response(JSON.stringify({ type, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
