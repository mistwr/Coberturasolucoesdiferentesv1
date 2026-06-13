import { NextRequest, NextResponse } from "next/server";
import { getTasks, getTaskById, createTask, updateTask, updateTaskStatus } from "@/lib/services/tasks";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const atribuidoA = searchParams.get("atribuidoA");
    const estado = searchParams.get("estado");
    const prioridade = searchParams.get("prioridade");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const organizationId = searchParams.get("organizationId") || "default";

    const tasks = await getTasks(organizationId, {
      atribuidoA: atribuidoA || undefined,
      estado: estado || undefined,
      prioridade: prioridade || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ data: tasks, success: true });
  } catch (error) {
    console.error("[API] GET /tasks error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateTaskSchema.parse(body);
    const organizationId = body.organizationId || "default";
    const userId = body.userId || "system";

    const task = await createTask(organizationId, userId, validatedData);

    return NextResponse.json({ data: task, success: true }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /tasks error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
