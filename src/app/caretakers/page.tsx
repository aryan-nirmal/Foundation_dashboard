"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable, FieldConfig } from "@/components/data-table";
import { apiClient } from "@/lib/api-client";
import { dataService } from "@/lib/data-service";
import { Caretaker } from "@/types/tables";

const formFields: FieldConfig<Caretaker>[] = [
  { name: "name", label: "Full Name" },
  { name: "age", label: "Age", type: "number" },
];

const resource = "caretakers";

export default function CaretakersPage() {
  const { data } = useQuery<Caretaker[]>({
    queryKey: ["caretakers"],
    queryFn: dataService.caretakers,
  });
  const [rows, setRows] = useState<Caretaker[]>([]);
  const dataRef = useRef<string>("");

  useEffect(() => {
    if (data) {
      const dataString = JSON.stringify(data);
      if (dataRef.current !== dataString) {
        dataRef.current = dataString;
        setRows(data);
      }
    }
  }, [data]);

  const normalize = (values: Omit<Caretaker, "id">) => ({
    ...values,
    age: Number(values.age),
  });

  async function handleAdd(values: Omit<Caretaker, "id">) {
    try {
      const payload = normalize(values);
      const created = await apiClient.create<Caretaker>(resource, payload);
      setRows((prev) => [...prev, created]);
    } catch (error) {
      console.error("Failed to add caretaker", error);
    }
  }

  async function handleEdit(values: Caretaker) {
    try {
      const { id, ...rest } = values;
      const payload = normalize(rest as Omit<Caretaker, "id">);
      const updated = await apiClient.update<Caretaker>(
        resource,
        String(id),
        payload,
      );
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (error) {
      console.error("Failed to update caretaker", error);
    }
  }

  async function handleDelete(id: Caretaker["id"]) {
    try {
      await apiClient.remove<Caretaker>(resource, String(id));
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Failed to delete caretaker", error);
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900">Caretakers</h2>
        <p className="text-slate-600">
          Easily keep the caretaker roster updated and reachable.
        </p>
      </header>
      <DataTable
        entity="Caretaker"
        data={rows}
        columns={[
          { key: "name", label: "Name" },
          { key: "age", label: "Age" },
        ]}
        formFields={formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
