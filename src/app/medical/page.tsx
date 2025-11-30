"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, FieldConfig } from "@/components/data-table";
import { MedicalRecord } from "@/types/tables";
import { dataService } from "@/lib/data-service";
import { formatDate } from "@/lib/formatters";

const formFields: FieldConfig<MedicalRecord>[] = [
  { name: "patient_name", label: "Patient Name" },
  { name: "diagnosis", label: "Diagnosis / Notes" },
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
  { name: "age", label: "Age", type: "number" },
  { name: "record_date", label: "Record Date", type: "date" },
  { name: "time_slot", label: "Time Slot", type: "time" },
];

export default function MedicalPage() {
  const { data = [] } = useQuery({
    queryKey: ["medical"],
    queryFn: dataService.medical,
  });
  const [rows, setRows] = useState<MedicalRecord[]>(data);
  const dataRef = useRef<string>("");

  useEffect(() => {
    const dataString = JSON.stringify(data);
    if (dataRef.current !== dataString) {
      dataRef.current = dataString;
      setRows(data);
    }
  }, [data]);

  const normalize = (values: Omit<MedicalRecord, "id">) => ({
    ...values,
    age: Number(values.age),
  });

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900">Medical Records</h2>
        <p className="text-slate-600">
          Keep the medical visit log updated for doctors and caretakers.
        </p>
      </header>
      <DataTable
        entity="Medical Record"
        data={rows}
        columns={[
          { key: "patient_name", label: "Patient" },
          { key: "diagnosis", label: "Diagnosis" },
          { key: "record_date", label: "Date", render: (value) => formatDate(String(value)) },
          { key: "time_slot", label: "Time" },
        ]}
        formFields={formFields}
        onAdd={(values) =>
          setRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), ...(normalize(values) as MedicalRecord) },
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

