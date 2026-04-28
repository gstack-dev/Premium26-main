export type FormType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  otherUniversity: string;
  faculty: string;
  otherFaculty: string;
  year: string;
  firstPreference: string;
  secondPreference: string;
  thirdPreference: string;
  preferencePercentage: string;
  aboutUs: string;
  includeCv: boolean;
  cv: FileList;
  previousExperience: string;
  major: string;
};
export type companiesType = {
  name: string;
  id: number;
};

export type EntityOption = {
  id: number;
  name: string;
};

export type ValueOption = {
  value: string;
  label: string;
};



export type RegistrationFormValues = {
  name: string;
  email: string;
  phone: string;
  national_id: string;
  experience: string;
  major_id: string;
  year_id: string;
  university_id: string;
  faculty_id: string;
  other_university?: string;
  other_faculty?: string;
  other_major?: string;
  program: string;
  event_source: string;
  referral_code?: string;
  cv: FileList;
};

export type RegistrationPayload = {
  name: string;
  email: string;
  phone: string;
  national_id: string;
  experience: string;
  major_id: number | null;
  year_id: number;
  university_id: number | null;
  faculty_id: number | null;
  other_university?: string;
  other_faculty?: string;
  other_major?: string;
  program: string;
  event_source: string;
  referral_code?: string;
  cv: File;
};

export type RegisterStudentResponse = {
  message: string;
  student_id: number;
  token: string;
};

export type PstResult = {
  id: number;
  score: number;
  total_questions: number;
  percentage: number;
  submitted_at: string;
};

export type StudentLookupResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  national_id: string;
  status: string;
  token: string;
  other_university?: string;
  other_faculty?: string;
  pst_result: PstResult | null;
  qr_codes: {
    cv_upload: string;
    pst: string;
    companies: string;
  };
};

export type StudentLookupPayload = {
  identifier: string;
};

export type PstQuestionOption = {
  id: number;
  label: string;
  text: string | null;
  image_path: string | null;
  image_paths: string[] | null;
  image_name: string | null;
  image_names: string[];
  image_url?: string | null;
  image_urls?: string[];
  option_type: string;
  position: number;
};

export type PstQuestion = {
  id: number;
  source_number: number | null;
  category: string;
  difficulty: string;
  question_text: string;
  image_path: string | null;
  image_paths: string[];
  image_name: string | null;
  image_names: string[];
  image_url?: string | null;
  image_urls?: string[];
  option_display_type: string;
  options_embedded_in_question_image: boolean;
  options: PstQuestionOption[];
};

export type PstQuestionsResponse = {
  data: PstQuestion[];
};

export type PstAnswer = {
  question_id: number;
  option_id: number | null;
};

export type SubmitPstPayload = {
  student_id: number;
  token: string;
  answers: PstAnswer[];
};

export type SubmitPstResponse = {
  data: {
    id: number;
    student_id: number;
    score: number;
    total_questions: number;
    percentage: number;
    status: string;
    eligible_for_companies: boolean;
    submitted_at: string;
    qr_codes?: {
      companies: string;
    };
  };
};

export type CvUploadPayload = {
  id: number;
  token: string;
  cv: File;
};

export type CvUploadResponse = {
  success: boolean;
  cv_id: string;
};

export type InternshipCompany = {
  id: number;
  name: string;
  description?: string | null;
};

export type EligibleInternshipsPayload = {
  student_id: number;
  token: string;
};

export type InternshipPreference = {
  rank: number;
  company_id: number;
};

export type SubmitInternshipPreferencesPayload = {
  student_id: number;
  token: string;
  preferences: InternshipPreference[];
};

export type SubmitInternshipPreferencesResponse = {
  success: boolean;
  message?: string;
};

export type StudentType = {
  apply_status: string;
  college: string;
  created_at: Date;
  cv: string | null;
  email: string;
  event_source: string;
  experience: string;
  first_pref: string | null;
  submission_time: Date | null;
  major: string;
  name: string;
  phone: string;
  pref_percentages: string;
  second_pref: string | null;
  third_pref: string | null;
  university: string;
  year: number;
  score: string | null;
};

export type StudentTypeWithInterview = StudentType & {
  interviewer_name: string;
  interview_date: Date;
};
