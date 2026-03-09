import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    status: 200,
    ...init,
  });
}

export function jsonCreated<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    status: 201,
    ...init,
  });
}

export function jsonError(
  status: number,
  error: string,
  details?: unknown,
  init?: ResponseInit
) {
  return NextResponse.json(
    {
      error,
      ...(details !== undefined ? { details } : {}),
    },
    {
      status,
      ...init,
    }
  );
}