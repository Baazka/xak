let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    // 1️⃣ refresh нэг л удаа
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        isRefreshing = false;
      });
    }

    try {
      await refreshPromise;
    } catch {
      window.location.href = "/signin";
      throw new Error("Session expired");
    }

    // 2️⃣ дахин оролдоно
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });

    // 3️⃣ дахин 401 бол жинхэнэ logout
    if (res.status === 401) {
      window.location.href = "/signin";
    }
  }

  return res;
}
