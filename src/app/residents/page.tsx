"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable, FieldConfig } from "@/components/data-table";
import { apiClient } from "@/lib/api-client";
import { dataService } from "@/lib/data-service";
import { Resident } from "@/types/tables";

const formFields: FieldConfig<Resident>[] = [
  { name: "name", label: "Full Name" },
  { name: "address", label: "Address" },
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
  { name: "dob", label: "Date of Birth", type: "date" },
  { name: "aadhar_no", label: "Aadhar Number" },
  { name: "pan_no", label: "PAN Number" },
  { name: "date_of_admission", label: "Date of Admission", type: "date" },
  { name: "date_of_leaving", label: "Date of Leaving", type: "date" },
  { name: "remarks", label: "Remarks" },
];

const resource = "residents";

export default function ResidentsPage() {
  const { data } = useQuery<Resident[]>({
    queryKey: ["residents"],
    queryFn: dataService.residents,
  });
  const [rows, setRows] = useState<Resident[]>([]);
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

  async function handleAdd(values: Omit<Resident, "id">) {
    try {
      const created = await apiClient.create<Resident>(resource, values);
      setRows((prev) => [...prev, created]);
    } catch (error) {
      console.error("Failed to add resident", error);
    }
  }

  async function handleEdit(values: Resident) {
    try {
      const { id, ...rest } = values;
      const updated = await apiClient.update<Resident>(
        resource,
        String(id),
        rest,
      );
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (error) {
      console.error("Failed to update resident", error);
    }
  }

  async function handleDelete(id: Resident["id"]) {
    try {
      await apiClient.remove<Resident>(resource, String(id));
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Failed to delete resident", error);
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900">Residents</h2>
        <p className="text-slate-600">
          Maintain resident information, admission dates, and care notes in one
          place.
        </p>
      </header>
      <DataTable
        entity="Resident"
        data={rows}
        columns={[
          { key: "name", label: "Name" },
          { key: "address", label: "Address" },
          { key: "gender", label: "Gender" },
          { key: "date_of_admission", label: "Date of Admission" },
          { key: "remarks", label: "Remarks" },
        ]}
        formFields={formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
