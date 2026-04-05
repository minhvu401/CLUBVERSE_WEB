import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

export const runtime = "nodejs"; // bắt buộc để dùng fs

function safeExt(filename: string, mime: string) {
  const extFromName = path.extname(filename || "").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];

  if (allowed.includes(extFromName)) return extFromName;

  // fallback theo mime
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";

  return ""; // không cho
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "Thiếu file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File không phải ảnh" }, { status: 400 });
    }

    // giới hạn 5MB
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      return NextResponse.json({ message: "Ảnh tối đa 5MB" }, { status: 400 });
    }

    const ext = safeExt(file.name, file.type);
    if (!ext) {
      return NextResponse.json(
        { message: "Chỉ hỗ trợ .jpg, .png, .webp" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    const requestUrl = new URL(req.url);
    let origin = requestUrl.origin;
    
    // NestJS class-validator (@IsUrl) does not consider 'localhost' a valid TLD.
    // To bypass backend validation while ensuring the image still loads locally,
    // we use nip.io (a wildcard DNS that resolves to 127.0.0.1).
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      origin = `http://127.0.0.1.nip.io:${requestUrl.port || 3000}`;
    }

    // URL public
    const url = `${origin}/uploads/posts/${filename}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Upload hình ảnh bài viết thất bại";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
