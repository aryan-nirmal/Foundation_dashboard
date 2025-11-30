"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, FieldConfig } from "@/components/data-table";
import { Visitor } from "@/types/tables";
import { dataService } from "@/lib/data-service";
import { formatDate } from "@/lib/formatters";

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
          { key: "visit_date", label: "Visit Date", render: (value) => formatDate(String(value)) },
          { key: "in_time", label: "In" },
          { key: "out_time", label: "Out" },
          { key: "purpose", label: "Purpose" },
        ]}
        formFields={formFields}
        onAdd={(values) =>
          setRows((prev) => [
            ...prev,
            { ...normalize(values), id: crypto.randomUUID() },
          ])
        }
        onEdit={(updated) =>
          setRows((prev) =>
            prev.map((row) =>
              row.id === updated.id ? { ...row, ...normalize(updated) } : row,
            ),
          )
        }
        onDelete={(id) =>
          setRows((prev) => prev.filter((row) => row.id !== id))
        }
      />
    </section>
  );
}

