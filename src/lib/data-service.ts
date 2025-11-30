const fetcher = async <T,>(resource: string): Promise<T> => {
  const response = await fetch(`/api/data/${resource}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to load ${resource}`);
  }

  return response.json();
};

export const dataService = {
  residents: () => fetcher("residents"),
  staff: () => fetcher("staff"),
  caretakers: () => fetcher("caretakers"),
  visitors: () => fetcher("visitors"),
  donations: () => fetcher("donations"),
  medical: () => fetcher("medical"),
};

