export type Resident = {
  id: string;
  name: string;
  address: string;
  gender: string;
  dob: string;
  aadhar_no: string;
  pan_no: string;
  date_of_admission: string;
  date_of_leaving?: string;
  remarks?: string;
};

export type Staff = {
  id: string;
  employee_id: string;
  name: string;
  gender: string;
  age: number;
  department: string;
  role: string;
  date_of_joining: string;
  salary: number;
  working_hours: string;
  status: string;
  performance_rating: string;
};

export type Caretaker = {
  id: string;
  name: string;
  age: number;
};

export type Visitor = {
  id: string;
  name: string;
  address: string;
  contact_number: string;
  age: number;
  gender: string;
  in_time: string;
  out_time: string;
  visit_date: string;
  purpose: string;
};

export type Donation = {
  id: string;
  donor_name: string;
  age: number;
  amount: number;
  payment_method: string;
  donation_date: string;
  city: string;
};

export type MedicalRecord = {
  id: string;
  patient_name: string;
  diagnosis: string;
  gender: string;
  age: number | null;
  record_date: string;
  time_slot: string;
};

