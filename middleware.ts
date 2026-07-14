import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_SOLO_ADMIN = ["/panel/admin"];
const RUTAS_SUPERVISOR_O_ADMIN = ["/panel/reportes/equipo"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/panel")) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // No proteger la propia página de login para evitar loop de redirección
  if (pathname === "/panel/login") return response;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, activo_asesor")
    .eq("id", user.id)
    .single();

  if (!perfil || !perfil.activo_asesor) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel/sin-acceso";
    return NextResponse.redirect(url);
  }

  const necesitaAdmin = RUTAS_SOLO_ADMIN.some((r) => pathname.startsWith(r));
  const necesitaSupervisor = RUTAS_SUPERVISOR_O_ADMIN.some((r) => pathname.startsWith(r));

  if (necesitaAdmin && perfil.rol !== "admin") {
    return NextResponse.redirect(new URL("/panel/sin-acceso", request.url));
  }
  if (necesitaSupervisor && !["admin", "supervisor"].includes(perfil.rol)) {
    return NextResponse.redirect(new URL("/panel/sin-acceso", request.url));
  }

  // Log de acceso (no bloqueante — falla en silencio si RLS lo impide)
  supabase.from("panel_accesos").insert({
    user_id: user.id,
    ip: request.headers.get("x-forwarded-for") ?? null,
    user_agent: request.headers.get("user-agent") ?? null,
  }).then(() => {});

  return response;
}

export const config = {
  matcher: ["/panel/:path*"],
};
