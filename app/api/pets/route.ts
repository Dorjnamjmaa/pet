import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export type PetListing = {
  id: string;
  name: string;
  type: "Нохой" | "Муур" | "Бусад";
  breed: string;
  age: string;
  gender: string;
  place: string;
  image: string;
  description: string;
  vaccinated: boolean;
  contactName: string;
  contactPhone: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "pets.json");

async function readPets(): Promise<PetListing[]> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as PetListing[];
  } catch {
    return [];
  }
}

export async function GET() {
  const pets = await readPets();
  return NextResponse.json(pets.map((pet) => ({
    id: pet.id, name: pet.name, type: pet.type, breed: pet.breed, age: pet.age,
    gender: pet.gender, place: pet.place, image: pet.image, description: pet.description,
    vaccinated: pet.vaccinated, createdAt: pet.createdAt,
  })));
}

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const required = ["name", "type", "age", "gender", "place", "description", "contactName", "contactPhone"];
    if (required.some((key) => typeof input[key] !== "string" || !input[key].trim())) {
      return NextResponse.json({ error: "Заавал бөглөх мэдээллээ бүрэн оруулна уу." }, { status: 400 });
    }
    if (!["Нохой", "Муур", "Бусад"].includes(input.type)) {
      return NextResponse.json({ error: "Амьтны төрлөө сонгоно уу." }, { status: 400 });
    }
    if (!/^\+?[0-9 ()-]{8,20}$/.test(input.contactPhone.trim())) {
      return NextResponse.json({ error: "Утасны дугаараа зөв оруулна уу." }, { status: 400 });
    }

    let image = "";
    if (typeof input.image === "string" && input.image.startsWith("data:image/")) {
      const match = input.image.match(/^data:image\/(jpeg|png|webp);base64,([\s\S]+)$/);
      if (!match) return NextResponse.json({ error: "JPG, PNG эсвэл WebP зураг оруулна уу." }, { status: 400 });
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length > 5 * 1024 * 1024) return NextResponse.json({ error: "Зургийн хэмжээ 5 МБ-аас бага байна." }, { status: 400 });
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${randomUUID()}.${match[1] === "jpeg" ? "jpg" : match[1]}`;
      await writeFile(path.join(uploadDir, filename), bytes);
      image = `/uploads/${filename}`;
    }

    const pets = await readPets();
    const pet: PetListing = {
      id: randomUUID(), name: input.name.trim().slice(0, 60), type: input.type,
      breed: typeof input.breed === "string" ? input.breed.trim().slice(0, 80) || "Тодорхойгүй" : "Тодорхойгүй", age: input.age.trim().slice(0, 40),
      gender: input.gender.trim().slice(0, 20), place: input.place.trim().slice(0, 100),
      image, description: input.description.trim().slice(0, 1200), vaccinated: Boolean(input.vaccinated),
      contactName: input.contactName.trim().slice(0, 80), contactPhone: input.contactPhone.trim().slice(0, 30),
      createdAt: new Date().toISOString(),
    };
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, JSON.stringify([pet, ...pets], null, 2), "utf8");
    return NextResponse.json(pet, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Бүртгэл хадгалахад алдаа гарлаа. Дахин оролдоно уу." }, { status: 500 });
  }
}
