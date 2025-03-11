import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface UserRole {
  role: string;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow unprotected routes:
  // - the root page "/" (and all pages in app/(rootPage) that appear without a special prefix)
  // - /login and /auth
  if (
    !user &&
    !(
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/auth')
    )
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const userId = user.id;

    const { data: userRoles, error } = (await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)) as { data: UserRole[] | null; error: any };

    if (error || !userRoles || userRoles.length === 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/forbidden";
      return NextResponse.redirect(url);
    }

    const roles = userRoles.map((role) => role.role);

    const adminRoutes = ["/admin", "/admin/dashboard"];
    const staffRoutes = ["/staff", "/staff/dashboard"];

    if (roles.includes("User")) {
      if (adminRoutes.includes(request.nextUrl.pathname) || staffRoutes.includes(request.nextUrl.pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/forbidden";
        return NextResponse.redirect(url);
      }
    }

    if (adminRoutes.includes(request.nextUrl.pathname) && !roles.includes("Admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/forbidden";
      return NextResponse.redirect(url);
    }

    if (staffRoutes.includes(request.nextUrl.pathname) && !roles.includes("Staff")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/forbidden";
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.headers.set("user_id", userId);
    response.headers.set("user_roles", roles.join(","));
    return response;
  }

  return supabaseResponse;
}
