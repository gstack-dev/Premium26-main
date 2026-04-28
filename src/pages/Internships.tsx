import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  fetchEligibleInternships,
  getApiErrorMessage,
  lookupStudent,
  sendQrMail,
  submitInternshipPreferences,
} from "../services/apiServices";
import { InternshipPreference, StudentLookupResponse } from "../types/form";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

type LookupFormData = {
  identifier: string;
};

type Rank = 1 | 2 | 3;

function canSelectInternships(student: StudentLookupResponse) {
  const hasPst = Boolean(student.pst_result || student.status === "selection");
  const scoreOk = student.pst_result ? student.pst_result.score >= 30 : true; // fallback if confirmed without score
  return hasPst && scoreOk;
}

function isPstFailed(student: StudentLookupResponse) {
  return student.pst_result && student.pst_result.score < 30;
}

function Internships() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentLookupResponse | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<Record<Rank, string>>({
    1: "",
    2: "",
    3: "",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupFormData>();

  const { mutate: runLookup, isLoading: isLookingUp } = useMutation({
    mutationFn: lookupStudent,
    onSuccess: (data) => {
      setStudent(data);
      setSelectedCompanies({ 1: "", 2: "", 3: "" });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const {
    data: companies,
    isLoading: isLoadingCompanies,
    isError: isCompaniesError,
  } = useQuery({
    queryKey: ["premium26-internships", student?.id],
    queryFn: () =>
      fetchEligibleInternships({
        student_id: student?.id || 0,
        token: student?.token || "",
      }),
    enabled: Boolean(student && canSelectInternships(student)),
  });

  const { mutate: submitPreferences, isLoading: isSubmitting } = useMutation({
    mutationFn: submitInternshipPreferences,
    onSuccess: () => {
      // Fire QR mail — silent, non-blocking
      if (student) {
        sendQrMail({ name: "companies", student_id: student.id, token: student.token }).catch(() => {});
      }
      toast.success("Internship preferences submitted successfully");
      navigate("/thank-you?submit=internship-preferences", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  function onLookupSubmit(data: LookupFormData) {
    runLookup({ identifier: data.identifier.trim() });
  }

  function handleCompanyChange(rank: Rank, companyId: string) {
    setSelectedCompanies((currentSelection) => ({
      ...currentSelection,
      [rank]: companyId,
    }));
  }

  function getAvailableCompanies(rank: Rank) {
    const selectedInOtherRanks = Object.entries(selectedCompanies)
      .filter(([selectedRank]) => Number(selectedRank) !== rank)
      .map(([, companyId]) => companyId)
      .filter(Boolean);

    return (companies || []).filter(
      (company) => !selectedInOtherRanks.includes(String(company.id))
    );
  }

  function handleSubmitPreferences() {
    if (!student) return;

    const preferences: InternshipPreference[] = ([1, 2, 3] as Rank[])
      .map((rank) => ({
        rank,
        company_id: Number(selectedCompanies[rank]),
      }))
      .filter((preference) => preference.company_id > 0);

    const uniqueCompanyIds = new Set(
      preferences.map((preference) => preference.company_id)
    );

    if (preferences.length === 0) {
      toast.error("Please select at least one company.");
      return;
    }

    if (uniqueCompanyIds.size !== preferences.length) {
      toast.error("Company choices must be unique.");
      return;
    }

    submitPreferences({
      student_id: student.id,
      token: student.token,
      preferences,
    });
  }

  const rankCount = Math.min(3, companies?.length || 0);
  const rankLabels: Record<Rank, string> = {
    1: "◆ 1ST PREFERENCE",
    2: "◆ 2ND PREFERENCE",
    3: "◆ 3RD PREFERENCE",
  };

  return (
    <section style={{ maxWidth: "800px", margin: "3rem auto" }}>
      {/* Title bar */}
      <div
        style={{
          background: "var(--red-dark)",
          borderBottom: "3px solid var(--red)",
          padding: "1rem 1.5rem",
          marginBottom: "0",
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--white)" }}>
          💼 INTERNSHIP COMPANIES
        </div>
        <div style={{ fontSize: "6px", color: "#cc6666", marginTop: "4px" }}>
          APEC PREMIUM 26 — SELECT YOUR QUEST
        </div>
      </div>

      {/* ── Lookup form ── */}
      {!student && (
        <div
          className="pixel-box"
          style={{ padding: "2rem", background: "var(--dark2)", borderTop: "none" }}
        >
          <p style={{ fontSize: "8px", color: "var(--gold)", marginBottom: "1.5rem" }}>
            ▶ ENTER YOUR CREDENTIALS
          </p>
          <form onSubmit={handleSubmit(onLookupSubmit)}>
            <label className="form-label" htmlFor="identifier-intern">
              📧 REGISTERED EMAIL OR PHONE
            </label>
            <input
              id="identifier-intern"
              className="pixel-input"
              type="text"
              placeholder="YOUR EMAIL OR PHONE NUMBER"
              {...register("identifier", {
                required: "Please enter your registered email or phone",
                maxLength: {
                  value: 255,
                  message: "Identifier must be 255 characters or less",
                },
              })}
            />
            <p
              style={{
                fontSize: "6px",
                color: "var(--red-light)",
                marginTop: "4px",
                minHeight: "14px",
                visibility: errors.identifier ? "visible" : "hidden",
              }}
            >
              {String(errors.identifier?.message || "error")}
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <Button isLoading={isLookingUp} type="submit" variant="blue">
                ▶ CONTINUE
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Must complete PST first ── */}
      {student && !canSelectInternships(student) && !isPstFailed(student) && (
        <div
          className="pixel-box"
          style={{ padding: "2rem", background: "var(--dark2)", textAlign: "center", borderTop: "none" }}
        >
          <p style={{ fontSize: "8px", color: "var(--red-light)", marginBottom: "1.5rem" }}>
            ⚠ COMPLETE PST FIRST
          </p>
          <p style={{ fontSize: "7px", color: "#555", marginBottom: "1.5rem" }}>
            Please complete the PST before selecting internship companies.
          </p>
          <Button type="button" variant="red" onClick={() => navigate("/pst")}>
            ▶ START PST
          </Button>
        </div>
      )}

      {/* ── PST Failed ── */}
      {student && isPstFailed(student) && (
        <div
          className="pixel-box"
          style={{ padding: "3rem 2rem", background: "#1a0000", textAlign: "center", borderTop: "none" }}
        >
          <div style={{ fontSize: "32px", marginBottom: "1rem" }}>💀</div>
          <p style={{ fontSize: "10px", color: "var(--red-light)", marginBottom: "1.5rem", letterSpacing: "2px" }}>
            MISSION FAILED
          </p>
          <p style={{ fontSize: "7px", color: "#888", marginBottom: "2rem", lineHeight: "2.5" }}>
            YOUR PST SCORE (<span style={{ color: "var(--red)" }}>{student.pst_result?.score}</span>) IS BELOW THE REQUIRED THRESHOLD.
            <br />
            UNFORTUNATELY, YOU CANNOT PROCEED TO INTERNSHIP SELECTION.
          </p>
          <div style={{ fontSize: "6px", color: "#444" }}>
            BETTER LUCK NEXT TIME, RECRUIT.
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {student && canSelectInternships(student) && isLoadingCompanies && (
        <Spinner />
      )}

      {/* ── Error ── */}
      {student && canSelectInternships(student) && isCompaniesError && (
        <div
          className="pixel-box"
          style={{ padding: "2rem", background: "var(--dark2)", textAlign: "center", borderTop: "none" }}
        >
          <p style={{ fontSize: "8px", color: "var(--red-light)" }}>
            ✕ COMPANIES UNAVAILABLE
          </p>
        </div>
      )}

      {/* ── No companies — waiting for PST confirmation ── */}
      {student && canSelectInternships(student) && companies?.length === 0 && (
        <div
          style={{
            background: "var(--dark2)",
            border: "3px solid var(--red-dark)",
            boxShadow: "0 0 0 3px #0a0a0a, 0 0 0 6px var(--red-dark)",
            borderTop: "none",
            padding: "3rem 2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          {/* Hourglass icon */}
          <div style={{ fontSize: "32px", animation: "blink 1.4s step-end infinite" }}>
            ⏳
          </div>

          {/* Title */}
          <div
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "clamp(9px, 2vw, 13px)",
              color: "var(--gold)",
              textShadow: "2px 2px 0 #553300",
              letterSpacing: "3px",
              lineHeight: 2,
              animation: "flash-gold 2s step-end infinite",
            }}
          >
            PLEASE WAIT...
          </div>

          {/* Message */}
          <div
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "clamp(7px, 1.4vw, 9px)",
              color: "#aaa",
              lineHeight: 2.8,
              maxWidth: "420px",
            }}
          >
            COMPANIES WILL APPEAR HERE ONCE WE
            <br />
            <span style={{ color: "var(--gold)" }}>CONFIRM YOUR PST MARKS.</span>
            <br />
            PLEASE CHECK BACK SOON.
          </div>

          {/* Blinking pixel dots */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  background: "var(--red)",
                  animation: `blink 1.2s ${i * 0.24}s step-end infinite`,
                }}
              />
            ))}
          </div>

          {/* Footer note */}
          <div
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "6px",
              color: "#444",
              letterSpacing: "2px",
            }}
          >
            THIS PAGE WILL UPDATE ONCE MARKS ARE CONFIRMED
          </div>
        </div>
      )}

      {/* ── Selection UI ── */}
      {student && canSelectInternships(student) && companies && companies.length > 0 && (
        <div
          className="pixel-box"
          style={{ padding: "2rem", background: "var(--dark2)", borderTop: "none" }}
        >
          <p style={{ fontSize: "7px", color: "#888", marginBottom: "1.5rem", lineHeight: "2.5" }}>
            SELECT UP TO THREE COMPANIES IN ORDER OF PREFERENCE.
          </p>

          {/* Rank selects */}
          <div style={{ marginBottom: "2rem" }}>
            {([1, 2, 3] as Rank[]).slice(0, rankCount).map((rank) => (
              <div key={rank} style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor={`rank-${rank}`}>
                  {rankLabels[rank]}
                </label>
                <select
                  id={`rank-${rank}`}
                  className="pixel-select"
                  value={selectedCompanies[rank]}
                  onChange={(event) =>
                    handleCompanyChange(rank, event.target.value)
                  }
                >
                  <option value="">► SELECT COMPANY...</option>
                  {getAvailableCompanies(rank).map((company) => (
                    <option key={company.id} value={company.id}>
                      ► {company.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Company cards */}
          <div style={{ marginBottom: "2rem" }}>
            <p className="form-label" style={{ marginBottom: "1rem" }}>
              ► AVAILABLE COMPANIES
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="pixel-box-blue"
                  style={{
                    padding: "1rem 1.5rem",
                    background: "#00060f",
                  }}
                >
                  <div
                    style={{
                      fontSize: "8px",
                      color: "var(--gold)",
                      marginBottom: "4px",
                    }}
                  >
                    ► {company.name}
                  </div>
                  {company.description && (
                    <div style={{ fontSize: "6px", color: "#555", lineHeight: "2" }}>
                      {company.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="button"
              isLoading={isSubmitting}
              variant="gold"
              onClick={handleSubmitPreferences}
            >
              ▶ CONFIRM SELECTION
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Internships;
