import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import {
  getApiErrorMessage,
  sendQrMail,
  uploadCvForPremium26,
} from "../services/apiServices";
import { RegisterStudentResponse } from "../types/form";
import Button from "../ui/Button";
import NotFound from "./NotFound";

type UploadCvFormData = {
  cv: FileList;
};

function getStoredStudent(): RegisterStudentResponse | null {
  const stored = localStorage.getItem("premium26Student");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as RegisterStudentResponse;
  } catch {
    return null;
  }
}

function UploadCv() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<UploadCvFormData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedStudent = getStoredStudent();

  const studentId = Number(searchParams.get("id") || storedStudent?.student_id);
  const token = searchParams.get("token") || storedStudent?.token || "";

  const { mutate, isLoading } = useMutation({
    mutationFn: uploadCvForPremium26,
    onSuccess: () => {
      // Fire QR mail — silent, non-blocking
      sendQrMail({ name: "cv_upload", student_id: studentId, token }).catch(() => {});
      toast.success("CV uploaded successfully");
      navigate("/thank-you?submit=cv", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  function onSubmit(formData: UploadCvFormData): void {
    mutate({
      id: studentId,
      token,
      cv: formData.cv[0],
    });
  }

  if (!studentId || !token) return <NotFound />;

  const selectedFileName = watch("cv")?.[0]?.name;

  return (
    <section style={{ maxWidth: "600px", margin: "3rem auto" }}>
      {/* Title bar */}
      <div
        style={{
          background: "var(--red-dark)",
          borderBottom: "3px solid var(--red)",
          padding: "1rem 1.5rem",
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--white)" }}>
          📄 UPLOAD YOUR CV
        </div>
        <div style={{ fontSize: "6px", color: "#cc6666", marginTop: "4px" }}>
          APEC PREMIUM 26 — OPTIONAL SIDE QUEST
        </div>
      </div>

      <div
        className="pixel-box"
        style={{ padding: "2rem", background: "var(--dark2)", borderTop: "none" }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <p
            style={{
              fontSize: "7px",
              color: "#888",
              marginBottom: "2rem",
              lineHeight: "2.5",
            }}
          >
            UPLOAD YOUR CV (PDF, DOC, DOCX). THIS IS OPTIONAL AND WON&apos;T
            AFFECT YOUR APPLICATION.
          </p>

          {/* File upload box */}
          <label
            htmlFor="fileInput"
            style={{
              display: "block",
              border: "2px dashed #333",
              background: "#0a0a0a",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.2s",
              marginBottom: "0.5rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor =
                "var(--gold)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor = "#333";
            }}
          >
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              {...register("cv", {
                required: "CV is required",
              })}
              accept=".pdf,.doc,.docx"
            />
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📁</div>
            <div
              style={{
                fontSize: "7px",
                color: selectedFileName ? "var(--gold)" : "#555",
                letterSpacing: "1px",
              }}
            >
              {selectedFileName ? `► ${selectedFileName}` : "► CLICK TO SELECT FILE"}
            </div>
            <div style={{ fontSize: "5px", color: "#333", marginTop: "6px" }}>
              ACCEPTED: .PDF .DOC .DOCX
            </div>
          </label>

          <p
            style={{
              fontSize: "6px",
              color: "var(--red-light)",
              marginBottom: "2rem",
              minHeight: "14px",
              visibility: errors.cv ? "visible" : "hidden",
            }}
          >
            {String(errors.cv?.message || "error")}
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button isLoading={isLoading} type="submit" variant="gold">
              ▶ SUBMIT CV
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default UploadCv;
