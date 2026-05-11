import index from "./index.html";

const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const EPOCHS = 3;

function blobId(data: any): string {
  return data.newlyCreated?.blobObject?.blobId ?? data.alreadyCertified?.blobId;
}

Bun.serve({
  port: 3456,
  routes: {
    "/": index,

    "/api/upload-text": {
      POST: async (req) => {
        try {
          const { content } = await req.json();
          const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=${EPOCHS}`, {
            method: "PUT",
            headers: { "Content-Type": "text/plain" },
            body: content,
          });
          if (!res.ok) throw new Error(`Publisher: ${res.status} ${await res.text()}`);
          return Response.json({ blobId: blobId(await res.json()) });
        } catch (e: any) {
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },

    "/api/upload-file": {
      POST: async (req) => {
        try {
          const formData = await req.formData();
          const file = formData.get("file") as File;
          const buffer = await file.arrayBuffer();
          const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=${EPOCHS}`, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: buffer,
          });
          if (!res.ok) throw new Error(`Publisher: ${res.status} ${await res.text()}`);
          return Response.json({ blobId: blobId(await res.json()) });
        } catch (e: any) {
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },

    "/api/read/:blobId": {
      GET: async (req) => {
        const id = req.params.blobId;
        try {
          const res = await fetch(`${AGGREGATOR}/v1/blobs/${id}`);
          if (!res.ok) throw new Error(`Aggregator: ${res.status}`);
          const contentType = res.headers.get("content-type") ?? "application/octet-stream";
          return new Response(res.body, { headers: { "Content-Type": contentType } });
        } catch (e: any) {
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
  development: { hmr: true, console: true },
});

console.log("🦭 Walrus Test App → http://localhost:3456");
