const collectionRoutes = new Set(["issue-types"]);

async function forward(request: Request, pathParts: string[]) {
  const path = pathParts.join("/");
  const method = request.method.toUpperCase();
  if ((method === "GET" && !collectionRoutes.has(path)) || (method === "POST" && path !== "tickets/portal")) {
    return Response.json({ message: "This service desk route is not available." }, { status: 404 });
  }
  const baseUrl = (process.env.RMM_API_URL || "http://localhost:3001").replace(/\/+$/, "");
  const incomingUrl = new URL(request.url);
  const target = baseUrl + "/" + path + (method === "GET" ? incomingUrl.search : "");
  try {
    const upstream = await fetch(target, {
      method,
      headers: method === "POST" ? { "content-type": "application/json", accept: "application/json" } : { accept: "application/json" },
      body: method === "POST" ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return Response.json({ message: "The service desk API could not be reached. Verify RMM_API_URL and that the backend is running." }, { status: 502 });
  }
}

async function getPath(context: { params: Promise<{ path: string[] }> }) {
  return (await context.params).path;
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await getPath(context));
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await getPath(context));
}
