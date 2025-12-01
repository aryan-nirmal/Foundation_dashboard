"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable, FieldConfig } from "@/components/data-table";
import { apiClient } from "@/lib/api-client";
import { dataService } from "@/lib/data-service";
import { currency, formatDate } from "@/lib/formatters";
import { Donation } from "@/types/tables";

const formFields: FieldConfig<Donation>[] = [
  { name: "donor_name", label: "Donor Name" },
  { name: "age", label: "Age", type: "number" },
  { name: "amount", label: "Amount (INR)", type: "number" },
  {
    name: "payment_method",
    label: "Payment Method",
    type: "select",
    options: [
      { label: "Cash", value: "Cash" },
      { label: "Online", value: "Online" },
      { label: "Cheque", value: "Cheque" },
    ],
  },
  { name: "donation_date", label: "Donation Date", type: "date" },
  { name: "city", label: "City" },
];

const resource = "donations";

export default function DonationsPage() {
  const { data } = useQuery<Donation[]>({
    queryKey: ["donations"],
    queryFn: dataService.donations,
  });
  const [rows, setRows] = useState<Donation[]>([]);
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

  const normalize = (values: Omit<Donation, "id">) => ({
    ...values,
    age: Number(values.age),
    amount: Number(values.amount),
  });

  async function handleAdd(values: Omit<Donation, "id">) {
    try {
      const payload = normalize(values);
      const created = await apiClient.create<Donation>(resource, payload);
      setRows((prev) => [...prev, created]);
    } catch (error) {
      console.error("Failed to add donation", error);
    }
  }

  async function handleEdit(values: Donation) {
    try {
      const { id, ...rest } = values;
      const payload = normalize(rest as Omit<Donation, "id">);
      const updated = await apiClient.update<Donation>(
        resource,
        String(id),
        payload,
      );
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (error) {
      console.error("Failed to update donation", error);
    }
  }

  async function handleDelete(id: Donation["id"]) {
    try {
      await apiClient.remove<Donation>(resource, String(id));
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Failed to delete donation", error);
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-bold text-slate-900">Donations</h2>
        <p className="text-slate-600">
          Monitor fundraising efforts and quickly spot high-value gifts.
        </p>
      </header>
      <DataTable
        entity="Donation"
        data={rows}
        columns={[
          { key: "donor_name", label: "Donor" },
          {
            key: "amount",
            label: "Amount",
            render: (value) => currency(Number(value)),
          },
          { key: "payment_method", label: "Method" },
          {
            key: "donation_date",
            label: "Date",
            render: (value) => formatDate(String(value)),
          },
          { key: "city", label: "City" },
        ]}
        formFields={formFields}
        highlightRow={(row) => row.amount > 10000}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
