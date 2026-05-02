import axios from "axios";
import {
  companiesType,
  CvUploadPayload,
  CvUploadResponse,
  EligibleInternshipsPayload,
  FormType,
  InternshipCompany,
  RegisterStudentResponse,
  RegistrationPayload,
  StudentLookupPayload,
  StudentLookupResponse,
  StudentType,
  StudentTypeWithInterview,
  SubmitInternshipPreferencesPayload,
  SubmitInternshipPreferencesResponse,
  SubmitPstPayload,
  SubmitPstResponse,
  PstQuestion,
} from "../types/form";
// import { QuestionType } from "../pages/Quiz";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(
  /\/+$/,
  ""
);
const apiBaseUrl = configuredApiBaseUrl
  ? configuredApiBaseUrl.endsWith("/api")
    ? configuredApiBaseUrl
    : `${configuredApiBaseUrl}/api`
  : "/api";
const useMockApi =
  import.meta.env.VITE_USE_MOCK_API === "true" ||
  (!configuredApiBaseUrl && import.meta.env.DEV);
const mockApiBaseUrl = `${import.meta.env.BASE_URL}mock-api`;

const appBaseUrl = apiBaseUrl.endsWith("/api")
  ? apiBaseUrl.slice(0, -4)
  : apiBaseUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
  },
});

type DataEnvelope<T> = T | { data: T };

function unwrapData<T>(payload: DataEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function fetchMockJson<T>(fileName: string): Promise<T> {
  const response = await fetch(`${mockApiBaseUrl}/${fileName}`);

  if (!response.ok) {
    throw new Error(`Failed to load mock API file: ${fileName}`);
  }

  return response.json() as Promise<T>;
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }

  const data = error.response?.data;

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (Array.isArray(data?.errors)) {
    return data.errors.join(" ");
  }

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors)
      .flat()
      .find((message) => typeof message === "string");

    if (firstError) return firstError;
  }

  return error.message || "Something went wrong";
}

export function resolveStorageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = path.replace(/^\/+/, "");

  // Mock API assets
  if (cleanPath.startsWith("mock-api/")) {
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  }

  // Paths served directly at frontend root (not from API)
  // e.g. pattern_questions_package_v2/images/image1.jpeg -> /images/image1.jpeg
  // e.g. images/image26.png -> /images/image26.png
  if (/^pattern_questions_package/i.test(cleanPath)) {
    const shortPath = cleanPath.replace(/^pattern_questions_package[^/]*\//i, "");
    return `${import.meta.env.BASE_URL}${shortPath}`;
  }
  
  if (cleanPath.startsWith("images/")) {
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  }

  // Default: Laravel /storage/
  return `${appBaseUrl}/storage/${cleanPath}`;
}

export async function registerStudent(
  payload: RegistrationPayload
): Promise<RegisterStudentResponse> {
  if (useMockApi) {
    void payload;
    return fetchMockJson<RegisterStudentResponse>("student-register.json");
  }

  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("national_id", payload.national_id);
  formData.append("experience", payload.experience);
  if (payload.major_id) {
    formData.append("major_id", String(payload.major_id));
  }
  formData.append("year_id", String(payload.year_id));
  
  if (payload.university_id) {
    formData.append("university_id", String(payload.university_id));
  }
  if (payload.faculty_id) {
    formData.append("faculty_id", String(payload.faculty_id));
  }
  if (payload.other_university) {
    formData.append("other_university", payload.other_university);
  }
  if (payload.other_faculty) {
    formData.append("other_faculty", payload.other_faculty);
  }
  if (payload.other_major) {
    formData.append("other_major", payload.other_major);
  }
  
  formData.append("program", payload.program);
  formData.append("event_source", payload.event_source);
  formData.append("cv", payload.cv);
  if (payload.referral_code) {
    formData.append("referral_code", payload.referral_code);
  }

  const response = await api.post<RegisterStudentResponse>(
    "/students",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function lookupStudent(
  payload: StudentLookupPayload
): Promise<StudentLookupResponse> {
  if (useMockApi) {
    const mockFile =
      localStorage.getItem("premium26PstComplete") === "true" ||
      payload.identifier.toLowerCase().includes("selection")
        ? "student-lookup-selection.json"
        : "student-lookup.json";

    return fetchMockJson<StudentLookupResponse>(mockFile);
  }

  const response = await api.post<DataEnvelope<StudentLookupResponse>>(
    "/students/lookup",
    payload
  );
  return unwrapData(response.data);
}

export async function fetchPstQuestions(): Promise<PstQuestion[]> {
  if (useMockApi) {
    const response = await fetchMockJson<DataEnvelope<PstQuestion[]>>(
      "pst-questions.json"
    );
    return unwrapData(response);
  }

  const response = await api.get<DataEnvelope<PstQuestion[]>>(
    "/pst/questions"
  );
  return unwrapData(response.data);
}

export async function submitPstAnswers(
  payload: SubmitPstPayload
): Promise<SubmitPstResponse> {
  if (useMockApi) {
    void payload;
    return fetchMockJson<SubmitPstResponse>("pst-submit.json");
  }

  const response = await api.post<SubmitPstResponse>("/pst/answers", payload);
  return response.data;
}

export async function uploadCvForPremium26({
  id,
  token,
  cv,
}: CvUploadPayload): Promise<CvUploadResponse> {
  if (useMockApi) {
    void id;
    void token;
    void cv;
    return fetchMockJson<CvUploadResponse>("cv-upload.json");
  }

  const formData = new FormData();
  formData.append("id", String(id));
  formData.append("token", token);
  formData.append("cv", cv);

  const response = await api.post<CvUploadResponse>(
    "/students/add_cv",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function fetchEligibleInternships(
  payload: EligibleInternshipsPayload
): Promise<InternshipCompany[]> {
  if (useMockApi) {
    void payload;
    const response = await fetchMockJson<DataEnvelope<InternshipCompany[]>>(
      "internships.json"
    );
    return unwrapData(response);
  }

  const response = await api.get<DataEnvelope<InternshipCompany[]>>(
    "/interns/eligible",
    { params: payload }
  );
  return unwrapData(response.data);
}

export async function submitInternshipPreferences(
  payload: SubmitInternshipPreferencesPayload
): Promise<SubmitInternshipPreferencesResponse> {
  if (useMockApi) {
    void payload;
    return fetchMockJson<SubmitInternshipPreferencesResponse>(
      "internship-submit.json"
    );
  }

  const response = await api.post<SubmitInternshipPreferencesResponse>(
    "/internships/preferences",
    payload
  );
  return response.data;
}

// ── QR mail ──
export type QrStepName = "cv_upload" | "pst" | "companies" | "interview_slot";

export interface SendQrMailPayload {
  name: QrStepName;
  student_id: number;
  token?: string;
}

export async function sendQrMail(
  payload: SendQrMailPayload
): Promise<void> {
  if (useMockApi) return; // silently skip in mock mode

  const fullBase = "https://apeceg.com/APEC26_Premium_main";

  await api.post("/mail/qr", {
    step: payload.name,
    student_id: payload.student_id,
    token: payload.token,
    base_url: fullBase,
  });
}

export type EligibleQrStep = "cv_upload" | "pst" | "companies";

export interface SendEligibleQrPayload {
  message?: string;
  step: EligibleQrStep;
  base_url?: string;
}

export interface SendEligibleQrResponse {
  success: boolean;
  summary: {
    sent: number;
    failed: number;
    total_eligible: number;
  };
  results: {
    email: string;
    status: string;
  }[];
}

export async function sendQrMailToEligible(
  payload: SendEligibleQrPayload
): Promise<SendEligibleQrResponse> {
  if (useMockApi) {
    return {
      success: true,
      summary: { sent: 10, failed: 0, total_eligible: 10 },
      results: [],
    };
  }

  const fullBase = "https://apeceg.com/APEC26_Premium_main";

  const response = await api.post<SendEligibleQrResponse>("/mail/qr/eligible", {
    message: payload.message,
    step: payload.step,
    base_url: payload.base_url || fullBase,
  });

  return response.data;
}

// ── Admin student list (Premium 26) ──
export type AdminStudentStatus =
  | "test"
  | "selection"
  | "rejected"
  | "waiting1"
  | "waiting2"
  | "accepted"
  | string;

export type AdminStudent = {
  id: number;
  name: string;
  email: string;
  phone: string;
  national_id: string;
  experience: string;
  referral_code?: string | null;
  token: string;
  status: AdminStudentStatus;
  major_id?: number;
  other_major?: string | null;
  university_id?: number;
  other_university?: string | null;
  faculty_id?: number;
  other_faculty?: string | null;
  year_id?: number;
  program?: string;
  event_source?: string;
  cv_id?: string | null;
  created_at?: string;
  updated_at?: string;
  pst_score?: number | null;
  pst_raw_score?: number | null;
  pst_total_questions?: number | null;
  pst_result?: {
    score: number;
    total_questions: number;
    percentage: number;
    submitted_at: string;
  } | null;
  internship_preferences?: {
    rank: number;
    company_name: string;
  }[];
  first_preference?: number | null;
  first_preference_name?: string | null;
  second_preference?: number | null;
  second_preference_name?: string | null;
  third_preference?: number | null;
  third_preference_name?: string | null;
};

export type AdminStudentsResponse = {
  data: AdminStudent[];
  total: number;
  last_page: number;
  current_page: number;
};

export async function fetchAdminStudents(params?: {
  search?: string;
  university_id?: number;
  faculty_id?: number;
  major_id?: number;
  year_id?: number;
  status?: string;
  first_preference?: number;
  second_preference?: number;
  third_preference?: number;
  per_page?: number;
  page?: number;
}): Promise<AdminStudentsResponse> {
  if (useMockApi) {
    const data = await fetchMockJson<AdminStudent[]>("admin-students.json").catch(() => []);
    return {
      data,
      total: data.length,
      last_page: 1,
      current_page: 1,
    };
  }
  const response = await api.get<{ 
    data: AdminStudent[];
    meta?: { total: number; last_page: number; current_page: number };
    total?: number;
    last_page?: number;
    current_page?: number;
  }>("/students/admin", { params: params ?? {} });

  const raw = response.data;
  
  // Handle different Laravel pagination formats
  if (raw.meta) {
    return {
      data: raw.data,
      total: raw.meta.total,
      last_page: raw.meta.last_page,
      current_page: raw.meta.current_page,
    };
  }

  return {
    data: Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []),
    total: raw.total ?? (Array.isArray(raw) ? raw.length : 0),
    last_page: raw.last_page ?? 1,
    current_page: raw.current_page ?? 1,
  };
}

export async function resetPst(id: number): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>(`/students/admin/${id}/reset-pst`);
  return response.data;
}

// ── Academic Catalog ──
export type CatalogItem = { id: number; name: string };
export type MajorItem  = CatalogItem & { faculty_id: number };

async function fetchCatalog<T>(path: string, params?: Record<string, unknown>): Promise<T[]> {
  if (useMockApi) return [];
  const res = await api.get<{ data: T[] }>(path, { params });
  return res.data.data ?? (res.data as unknown as T[]);
}

export const fetchUniversities = () => fetchCatalog<CatalogItem>("/universities");
export const fetchFaculties    = () => fetchCatalog<CatalogItem>("/faculties");
export const fetchYears        = () => fetchCatalog<CatalogItem>("/years");
export const fetchMajors       = (faculty_id?: number) =>
  fetchCatalog<MajorItem>("/majors", faculty_id ? { faculty_id } : undefined);

export interface CompanyItem {
  id: number;
  name: string;
  industry: string;
  is_available: boolean;
  majors?: { id: number; name: string }[];
}

export const fetchCompanies = (major_id?: number, year_id?: number) =>
  fetchCatalog<CompanyItem>("/companies", major_id ? { major_id, year_id } : undefined);

export interface QuizResponse {
  score: string;
  total: number;
  results: {
    [key: string]: number;
  };
}
export interface QuizErrorResponse {
  error: string;
}

export async function fetchQuiz(hash_code: string) {
  try {
    const res = await axios.get(
      `https://apeceg.com/Events2025/quiz_api.php?action=quiz&hash_code=${hash_code}`
    );

    if (res.status !== 200 || !res.data) {
      throw new Error("Failed to fetch Quiz");
    }

    return res.data;
  } catch (error) {
    console.error("Error fetching Quiz", error);
    throw error;
  }
}

export async function addQuiz({
  hash_code,
  answersIndex,
}: {
  hash_code: string;
  answersIndex: Record<number, string>;
}): Promise<QuizResponse | QuizErrorResponse> {
  const body = { hash_code, ...answersIndex };
  const res = await axios.post(
    "https://apeceg.com/Events2025/quiz_api.php?action=correct",
    body
  );
  if (res.status !== 200 || !res.data) {
    throw new Error("Failed to fetch quiz");
  }
  if (res.data.error) {
    throw new Error("Quiz has already been submitted or requested.");
  }

  return res.data;
}

export async function getCompanies(
  major: string,
  year: string
): Promise<companiesType[]> {
  try {
    const response = await axios.get(
      `https://apeceg.com/Events2025/get_companies.php?major=${major}&year=${year}`
    );
    if (response.status !== 200 || !response.data) {
      throw new Error("Failed to fetch companies");
    }
    return response.data.companies;
  } catch (error) {
    console.error("Error fetching companies try later");
    throw error;
  }
}

// ── Interns Management ──
export type InternStatus = "active" | "completed" | "cancelled" | string;

export interface Intern {
  id: number;
  student_id: number;
  company_id: number;
  major_id: number;
  status: InternStatus;
  started_at: string;
  ended_at: string;
  student_name: string;
  student_email: string;
  company_name: string;
  company_industry: string;
  major_name: string;
  year_name: string;
}

export interface InternsResponse {
  data: Intern[];
  total?: number;
  last_page?: number;
  current_page?: number;
}

export async function fetchInterns(params?: {
  company_id?: number;
  student_id?: number;
  status?: string;
  major_id?: number;
  year_id?: number;
  per_page?: number;
  page?: number;
}): Promise<InternsResponse> {
  if (useMockApi) {
    const response = await fetchMockJson<InternsResponse>("interns.json").catch(() => ({ data: [] }));
    return response;
  }
  const response = await api.get<InternsResponse>("/interns", { params: params ?? {} });
  return response.data;
}

export async function createIntern(data: {
  student_id: number;
  company_id: number;
  major_id: number;
  status: string;
  started_at: string;
  ended_at: string;
}): Promise<{ data: Intern }> {
  if (useMockApi) {
    void data;
    return { data: { ...data, id: Date.now(), student_name: "Student", student_email: "student@test.com", company_name: "Company", company_industry: "Tech", major_name: "CS", year_name: "3rd Year" } };
  }
  const response = await api.post<{ data: Intern }>("/interns", data);
  return response.data;
}

export async function updateIntern(
  id: number,
  data: {
    status?: string;
    started_at?: string;
    ended_at?: string;
  }
): Promise<{ data: Intern }> {
  if (useMockApi) {
    void id;
    void data;
    return { data: { id, student_id: 1, company_id: 1, major_id: 1, status: data.status || "active", started_at: data.started_at || "2026-01-01", ended_at: data.ended_at || "2026-03-01", student_name: "Student", student_email: "student@test.com", company_name: "Company", company_industry: "Tech", major_name: "CS", year_name: "3rd Year" } };
  }
  const response = await api.put<{ data: Intern }>(`/interns/${id}`, data);
  return response.data;
}

export async function deleteIntern(id: number): Promise<{ message: string }> {
  if (useMockApi) {
    void id;
    return { message: "Intern deleted successfully." };
  }
  const response = await api.delete<{ message: string }>(`/interns/${id}`);
  return response.data;
}

export interface EligibleStudent {
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  major_name: string;
  year_name: string;
  pst_percentage: number;
  pst_score: number;
  eligible_companies: {
    id: number;
    name: string;
    industry: string;
  }[];
}

export async function fetchEligibleStudents(company_id?: number): Promise<EligibleStudent[]> {
  if (useMockApi) {
    const response = await fetchMockJson<{ data: EligibleStudent[] }>("eligible-students.json").catch(() => ({ data: [] }));
    return unwrapData(response);
  }
  const response = await api.get<{ data: EligibleStudent[] }>("/interns/eligible", {
    params: company_id ? { company_id } : {},
  });
  return unwrapData(response.data);
}

export async function addStudent(formData: FormType) {
  const {
    firstName,
    lastName,
    email,
    phone,
    university,
    otherUniversity,
    faculty,
    otherFaculty,
    year,
    major,
    firstPreference,
    secondPreference,
    thirdPreference,
    aboutUs,
    includeCv,
    cv,
    previousExperience,
    preferencePercentage,
  } = formData;

  const finalForm = {
    name: `${firstName} ${lastName}`,
    email,
    phone,
    university: university === "other" ? otherUniversity : university,
    college: faculty === "other" ? otherFaculty : faculty,
    year: +year,
    major: major || "other",
    first_pref: +firstPreference || null,
    second_pref: +secondPreference || null,
    third_pref: +thirdPreference || null,
    event_source: aboutUs,
    experience: previousExperience,
    cv: includeCv ? cv[0] : null,
    pref_percentages: preferencePercentage,
  };

  try {
    const response = await axios.post(
      "https://apeceg.com/Events2025/add_students.php",
      finalForm,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    let message =
      (axios.isAxiosError(error) && error.response?.data?.error) ||
      "Unknown error";

    if (message.includes("Duplicate entry")) {
      message = "Phone number or email already exists";
    }

    if (message.includes("cv")) {
      message = "CV file is too large exceeding 10MB";
    }

    throw new Error(message);
  }
}

export async function uploadCv(formData: FormData) {
  try {
    const response = await axios.post(
      "https://apeceg.com/Events2025/add_cv.php",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response.data.message);
    return response.data.message;
  } catch (error) {
    console.error("Error uploading CV:", error);
    const message =
      (axios.isAxiosError(error) && error.response?.data?.error) ||
      (axios.isAxiosError(error) && error.response?.data?.message) ||
      "Unknown error";

    throw new Error(message);
  }
}

export async function getStudentData(
  searchQuery: string
): Promise<StudentType[]> {
  const response = await axios.get(
    `https://apeceg.com/Events2025/get_students.php?search=${searchQuery}`
  );
  if (response.status !== 200 || !response.data) {
    throw new Error("Failed to fetch students data");
  }
  return response.data.students;
}

export async function addInterviewSlot(formData: FormData) {
  try {
    const response = await axios.post(
      "https://apeceg.com/Events2025/add_interview.php",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.message;
  } catch (error) {
    let message =
      (axios.isAxiosError(error) && error.response?.data?.message) ||
      "Unknown error";

    if (message.includes("Duplicate entry")) {
      message = "You have already added this slot";
    }

    throw new Error(message);
  }
}

export async function getInterviews() {
  try {
    const response = await axios.get(
      "https://apeceg.com/Events2025/get_interviews.php"
    );
    return response.data.interviews;
  } catch (error) {
    const message =
      (axios.isAxiosError(error) && error.response?.data?.message) ||
      "Unknown error";

    throw new Error(message);
  }
}

export async function chooseInterView(formData: {
  phone: string;
  interview_slot: string;
}) {
  try {
    const response = await axios.post(
      "https://apeceg.com/Events2025/choose_interview.php",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.message;
  } catch (error) {
    const message =
      (axios.isAxiosError(error) && error.response?.data?.message) ||
      "Unknown error";
    throw new Error(message);
  }
}

export async function changeStatus(formData: { phone: string }) {
  try {
    const response = await axios.post(
      "https://apeceg.com/Events2025/change_student_status.php",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.message;
  } catch (error) {
    const message =
      (axios.isAxiosError(error) && error.response?.data?.message) ||
      "Unknown error";
    throw new Error(message);
  }
}

export async function getStudentInterviews(
  searchQuery: string
): Promise<StudentTypeWithInterview[]> {
  const response = await axios.get(
    `https://apeceg.com/Events2025/get_students_interviews.php?search=${searchQuery}`
  );
  if (response.status !== 200 || !response.data) {
    throw new Error("Failed to fetch students data");
  }
  return response.data.students;
}

// ── Slots Management ──
export type Slot = {
  id: number;
  interviewer: string;
  slot_time: string;
  student_id?: number | null;
  student_name?: string | null;
  student_phone?: string | null;
  created_at?: string;
};

export async function fetchSlots(): Promise<Slot[]> {
  if (useMockApi) {
    const response = await fetchMockJson<{ data: Slot[] }>("slots.json");
    return unwrapData(response);
  }
  const response = await api.get<{ data: Slot[] }>("/sloapecansts");
  return unwrapData(response.data);
}

export async function createSlot(data: {
  interviewer: string;
  slot_time: string;
}): Promise<{ message: string; id: number }> {
  if (useMockApi) {
    void data;
    return { message: "Slot created successfully", id: Date.now() };
  }
  const response = await api.post<{ message: string; id: number }>(
    "/sloapecansts",
    data
  );
  return response.data;
}

export async function updateSlot(id: number, data: {
  interviewer: string;
  slot_time: string;
}): Promise<{ message: string }> {
  if (useMockApi) {
    void id;
    void data;
    return { message: "Slot updated successfully" };
  }
  const response = await api.put<{ message: string }>(`/sloapecansts/${id}`, data);
  return response.data;
}

export async function deleteSlot(id: number): Promise<{ message: string }> {
  if (useMockApi) {
    void id;
    return { message: "Slot deleted successfully" };
  }
  const response = await api.delete<{ message: string }>(`/sloapecansts/${id}`);
  return response.data;
}

export async function bookSlot(slotId: number, studentId: number): Promise<{ message: string }> {
  if (useMockApi) {
    void slotId;
    void studentId;
    return { message: "Slot booked successfully" };
  }
  const response = await api.post<{ message: string }>(`/slots/book/${slotId}`, {
    student_id: studentId,
  });
  return response.data;
}

export async function cancelSlotBooking(slotId: number): Promise<{ message: string }> {
  if (useMockApi) {
    void slotId;
    return { message: "Slot is now empty." };
  }
  const response = await api.post<{ message: string }>(`/slots/cancel/${slotId}`);
  return response.data;
}

// ── Feedback ──
export type FeedbackRating = "excellent" | "good" | "fair" | "poor";

export interface FeedbackPayload {
  name: string;
  ushering: FeedbackRating;
  information: FeedbackRating;
  friendly: FeedbackRating;
  flyer: FeedbackRating;
  satisfied: FeedbackRating;
  design: FeedbackRating;
  comments?: string;
}

export interface CommitteeMember {
  id: number;
  member_name: string;
  referral_code: string;
};

export async function fetchCommitteeMembers(): Promise<CommitteeMember[]> {
  if (useMockApi) {
    const response = await fetchMockJson<{ data: CommitteeMember[] }>("committee-members.json");
    return unwrapData(response);
  }
  const response = await api.get<{ data: CommitteeMember[] }>("/apecans");
  return unwrapData(response.data);
}

export async function submitFeedback(
  payload: FeedbackPayload
): Promise<{ message: string; feedback_id: number }> {
  if (useMockApi) {
    void payload;
    return { message: "Feedback submitted successfully", feedback_id: Date.now() };
  }
  const response = await api.post<{ message: string; feedback_id: number }>(
    "/feedback",
    payload
  );
  return response.data;
}

export interface FeedbackCount {
  name: string;
  date: string;
  total: number;
}

export async function fetchFeedbackCounts(): Promise<FeedbackCount[]> {
  if (useMockApi) {
    const response = await fetchMockJson<{ data: FeedbackCount[] }>("feedback-counts.json");
    return unwrapData(response);
  }
  const response = await api.get<{ data: FeedbackCount[] }>("/feedback/count");
  return unwrapData(response.data);
}

// ── Student Company Preferences ──
export interface StudentCompany {
  id: number;
  name: string;
  industry: string;
}

export interface StudentCompaniesResponse {
  data: StudentCompany[];
}

export async function fetchStudentCompanies(
  id: number,
  token: string
): Promise<StudentCompany[]> {
  if (useMockApi) {
    const response = await fetchMockJson<StudentCompaniesResponse>("student-companies.json");
    return unwrapData(response);
  }

  const response = await api.get<StudentCompaniesResponse>(
    `/students/${id}/companies`,
    { params: { token } }
  );
  return unwrapData(response.data);
}

export interface StudentPreferencesPayload {
  id: number;
  token: string;
  first_preference?: number;
  second_preference?: number;
  third_preference?: number;
}

export interface StudentPreferencesResponse {
  success: boolean;
}

export async function submitStudentPreferences(
  payload: StudentPreferencesPayload
): Promise<StudentPreferencesResponse> {
  if (useMockApi) {
    void payload;
    return { success: true };
  }

  const response = await api.post<StudentPreferencesResponse>(
    `/students/${payload.id}/preferences`,
    { token: payload.token, first_preference: payload.first_preference, second_preference: payload.second_preference, third_preference: payload.third_preference }
  );
  return response.data;
}
