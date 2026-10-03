export function methodNotAllowed(allow: string) {
  return Response.json({ error: "Method not allowed." }, {
    status: 405,
    headers: { Allow: allow, "Cache-Control": "no-store" },
  });
}

export function optionsAllowed(allow: string) {
  return new Response(null, { status: 204, headers: { Allow: allow, "Cache-Control": "no-store" } });
}
