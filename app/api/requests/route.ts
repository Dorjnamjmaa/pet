import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    if (!["petId", "petName", "name", "phone"].every((key) => typeof input[key] === "string" && input[key].trim())) {
      return NextResponse.json({ error: "Нэр, утасны дугаараа бүрэн оруулна уу." }, { status: 400 });
    }
    const dir = path.join(process.cwd(), "data");
    const file = path.join(dir, "adoption-requests.json");
    await mkdir(dir, { recursive: true });
    let requests = [];
    try { requests = JSON.parse(await readFile(file, "utf8")); } catch { /* First request */ }
    requests.unshift({ id: randomUUID(), petId: input.petId, petName: input.petName, name: input.name.trim().slice(0, 80), phone: input.phone.trim().slice(0, 30), message: typeof input.message === "string" ? input.message.trim().slice(0, 800) : "", createdAt: new Date().toISOString(), status: "Шинэ" });
    await writeFile(file, JSON.stringify(requests, null, 2), "utf8");
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Хүсэлт илгээж чадсангүй. Дахин оролдоно уу." }, { status: 500 });
  }
}
