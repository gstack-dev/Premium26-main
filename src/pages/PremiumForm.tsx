import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, UseFormRegister, useWatch, Controller, Control } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  fetchFaculties,
  fetchMajors,
  fetchUniversities,
  fetchYears,
  getApiErrorMessage,
  registerStudent,
  sendQrMail,
} from "../services/apiServices";
import {
  EntityOption,
  RegistrationFormValues,
  RegistrationPayload,
  ValueOption,
} from "../types/form";
import Button from "../ui/Button";
import InputCol from "../ui/InputCol";
import InputGroup from "../ui/InputGroup";
import Spinner from "../ui/Spinner";
import { SearchablePixelSelect } from "../ui/SearchablePixelSelect";
import { resumeAudio, usePixelSound } from "../services/usePixelSound";

const VALID_REFERRAL_CODES = [
  ...Array.from({ length: 16 }, (_, i) => `HR${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 8 }, (_, i) => `IT${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, i) => `PM${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `LR${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, i) => `FR${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 9 }, (_, i) => `MM${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 11 }, (_, i) => `PR${String(i + 1).padStart(2, "0")}`),
];

const fallbackPrograms: ValueOption[] = [
  { value: "mainstream", label: "Mainstream" },
  { value: "credit", label: "Credit" },
  { value: "ahlia", label: "Ahlia" },
];

const fallbackEventSources: ValueOption[] = [
  { value: "ushering", label: "Ushering" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];



function FieldError({ message }: { message?: string }) {
  return (
    <p
      style={{
        fontSize: "6px",
        color: "var(--red-light)",
        marginTop: "4px",
        paddingLeft: "2px",
        minHeight: "14px",
        visibility: message ? "visible" : "hidden",
        fontFamily: "var(--pixel)",
      }}
    >
      {message || "error"}
    </p>
  );
}

function EntitySelect({
  label,
  name,
  options,
  control,
  error,
}: {
  label: string;
  name: keyof Pick<
    RegistrationFormValues,
    "major_id" | "year_id" | "university_id" | "faculty_id"
  >;
  options: EntityOption[];
  control: Control<RegistrationFormValues>;
  error?: string;
}) {
  return (
    <InputCol>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{ 
          required: `${label} is required`,
          validate: (value) => value === "-1" || Number(value) > 0 || `${label} is required`,
        }}
        render={({ field }) => (
          <SearchablePixelSelect
            label={label}
            options={options}
            value={field.value}
            onChange={field.onChange}
            error={error}
          />
        )}
      />
      <FieldError message={error} />
    </InputCol>
  );
}

function ValueSelect({
  label,
  name,
  options,
  register,
  error,
}: {
  label: string;
  name: keyof Pick<RegistrationFormValues, "program" | "event_source">;
  options: ValueOption[];
  register: UseFormRegister<RegistrationFormValues>;
  error?: string;
}) {
  const play = usePixelSound();
  return (
    <InputCol>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        className="pixel-select"
        {...register(name, {
          required: `${label} is required`,
        })}
        onFocus={() => {
          resumeAudio();
          play("click");
        }}
      >
        <option value="">► SELECT {label.toUpperCase()}...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            ► {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </InputCol>
  );
}

function PremiumForm() {
  const navigate = useNavigate();
  const play = usePixelSound();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<RegistrationFormValues>();

  const selectedUnivId = useWatch({ control, name: "university_id" });
  const selectedFacId = useWatch({ control, name: "faculty_id" });
  const selectedMajorId = useWatch({ control, name: "major_id" });

  // Individual catalog queries
  const { data: universities = [], isLoading: isLoadingUnis } = useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
    staleTime: Infinity,
  });

  const { data: faculties = [], isLoading: isLoadingFacs } = useQuery({
    queryKey: ["faculties"],
    queryFn: fetchFaculties,
    staleTime: Infinity,
  });

  const { data: years = [], isLoading: isLoadingYears } = useQuery({
    queryKey: ["years"],
    queryFn: fetchYears,
    staleTime: Infinity,
  });

  const { data: majors = [], isLoading: isLoadingMajors } = useQuery({
    queryKey: ["majors", selectedFacId],
    queryFn: () => fetchMajors(selectedFacId ? Number(selectedFacId) : undefined),
    enabled: true, // Fetch all if none selected, or filter by ID
  });

  const universityOptions = [
    ...universities.filter((u) => u.name.toLowerCase() !== "other"),
    ...(universities.find((u) => u.name.toLowerCase() === "other")
      ? [universities.find((u) => u.name.toLowerCase() === "other")!]
      : [{ id: -1, name: "Other" }]),
  ];

  const facultyOptions = [
    ...faculties.filter((f) => f.name.toLowerCase() !== "other"),
    ...(faculties.find((f) => f.name.toLowerCase() === "other")
      ? [faculties.find((f) => f.name.toLowerCase() === "other")!]
      : [{ id: -1, name: "Other" }]),
  ];

  const majorOptions = [
    ...majors.filter((m) => m.name.toLowerCase() !== "other"),
    ...(majors.find((m) => m.name.toLowerCase() === "other")
      ? [majors.find((m) => m.name.toLowerCase() === "other")!]
      : [{ id: -1, name: "Other" }]),
  ];

  const isOtherUniv =
    universityOptions.find((u) => String(u.id) === String(selectedUnivId))?.name.toLowerCase() === "other";
  const isOtherFac =
    facultyOptions.find((f) => String(f.id) === String(selectedFacId))?.name.toLowerCase() === "other";
  const isOtherMajor =
    majorOptions.find((m) => String(m.id) === String(selectedMajorId))?.name.toLowerCase() === "other";

  const isLoadingOptions = isLoadingUnis || isLoadingFacs || isLoadingYears || isLoadingMajors;
  const isOptionsError = false; // Simplified error handling for individual queries

  const { mutate, isLoading } = useMutation({
    mutationFn: registerStudent,
    onSuccess: (data) => {
      play("success");
      localStorage.setItem("premium26Student", JSON.stringify(data));
      localStorage.removeItem("studentData");
      localStorage.removeItem("premium26PstComplete");
      toast.success("Registration submitted successfully");
      // Fire QR mail — silent, non-blocking
      sendQrMail({
        name: "cv_upload",
        student_id: data.student_id,
        token: data.token,
      }).catch(() => {});
      reset();
      navigate("/success", { replace: true });
    },
    onError: (error) => {
      play("error");
      toast.error(getApiErrorMessage(error));
    },
  });

  function onSubmit(values: RegistrationFormValues) {
    const payload: RegistrationPayload = {
      ...values,
      major_id:
        values.major_id && Number(values.major_id) > 0
          ? Number(values.major_id)
          : null,
      year_id: Number(values.year_id),
      university_id:
        values.university_id && Number(values.university_id) > 0
          ? Number(values.university_id)
          : null,
      faculty_id:
        values.faculty_id && Number(values.faculty_id) > 0
          ? Number(values.faculty_id)
          : null,
      other_university: isOtherUniv ? values.other_university : undefined,
      other_faculty: isOtherFac ? values.other_faculty : undefined,
      other_major: isOtherMajor ? values.other_major : undefined,
      cv: values.cv[0],
    };
    mutate(payload);
  }

  if (isLoadingOptions) return <Spinner />;

  if (isOptionsError) {
    return (
      <section
        className="pixel-box"
        style={{ maxWidth: "700px", margin: "3rem auto", padding: "2rem", background: "var(--dark2)" }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "7px", color: "var(--red-light)", marginBottom: "1rem" }}>
            ✕ CONNECTION ERROR
          </p>
          <h1 style={{ fontSize: "12px", color: "var(--white)" }}>PREMIUM 26</h1>
          <p style={{ fontSize: "7px", color: "#666", marginTop: "1rem", lineHeight: "2.5" }}>
            Registration options are unavailable right now.
            <br />
            Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{ maxWidth: "800px", margin: "3rem auto" }}
      aria-labelledby="premium26-registration"
    >
      {/* ── Form Header ── */}
      <div
        className="pixel-box"
        style={{ padding: 0, background: "var(--dark2)" }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "var(--red-dark)",
            padding: "1rem 1.5rem",
            borderBottom: "2px solid var(--red)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "9px", color: "var(--white)" }}>
              ⚔ CREATE YOUR CHARACTER
            </div>
            <div style={{ fontSize: "6px", color: "#cc6666", marginTop: "4px" }}>
              APEC PREMIUM 26 — NEW QUEST ENROLLMENT
            </div>
          </div>
          <div style={{ fontSize: "7px", color: "var(--gold)" }}>
            LV. 1 <span className="pixel-cursor" />
          </div>
        </div>

        {/* Form body */}
        <div
          style={{
            padding: "2rem",
            position: "relative",
          }}
        >
          {/* Scanline overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,0,0,0.015) 3px, rgba(255,0,0,0.015) 4px)",
              pointerEvents: "none",
            }}
          />

          <form onSubmit={handleSubmit(onSubmit)} style={{ position: "relative" }}>
            {/* Player Name */}
            <InputGroup>
              <InputCol>
                <label className="form-label" htmlFor="name">
                  👤 PLAYER NAME
                </label>
                <input
                  id="name"
                  className="pixel-input"
                  type="text"
                  placeholder="ENTER YOUR NAME..."
                  {...register("name", {
                    required: "Student name is required",
                    maxLength: {
                      value: 255,
                      message: "Student name must be 255 characters or less",
                    },
                  })}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.name?.message || "")} />
              </InputCol>
            </InputGroup>

            {/* Email & Phone */}
            <InputGroup>
              <InputCol>
                <label className="form-label" htmlFor="email">
                  📧 EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  className="pixel-input"
                  type="email"
                  placeholder="YOUR@EMAIL.COM"
                  {...register("email", {
                    required: "Email is required",
                    maxLength: {
                      value: 255,
                      message: "Email must be 255 characters or less",
                    },
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                    validate: (value) =>
                      !/(\.edu\.|\.edu$)/i.test(value) ||
                      "Educational emails are not accepted",
                  })}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.email?.message || "")} />
              </InputCol>
              <InputCol>
                <label className="form-label" htmlFor="phone">
                  📱 PHONE NUMBER
                </label>
                <input
                  id="phone"
                  className="pixel-input"
                  type="tel"
                  placeholder="01012345678"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^01[0125]\d{8}$/,
                      message:
                        "Phone must be an Egyptian mobile number (010, 011, 012, 015)",
                    },
                  })}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.phone?.message || "")} />
              </InputCol>
            </InputGroup>

            {/* National ID */}
            <InputGroup>
              <InputCol>
                <label className="form-label" htmlFor="national_id">
                  🆔 NATIONAL ID (OR PASSPORT ID)
                </label>
                <input
                  id="national_id"
                  className="pixel-input"
                  type="text"
                  placeholder="ENTER YOUR ID"
                  {...register("national_id", {
                    required: "National ID is required",
                    minLength: {
                      value: 14,
                      message: "National ID must be at least 14 characters",
                    },
                    pattern: {
                      value: /^\d+$/,
                      message: "National ID must contain numbers only",
                    },
                  })}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.national_id?.message || "")} />
              </InputCol>
            </InputGroup>

            {/* University & Faculty */}
            <InputGroup>
              <EntitySelect
                label="University"
                name="university_id"
                options={universityOptions}
                control={control}
                error={String(errors.university_id?.message || "")}
              />
              <EntitySelect
                label="Faculty"
                name="faculty_id"
                options={facultyOptions}
                control={control}
                error={String(errors.faculty_id?.message || "")}
              />
            </InputGroup>

            {/* Other Univ/Fac fields */}
            {(isOtherUniv || isOtherFac) && (
              <InputGroup>
                {isOtherUniv && (
                  <InputCol>
                    <label className="form-label" htmlFor="other_university">
                      🏫 UNIVERSITY NAME
                    </label>
                    <input
                      id="other_university"
                      className="pixel-input"
                      placeholder="ENTER UNIVERSITY NAME..."
                      {...register("other_university", {
                        required: "Please specify your university",
                      })}
                      onFocus={() => {
                        resumeAudio();
                        play("click");
                      }}
                    />
                    <FieldError message={String(errors.other_university?.message || "")} />
                  </InputCol>
                )}
                {isOtherFac && (
                  <InputCol>
                    <label className="form-label" htmlFor="other_faculty">
                      🎓 FACULTY NAME
                    </label>
                    <input
                      id="other_faculty"
                      className="pixel-input"
                      placeholder="ENTER FACULTY NAME..."
                      {...register("other_faculty", {
                        required: "Please specify your faculty",
                      })}
                      onFocus={() => {
                        resumeAudio();
                        play("click");
                      }}
                    />
                    <FieldError message={String(errors.other_faculty?.message || "")} />
                  </InputCol>
                )}
              </InputGroup>
            )}

            {/* Year & Major */}
            <InputGroup>
              <EntitySelect
                label="Year"
                name="year_id"
                options={years}
                control={control}
                error={String(errors.year_id?.message || "")}
              />
              <EntitySelect
                label="Major"
                name="major_id"
                options={majorOptions}
                control={control}
                error={String(errors.major_id?.message || "")}
              />
            </InputGroup>

            {/* Other Major field */}
            {isOtherMajor && (
              <InputGroup>
                <InputCol>
                  <label className="form-label" htmlFor="other_major">
                    📜 MAJOR NAME
                  </label>
                  <input
                    id="other_major"
                    className="pixel-input"
                    placeholder="ENTER MAJOR NAME..."
                    {...register("other_major", {
                      required: "Please specify your major",
                    })}
                    onFocus={() => {
                      resumeAudio();
                      play("click");
                    }}
                  />
                  <FieldError message={String(errors.other_major?.message || "")} />
                </InputCol>
              </InputGroup>
            )}

            {/* Program & Event Source */}
            <InputGroup>
              <ValueSelect
                label="Program"
                name="program"
                options={fallbackPrograms}
                register={register}
                error={String(errors.program?.message || "")}
              />
              <ValueSelect
                label="Event Source"
                name="event_source"
                options={fallbackEventSources}
                register={register}
                error={String(errors.event_source?.message || "")}
              />
            </InputGroup>

            {/* Referral Code */}
            <InputGroup>
              <InputCol>
                <label className="form-label" htmlFor="referral_code">
                  🎫 REFERRAL CODE (OPTIONAL)
                </label>
                <input
                  id="referral_code"
                  className="pixel-input"
                  type="text"
                  placeholder="ENTER CODE IF YOU HAVE ONE"
                  {...register("referral_code", {
                    validate: (val) => 
                      !val || 
                      VALID_REFERRAL_CODES.includes(val) || 
                      "Invalid referral code",
                  })}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.toUpperCase();
                  }}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.referral_code?.message || "")} />
              </InputCol>
            </InputGroup>

            {/* Experience */}
            <InputGroup>
              <InputCol>
                <label className="form-label" htmlFor="experience">
                  ⭐ PREVIOUS EXPERIENCE
                </label>
                <textarea
                  id="experience"
                  className="pixel-input"
                  placeholder="DESCRIBE YOUR PREVIOUS EXPERIENCE..."
                  rows={5}
                  style={{ resize: "vertical", minHeight: "100px" }}
                  {...register("experience", {
                    required: "Experience is required",
                    maxLength: {
                      value: 1000,
                      message: "Experience must be 1000 characters or less",
                    },
                  })}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.experience?.message || "")} />
              </InputCol>
            </InputGroup>

            {/* CV Upload */}
            <InputGroup>
              <InputCol>
                <label className="form-label" htmlFor="cv">
                  📄 UPLOAD CV (PDF)
                </label>
                <input
                  id="cv"
                  className="pixel-input"
                  type="file"
                  accept=".pdf"
                  {...register("cv", {
                    required: "CV file is required",
                  })}
                  onFocus={() => { resumeAudio(); play("click"); }}
                />
                <FieldError message={String(errors.cv?.message || "")} />
              </InputCol>
            </InputGroup>

            {/* Submit row */}
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="submit"
                isLoading={isLoading}
                variant="gold"
                onClick={() => { resumeAudio(); play("click"); }}
              >
                ▶ ACCEPT QUEST &amp; SUBMIT
              </Button>
              <div
                style={{
                  fontSize: "6px",
                  color: "#444",
                  lineHeight: "2",
                }}
              >
                DIFFICULTY: <span style={{ color: "var(--gold)" }}>MEDIUM</span>
                <br />
                REWARD: <span style={{ color: "var(--gold)" }}>INTERNSHIP</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default PremiumForm;
