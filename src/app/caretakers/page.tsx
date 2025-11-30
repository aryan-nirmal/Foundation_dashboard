"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, FieldConfig } from "@/components/data-table";
import { Caretaker } from "@/types/tables";
import { dataService } from "@/lib/data-service";

const formFields: FieldConfig<Caretaker>[] = [
  { name: "name", label: "Full Name" },
  { name: "age", label: "Age", type: "number" },
];

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

