"use client";

type Method = "POST" | "PUT" | "DELETE";

async function request<T>(
  resource: string,
  method: Method,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`/api/data/${resource}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ?? "Request failed.";
    throw new Error(message);
  }

  return response.json();
}

export const apiClient = {
  async create<T>(resource: string, data: Record<string, unknown>) {
    return request<T>(resource, "POST", data);
  },
  async update<T>(resource: string, id: string, data: Record<string, unknown>) {
    return request<T>(resource, "PUT", { id, ...data });
  },
  async remove<T>(resource: string, id: string) {
    return request<T>(resource, "DELETE", { id });
  },
};
