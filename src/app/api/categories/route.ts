import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        petType: body.petType || "both",
        icon: body.icon || "🐾",
        image: body.image,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
