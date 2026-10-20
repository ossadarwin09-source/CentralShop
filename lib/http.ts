import { NextResponse } from "next/server";
import { StoreError } from "./store";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: unknown) {
  if (error instanceof StoreError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "No pudimos completar la operación." }, { status: 500 });
}
