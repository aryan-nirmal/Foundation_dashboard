"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, FieldConfig } from "@/components/data-table";
import { Staff } from "@/types/tables";
import { dataService } from "@/lib/data-service";

const formFields: FieldConfig<Staff>[] = [
  { name: "employee_id", label: "Employee ID" },
  { name: "name", label: "Full Name" },
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
  { name: "department", label: "Department" },
  { name: "role", label: "Role" },
  { name: "date_of_joining", label: "Date of Joining", type: "date" },
  { name: "salary", label: "Monthly Salary", type: "number" },
  { name: "working_hours", label: "Working Hours" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "Active" },
      { label: "Retired", value: "Retired" },
    ],
  },
  {
    name: "performance_rating",
    label: "Performance Rating",
    type: "select",
    options: [
      { label: "Unrated", value: "Unrated" },
      { label: "Excellent", value: "Excellent" },
      { label: "Good", value: "Good" },
      { label: "Needs Support", value: "Needs Support" },
    ],
  },
];

export default function StaffPage() {
  const { data } = useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: dataService.staff,
  });
  const [rows, setRows] = useState<Staff[]>([]);
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

  function normalize(values: Omit<Staff, "id">) {
    return {
      ...values,
      age: Number(values.age),
      salary: Number(values.salary),
    };
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900">Staff</h2>
        <p className="text-slate-600">
          Track staff availability, roles, and performance ratings.
        </p>
      </header>
      <DataTable
        entity="Staff Member"
        data={rows}
        columns={[
          { key: "employee_id", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "department", label: "Department" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status" },
        ]}
        formFields={formFields}
        onAdd={(values) =>
          setRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), ...(normalize(values) as Staff) },
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

