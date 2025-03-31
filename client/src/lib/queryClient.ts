import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface RequestOptions {
  method?: string;
  url?: string;
  body?: string;
  headers?: Record<string, string>;
}

export async function apiRequest(
  urlOrOptions: string | RequestOptions,
  options?: RequestOptions
): Promise<any> {
  let url: string;
  let fetchOptions: RequestOptions = {};
  
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    fetchOptions = options || {};
  } else {
    // First argument is options object
    url = urlOrOptions.url || '';
    fetchOptions = urlOrOptions;
  }
  
  const res = await fetch(url, {
    method: fetchOptions.method || 'GET',
    headers: fetchOptions.headers || {},
    body: fetchOptions.body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Try to parse as JSON first, fall back to text
  try {
    return await res.json();
  } catch (e) {
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
