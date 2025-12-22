import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";

serve(async (req) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return new Response("Expected multipart/form-data", { status: 400 });
    }

    const form = await req.formData();

    const file = form.get("file") as File | null;
    const productId = form.get("productId") as string | null;

    if (!file || !productId) {
      return new Response("Missing file or productId", { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${Deno.env.get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
        secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
      },
    });

    const key = `products/${productId}/${Date.now()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: Deno.env.get("R2_BUCKET_NAME")!,
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/webp",
      })
    );

    const publicUrl = `${Deno.env.get("R2_PUBLIC_BASE_URL")}/${key}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    );
  }
});
