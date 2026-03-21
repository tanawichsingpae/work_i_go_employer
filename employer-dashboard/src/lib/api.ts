import { resolveEmployerIdFromSupabase } from "@/lib/supabase";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const FALLBACK_EMPLOYER_ID = (import.meta.env.VITE_EMPLOYER_ID ?? "").trim();
const ALLOW_ENV_EMPLOYER_FALLBACK = import.meta.env.DEV;
let hasWarnedMissingEmployerId = false;

async function resolveEmployerId() {

  const localEmployerId = localStorage.getItem("employer_id");
  if (localEmployerId) return localEmployerId;

  const supabaseEmployerId = await resolveEmployerIdFromSupabase();
  if (supabaseEmployerId) return supabaseEmployerId;

  if (ALLOW_ENV_EMPLOYER_FALLBACK) {
    return FALLBACK_EMPLOYER_ID;
  }

  return "";
}

async function withEmployer(path: string) {
  const employerId = await resolveEmployerId();
  const isEmployerApi = path.startsWith("/api/employer");

  if (!employerId) {
    if (!hasWarnedMissingEmployerId) {
      console.warn("Warning: No EMPLOYER_ID found. Provide employer_id in Supabase session metadata.");
      hasWarnedMissingEmployerId = true;
    }

    if (isEmployerApi) {
      throw new Error("Missing employer_id from Supabase session");
    }

    return path;
  }

  const hasQuery = path.includes("?");
  const sep = hasQuery ? "&" : "?";
  return `${path}${sep}employer_id=${encodeURIComponent(employerId)}`;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const url = await withEmployer(path);
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}