import { NextResponse } from "next/server";

import {
  getCaretakers,
  getDonations,
  getMedicalRecords,
  getResidents,
  getStaff,
  getVisitors,
} from "@/lib/excel-data";

const loaders: Record<string, () => Promise<unknown>> = {
  residents: getResidents,
  staff: getStaff,
  caretakers: getCaretakers,
  visitors: getVisitors,
  donations: getDonations,
  medical: getMedicalRecords,
};

export async function GET(
  _request: Request,
  { params }: { params: { resource: string } },
) {
  console.log(`[API] Loading resource: ${params.resource}`);
  const loader = loaders[params.resource];
  if (!loader) {
    console.error(`[API] Resource not found: ${params.resource}`);
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    console.log(`[API] Calling loader for: ${params.resource}`);
    const payload = await loader();
    console.log(`[API] Successfully loaded ${params.resource}, count:`, Array.isArray(payload) ? payload.length : 'N/A');
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error(`[API] Failed to load Excel data for ${params.resource}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: `Unable to load data: ${errorMessage}` },
      { status: 500 },
    );
  }
}

