import type {
  Caretaker,
  Donation,
  MedicalRecord,
  Resident,
  Staff,
  Visitor,
} from "@/types/tables";

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
  residents: (): Promise<Resident[]> => fetcher<Resident[]>("residents"),
  staff: (): Promise<Staff[]> => fetcher<Staff[]>("staff"),
  caretakers: (): Promise<Caretaker[]> => fetcher<Caretaker[]>("caretakers"),
  visitors: (): Promise<Visitor[]> => fetcher<Visitor[]>("visitors"),
  donations: (): Promise<Donation[]> => fetcher<Donation[]>("donations"),
  medical: (): Promise<MedicalRecord[]> => fetcher<MedicalRecord[]>("medical"),
};

