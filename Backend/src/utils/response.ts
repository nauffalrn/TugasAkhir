import type { Response } from "express";
import type { ApiResponse } from "../types";

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ ok: true, data } as ApiResponse<T>);
}

export function error(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: { code, message } } as ApiResponse);
}