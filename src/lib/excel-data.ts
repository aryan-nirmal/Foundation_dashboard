'use server';

import fs from "node:fs";
import path from "node:path";
import type { WorkBook } from "xlsx";
import * as XLSX from "xlsx";

import type {
  Caretaker,
  Donation,
  MedicalRecord,
  Resident,
  Staff,
  Visitor,
} from "@/types/tables";

const ROOT = process.cwd();
const donationsFile = path.join(ROOT, "Donation_Dashboard_Updated.xlsx");
const cepFile = path.join(ROOT, "CEP 2025 (AASTHA FOUNDATION).xlsx");
const medicalFile = path.join(ROOT, "Patient_Records (1).xlsx");

// Verify files exist on first load
function verifyFiles() {
  const files = [
    { name: "Donations", path: donationsFile },
    { name: "CEP", path: cepFile },
    { name: "Medical", path: medicalFile },
  ];
  
  files.forEach(({ name, path: filePath }) => {
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${name} file found: ${filePath}`);
    } else {
      console.error(`✗ ${name} file NOT found: ${filePath}`);
      console.error(`  Current working directory: ${ROOT}`);
    }
  });
}

// Call verification (will run when module loads)
verifyFiles();

interface CachedWorkbook {
  workbook: WorkBook;
  mtime: number;
}

const workbookCache = new Map<string, CachedWorkbook>();

const SHEET_OPTIONS = { defval: "", raw: false };

function loadWorkbook(filePath: string): WorkBook {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Excel file not found: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file modification time
    const stats = fs.statSync(filePath);
    const mtime = stats.mtimeMs;

    // Check if cache is valid (file hasn't been modified)
    const cached = workbookCache.get(filePath);
    if (cached && cached.mtime === mtime) {
      return cached.workbook;
    }

    // Load or reload workbook
    console.log(`Loading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    
    // Update cache with new mtime
    workbookCache.set(filePath, { workbook, mtime });
    
    return workbook;
  } catch (error) {
    console.error(`Error loading workbook from ${filePath}:`, error);
    throw error;
  }
}

function getRows<T extends Record<string, unknown>>(
  filePath: string,
  sheetName: string,
): T[] {
  try {
    const workbook = loadWorkbook(filePath);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.warn(`Sheet "${sheetName}" not found in ${filePath}. Available sheets:`, workbook.SheetNames);
      return [];
    }
    const rows = XLSX.utils.sheet_to_json<T>(sheet, SHEET_OPTIONS);
    console.log(`Loaded ${rows.length} rows from sheet "${sheetName}" in ${path.basename(filePath)}`);
    return rows;
  } catch (error) {
    console.error(`Error reading rows from ${filePath}, sheet "${sheetName}":`, error);
    return [];
  }
}

const EXCEL_EPOCH = Date.UTC(1899, 11, 30);

function excelDateToISO(value: unknown): string {
  const parsed = parseExcelDate(value);
  if (!parsed) return "";
  if (parsed.getFullYear() > 2100 || parsed.getFullYear() < 1900) return "";
  return parsed.toISOString().slice(0, 10);
}

function parseExcelDate(value: unknown): Date | null {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const timestamp = EXCEL_EPOCH + value * 24 * 60 * 60 * 1000;
    return new Date(timestamp);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) return parsed;
  }
  return null;
}

function excelTimeToString(value: unknown): string {
  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function normalizeGender(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text) return "";
  const letter = text[0].toLowerCase();
  if (letter === "m") return "Male";
  if (letter === "f") return "Female";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function splitGenderAge(value: unknown): { age: number | null; gender: string } {
  if (!value) return { age: null, gender: "" };
  const text = String(value).trim();
  if (!text) return { age: null, gender: "" };
  const match = text.match(/(\d+)\s*\/\s*([a-zA-Z]+)/);
  if (match) {
    return {
      age: Number(match[1]),
      gender: normalizeGender(match[2]),
    };
  }
  if (/^\d+$/.test(text)) {
    return { age: Number(text), gender: "" };
  }
  return { age: null, gender: normalizeGender(text) };
}

function cleanString(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function describeRating(value: number) {
  if (value >= 4.5) return "Excellent";
  if (value >= 3) return "Good";
  if (value > 0) return "Needs Support";
  return "Unrated";
}

export async function getResidents(): Promise<Resident[]> {
  try {
    const rows = getRows<Record<string, unknown>>(cepFile, "RESIDENT DETAILS");
    const residents = rows
      .filter((row) => row.NAME)
      .map((row, index) => ({
        id: `resident-${index + 1}`,
        name: cleanString(row.NAME),
        address: cleanString(row.ADDRESS),
        gender: normalizeGender(row.GENDER),
        dob: excelDateToISO(row.DOB),
        aadhar_no: cleanString(row["AADHAR NO."]),
        pan_no: cleanString(row.PAN),
        date_of_admission: excelDateToISO(row.DOA),
        date_of_leaving: excelDateToISO(row.DOL),
        remarks: cleanString(row.REMARKS),
      }));
    console.log(`Processed ${residents.length} residents`);
    return residents;
  } catch (error) {
    console.error("Error getting residents:", error);
    return [];
  }
}

export async function getStaff(): Promise<Staff[]> {
  try {
    const rows = getRows<Record<string, unknown>>(cepFile, "WORKING STAFF");
    const staff = rows
      .filter((row) => row.Name)
      .map((row, index) => ({
        id: `staff-${index + 1}`,
        employee_id: cleanString(row["Employee ID"]),
        name: cleanString(row.Name),
        gender: normalizeGender(row.Gender),
        age: Number(row.Age) || 0,
        department: cleanString(row.Department),
        role: cleanString(row.Role),
        date_of_joining: excelDateToISO(row["Date of Joining"]),
        salary: Number(row["Monthly Salary (₹)"]) || 0,
        working_hours: cleanString(row["Working Hours"]),
        status: cleanString(row.Status) || "Active",
        performance_rating: describeRating(
          Number(row["Performance Rating"]) || 0,
        ),
      }));
    console.log(`Processed ${staff.length} staff members`);
    return staff;
  } catch (error) {
    console.error("Error getting staff:", error);
    return [];
  }
}

export async function getCaretakers(): Promise<Caretaker[]> {
  try {
    const rows = getRows<Record<string, unknown>>(cepFile, "CARETAKERS");
    const caretakers = rows
      .map((row) => ({
        name:
          cleanString(row["AASTHA FOUNDATION "]) ||
          cleanString(row.Name) ||
          cleanString(row["Name "]),
        age: Number(row.__EMPTY ?? row.Age ?? row["Age "]) || 0,
      }))
      .filter((row) => row.name && row.age)
      .map((row, index) => ({
        id: `caretaker-${index + 1}`,
        ...row,
      }));
    console.log(`Processed ${caretakers.length} caretakers`);
    return caretakers;
  } catch (error) {
    console.error("Error getting caretakers:", error);
    return [];
  }
}

export async function getVisitors(): Promise<Visitor[]> {
  try {
    const rows = getRows<Record<string, unknown>>(
      cepFile,
      "Visitor Management system ",
    );
    const visitors = rows
      .filter((row) => row.Name)
      .map((row, index) => ({
        id: `visitor-${index + 1}`,
        name: cleanString(row.Name),
        address: cleanString(row["Address "] ?? row.Address),
        contact_number: cleanString(row["Contact number "] ?? row["Contact Number"]),
        age: Number(row.Age) || 0,
        gender: normalizeGender(row["Gender "] ?? row.Gender),
        in_time: excelTimeToString(row["In time"]),
        out_time: excelTimeToString(row["Out time"]),
        visit_date: excelDateToISO(row["Date of visit "]),
        purpose: cleanString(row["Purpose of visit "] ?? row.Purpose),
      }));
    console.log(`Processed ${visitors.length} visitors`);
    return visitors;
  } catch (error) {
    console.error("Error getting visitors:", error);
    return [];
  }
}

export async function getDonations(): Promise<Donation[]> {
  try {
    const rows = getRows<Record<string, unknown>>(donationsFile, "Donation_Data");
    const donations = rows.map((row, index) => ({
      id: `donation-${index + 1}`,
      donor_name: cleanString(row.Name),
      age: Number(row.Age) || 0,
      amount: Number(row["Donation Amount (₹)"]) || 0,
      payment_method: cleanString(row["Payment Method"]),
      donation_date: excelDateToISO(row["Donation Date"]),
      city: cleanString(row.City),
    }));
    console.log(`Processed ${donations.length} donations`);
    return donations;
  } catch (error) {
    console.error("Error getting donations:", error);
    return [];
  }
}

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  try {
    const rows = getRows<Record<string, unknown>>(medicalFile, "Sheet1");
    const records = rows
      .filter((row) => row.Name)
      .map((row, index) => {
        const { age, gender } = splitGenderAge(row["Gender/Age"]);
        return {
          id: `medical-${index + 1}`,
          patient_name: cleanString(row.Name),
          diagnosis: cleanString(row["Diagnosis/Condition"]),
          gender,
          age,
          record_date: excelDateToISO(row.Date),
          time_slot: cleanString(row.Time),
        };
      });
    console.log(`Processed ${records.length} medical records`);
    return records;
  } catch (error) {
    console.error("Error getting medical records:", error);
    return [];
  }
}

// Function to clear the workbook cache (useful for forcing reload after file updates)
export async function clearWorkbookCache() {
  workbookCache.clear();
  console.log("Workbook cache cleared");
}

