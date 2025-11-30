"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Edit3, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Modal } from "./modal";

export type Column<T> = {
  key: keyof T;
  label: string;
  className?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type FieldConfig<T> = {
  name: keyof T;
  label: string;
  type?: "text" | "number" | "date" | "time" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
};

type BaseRow = {
  id: string | number;
};

type DataTableProps<T extends BaseRow> = {
  entity: string;
  data: T[];
  columns: Column<T>[];
  formFields: FieldConfig<T>[];
  onAdd: (values: Omit<T, "id">) => void;
  onEdit: (values: T) => void;
  onDelete: (id: T["id"]) => void;
  highlightRow?: (row: T) => boolean;
};

export function DataTable<T extends BaseRow>({
  entity,
  data,
  columns,
  formFields,
  onAdd,
  onEdit,
  onDelete,
  highlightRow,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (modalMode === "edit" && activeRow) {
      const values = Object.fromEntries(
        formFields.map((field) => [
          field.name as string,
          String(activeRow[field.name] ?? ""),
        ]),
      );
      setFormState(values);
    } else if (modalMode === "add") {
      const defaults = Object.fromEntries(
        formFields.map((field) => [field.name as string, ""]),
      );
      setFormState(defaults);
    }
  }, [modalMode, activeRow, formFields]);

  const filteredData = useMemo(() => {
    const lower = searchValue.toLowerCase();
    const list = data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(lower),
      ),
    );

    if (!sortKey) return list;

    return [...list].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (valueA === valueB) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;
      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      return direction === "asc" ? 1 : -1;
    });
  }, [data, direction, searchValue, sortKey]);

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("asc");
    }
  }

  function handleFormChange(name: string, value: string) {
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event?: React.FormEvent) {
    if (event) {
      event.preventDefault();
    }
    
    if (modalMode === "add") {
      onAdd(formState as unknown as Omit<T, "id">);
    } else if (modalMode === "edit" && activeRow) {
      onEdit({
        ...activeRow,
        ...formState,
      } as unknown as T);
    }
    closeModal();
  }

  function closeModal() {
    setModalMode(null);
    setActiveRow(null);
  }

  function openAdd() {
    setModalMode("add");
    setActiveRow(null);
  }

  function openEdit(row: T) {
    setActiveRow(row);
    setModalMode("edit");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={`Search ${entity}`}
            className="pl-12 text-lg"
            aria-label={`Search ${entity}`}
          />
        </div>
        <Button
          onClick={openAdd}
          className="w-full md:w-auto"
          aria-label={`Add new ${entity}`}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Record
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="min-w-full divide-y divide-border text-lg">
          <thead className="bg-brand-light text-left text-sm font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => handleSort(column.key)}
                  className={cn(
                    "cursor-pointer px-5 py-4",
                    column.className,
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortKey === column.key && (
                      <span className="text-xs">
                        {direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-base text-slate-900">
            {filteredData.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors hover:bg-slate-50",
                  highlightRow?.(row) && "bg-green-50",
                )}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-5 py-4">
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "—")}
                  </td>
                ))}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-full p-0 text-slate-600 hover:text-brand"
                      onClick={() => openEdit(row)}
                      aria-label={`Edit ${entity}`}
                    >
                      <Edit3 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-full p-0 text-red-500 hover:bg-red-50"
                      onClick={() => onDelete(row.id)}
                      aria-label={`Delete ${entity}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-8 text-center text-slate-500">
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!modalMode}
        title={`${modalMode === "add" ? "Add" : "Edit"} ${entity}`}
        onClose={closeModal}
        footer={
          <>
            <Button 
              type="button"
              variant="ghost" 
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form={`data-table-form-${entity}`}
            >
              {modalMode === "add" ? "Save Record" : "Save Changes"}
            </Button>
          </>
        }
      >
        <form 
          id={`data-table-form-${entity}`}
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {formFields.map((field) => (
            <div key={String(field.name)} className="space-y-2">
              <Label htmlFor={String(field.name)}>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  id={String(field.name)}
                  value={formState[field.name as string] ?? ""}
                  onChange={(event) =>
                    handleFormChange(field.name as string, event.target.value)
                  }
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={String(field.name)}
                  type={field.type ?? "text"}
                  value={formState[field.name as string] ?? ""}
                  onChange={(event) =>
                    handleFormChange(field.name as string, event.target.value)
                  }
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </form>
      </Modal>
    </div>
  );
}

