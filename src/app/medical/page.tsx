"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable, FieldConfig } from "@/components/data-table";
import { apiClient } from "@/lib/api-client";
import { dataService } from "@/lib/data-service";
import { formatDate } from "@/lib/formatters";
import { MedicalRecord } from "@/types/tables";

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

const resource = "medical";

export default function MedicalPage() {
  const { data } = useQuery<MedicalRecord[]>({
    queryKey: ["medical"],
    queryFn: dataService.medical,
  });
  const [rows, setRows] = useState<MedicalRecord[]>([]);
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

  const normalize = (values: Omit<MedicalRecord, "id">) => ({
    ...values,
    age: values.age != null ? Number(values.age) : null,
  });

  async function handleAdd(values: Omit<MedicalRecord, "id">) {
    try {
      const payload = normalize(values);
      const created = await apiClient.create<MedicalRecord>(resource, payload);
      setRows((prev) => [...prev, created]);
    } catch (error) {
      console.error("Failed to add medical record", error);
    }
  }

  async function handleEdit(values: MedicalRecord) {
    try {
      const { id, ...rest } = values;
      const payload = normalize(rest as Omit<MedicalRecord, "id">);
      const updated = await apiClient.update<MedicalRecord>(
        resource,
        String(id),
        payload,
      );
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (error) {
      console.error("Failed to update medical record", error);
    }
  }

  async function handleDelete(id: MedicalRecord["id"]) {
    try {
      await apiClient.remove<MedicalRecord>(resource, String(id));
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Failed to delete medical record", error);
    }
  }

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
          {
            key: "record_date",
            label: "Date",
            render: (value) => formatDate(String(value)),
          },
          { key: "time_slot", label: "Time" },
        ]}
        formFields={formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
