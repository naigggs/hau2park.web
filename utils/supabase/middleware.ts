import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
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

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}