import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars");
  }
  // Clean up legacy cookies from @supabase/auth-helpers (base64-encoded)
  if (typeof document !== "undefined") {
    const all = document.cookie.split("; ");
    for (const c of all) {
      const [name, rawValue = ""] = c.split("=");
      if (name.startsWith("sb-") && decodeURIComponent(rawValue).startsWith("base64-")) {
        document.cookie = `${name}=; Max-Age=0; Path=/`;
      }
    }
  }

  const cookieAdapter: CookieOptions = {
    get(name: string) {
      if (typeof document === "undefined") return undefined;
      const match = document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${name}=`));
      return match ? decodeURIComponent(match.split("=")[1]) : undefined;
    },
    set(name, value, options) {
      if (typeof document === "undefined") return;
      let cookie = `${name}=${encodeURIComponent(value)}`;
      const opts = options ?? {};
      cookie += `; Path=${opts.path ?? "/"}`;
      if (opts.maxAge) cookie += `; Max-Age=${opts.maxAge}`;
      if (opts.expires) cookie += `; Expires=${opts.expires.toUTCString()}`;
      if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;
      if (opts.secure) cookie += `; Secure`;
      document.cookie = cookie;
    },
    remove(name, options) {
      if (typeof document === "undefined") return;
      const opts = options ?? {};
      let cookie = `${name}=`;
      cookie += `; Path=${opts.path ?? "/"}`;
      cookie += `; Max-Age=0`;
      document.cookie = cookie;
    },
  };

  return createBrowserClient(supabaseUrl, supabaseAnonKey, { cookies: cookieAdapter });
};
