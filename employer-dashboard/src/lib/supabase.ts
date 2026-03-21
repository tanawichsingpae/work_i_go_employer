import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

let cachedClient: SupabaseClient | null = null;

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  try {
    return atob(`${normalized}${padding}`);
  } catch {
    return "";
  }
}

function parseJwtClaims(token: string | undefined) {
  if (!token) return null;

  const segments = token.split(".");
  if (segments.length < 2) return null;

  try {
    return JSON.parse(base64UrlDecode(segments[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getEmployerIdFromCandidate(candidate: unknown) {
  if (typeof candidate !== "string") return null;

  const value = candidate.trim();
  return value ? value : null;
}

function getEmployerIdFromRecord(record: unknown) {
  if (!record || typeof record !== "object") return null;

  const source = record as Record<string, unknown>;

  return (
    getEmployerIdFromCandidate(source.employer_id)
    || getEmployerIdFromCandidate(source.employerId)
    || null
  );
}

function getEmployerIdFromSession(session: Session | null) {
  if (!session) return null;

  const tokenClaims = parseJwtClaims(session.access_token);

  return (
    getEmployerIdFromRecord(session.user?.app_metadata)
    || getEmployerIdFromRecord(session.user?.user_metadata)
    || getEmployerIdFromRecord(tokenClaims?.app_metadata)
    || getEmployerIdFromRecord(tokenClaims?.user_metadata)
    || getEmployerIdFromCandidate(tokenClaims?.employer_id)
    || null
  );
}

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return cachedClient;
}

export async function resolveEmployerIdFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn("Warning: Failed to read Supabase session", error.message);
      return null;
    }

    return getEmployerIdFromSession(data.session);
  } catch (error) {
    console.warn("Warning: Unexpected Supabase session error", error);
    return null;
  }
}