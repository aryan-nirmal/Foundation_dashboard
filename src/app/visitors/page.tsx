"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable, FieldConfig } from "@/components/data-table";
import { apiClient } from "@/lib/api-client";
import { dataService } from "@/lib/data-service";
import { formatDate } from "@/lib/formatters";
import { Visitor } from "@/types/tables";

const formFields: FieldConfig<Visitor>[] = [
  { name: "name", label: "Visitor Name" },
  { name: "address", label: "Address" },
  { name: "contact_number", label: "Contact Number" },
  { name: "age", label: "Age", type: "number" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { label: "Female", value: "Female" },
      { label: "Male", value: "Male" },
      { label: "Other", value: "Other" },
    ],
  },
  { name: "in_time", label: "In Time", type: "time" },
  { name: "out_time", label: "Out Time", type: "time" },
  { name: "visit_date", label: "Visit Date", type: "date" },
  { name: "purpose", label: "Purpose" },
];

const resource = "visitors";

export default function VisitorsPage() {
  const { data } = useQuery<Visitor[]>({
    queryKey: ["visitors"],
    queryFn: dataService.visitors,
  });
  const [rows, setRows] = useState<Visitor[]>([]);
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

  const normalize = (values: Omit<Visitor, "id">) => ({
    ...values,
    age: Number(values.age),
  });

  async function handleAdd(values: Omit<Visitor, "id">) {
    try {
      const payload = normalize(values);
      const created = await apiClient.create<Visitor>(resource, payload);
      setRows((prev) => [...prev, created]);
    } catch (error) {
      console.error("Failed to add visitor", error);
    }
  }

  async function handleEdit(values: Visitor) {
    try {
      const { id, ...rest } = values;
      const payload = normalize(rest as Omit<Visitor, "id">);
      const updated = await apiClient.update<Visitor>(
        resource,
        String(id),
        payload,
      );
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (error) {
      console.error("Failed to update visitor", error);
    }
  }

  async function handleDelete(id: Visitor["id"]) {
    try {
      await apiClient.remove<Visitor>(resource, String(id));
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Failed to delete visitor", error);
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900">Visitors</h2>
        <p className="text-slate-600">
          Log every visitor for transparency and safety.
        </p>
      </header>
      <DataTable
        entity="Visitor"
        data={rows}
        columns={[
          { key: "name", label: "Name" },
          {
            key: "visit_date",
            label: "Visit Date",
            render: (value) => formatDate(String(value)),
          },
          { key: "in_time", label: "In" },
          { key: "out_time", label: "Out" },
          { key: "purpose", label: "Purpose" },
        ]}
        formFields={formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
