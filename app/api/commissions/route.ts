import { NextRequest, NextResponse } from "next/server";
import { getCommissions, getCommissionById, createCommission, getCommissionsSummary } from "@/lib/services/commissions";
import { CreateCommissionSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const estado = searchParams.get("estado");
    const summary = searchParams.get("summary") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const organizationId = searchParams.get("organizationId") || "default";

    if (summary) {
      const summaryData = await getCommissionsSummary(organizationId);
      return NextResponse.json({ data: summaryData, success: true });
    }

    const commissions = await getCommissions(organizationId, {
      businessId: businessId || undefined,
      estado: estado || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ data: commissions, success: true });
  } catch (error) {
    console.error("[API] GET /commissions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateCommissionSchema.parse(body);
    const organizationId = body.organizationId || "default";

    const commission = await createCommission(organizationId, validatedData);

    return NextResponse.json({ data: commission, success: true }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /commissions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
