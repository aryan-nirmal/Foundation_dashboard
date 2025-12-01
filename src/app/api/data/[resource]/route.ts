import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

type Resource =
  | "residents"
  | "staff"
  | "caretakers"
  | "visitors"
  | "donations"
  | "medical";

const TABLES: Record<
  Resource,
  { table: string; orderBy?: { column: string; ascending?: boolean } }
> = {
  residents: { table: "residents", orderBy: { column: "inserted_at" } },
  staff: { table: "staff", orderBy: { column: "inserted_at" } },
  caretakers: { table: "caretakers", orderBy: { column: "inserted_at" } },
  visitors: { table: "visitors", orderBy: { column: "inserted_at" } },
  donations: { table: "donations", orderBy: { column: "inserted_at" } },
  medical: { table: "medical_records", orderBy: { column: "inserted_at" } },
};

function getTableConfig(resource: string) {
  const config = TABLES[resource as Resource];
  if (!config) {
    throw new Error(`Unsupported resource: ${resource}`);
  }
  return config;
}

export async function GET(
  _request: Request,
  { params }: { params: { resource: string } },
) {
  try {
    const { table, orderBy } = getTableConfig(params.resource);
    let query = supabaseServer.from(table).select("*");
    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending ?? true,
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error(`[API] Failed to load data for ${params.resource}:`, error);
    const message =
      error instanceof Error ? error.message : "Unable to load data.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { resource: string } },
) {
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { message: "Request body is required." },
        { status: 400 },
      );
    }
    const { table } = getTableConfig(params.resource);
    const { data, error } = await supabaseServer
      .from(table)
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(`[API] Failed to insert into ${params.resource}:`, error);
    const message =
      error instanceof Error ? error.message : "Unable to insert data.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { resource: string } },
) {
  try {
    const payload = await request.json();
    const { id, ...updates } = payload ?? {};
    if (!id) {
      return NextResponse.json(
        { message: "Record id is required." },
        { status: 400 },
      );
    }
    const { table } = getTableConfig(params.resource);
    const { data, error } = await supabaseServer
      .from(table)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[API] Failed to update ${params.resource}:`, error);
    const message =
      error instanceof Error ? error.message : "Unable to update data.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { resource: string } },
) {
  try {
    const { id } = (await request.json()) ?? {};
    if (!id) {
      return NextResponse.json(
        { message: "Record id is required." },
        { status: 400 },
      );
    }
    const { table } = getTableConfig(params.resource);
    const { data, error } = await supabaseServer
      .from(table)
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[API] Failed to delete from ${params.resource}:`, error);
    const message =
      error instanceof Error ? error.message : "Unable to delete data.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
