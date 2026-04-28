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
  formData.append("major_id", String(payload.major_id));
  formData.append("year_id", String(payload.year_id));
  formData.append("university_id", String(payload.university_id));
  formData.append("faculty_id", String(payload.faculty_id));
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

  const response = await api.post<DataEnvelope<InternshipCompany[]>>(
    "/internships/eligible",
    payload
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

// ── Admin student list (Premium 26) ──
export type AdminStudentStatus =
  | "registered"
  | "cv_uploaded"
  | "pst_submitted"
  | "selection"
  | "confirmed"
  | string;

export type AdminStudent = {
  id: number;
  name: string;
  email: string;
  phone: string;
  token: string;
  status: AdminStudentStatus;
  major?: string;
  university?: string;
  faculty?: string;
  year?: string | number;
  university_id?: number;
  faculty_id?: number;
  major_id?: number;
  year_id?: number;
  program?: string;
  cv_path?: string | null;
  created_at?: string;
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
