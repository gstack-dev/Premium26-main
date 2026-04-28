import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AdminStudent,
  AdminStudentStatus,
  CatalogItem,
  MajorItem,
  fetchAdminStudents,
  fetchFaculties,
  fetchMajors,
  fetchUniversities,
  fetchYears,
  sendQrMail,
  AdminStudentsResponse,
} from "../services/apiServices";
import toast from "react-hot-toast";
import { SearchablePixelSelect } from "../ui/SearchablePixelSelect";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  registered:   { label: "REGISTERED",    color: "#3399ff", bg: "#001133", border: "#3399ff", icon: "📝" },
  cv_uploaded:  { label: "CV UPLOADED",   color: "#ffcc00", bg: "#1a1000", border: "#ffcc00", icon: "📄" },
  pst_submitted:{ label: "PST DONE",      color: "#ff8800", bg: "#1a0800", border: "#ff8800", icon: "⚔" },
  selection:    { label: "SELECTING",     color: "#00cc44", bg: "#001a05", border: "#00cc44", icon: "🏢" },
  confirmed:    { label: "CONFIRMED",     color: "#aa44ff", bg: "#0d001a", border: "#aa44ff", icon: "✓" },
};

function getStatusCfg(status: AdminStudentStatus) {
  return STATUS_CONFIG[status] ?? {
    label: status.toUpperCase().replace(/_/g, " "),
    color: "#555",
    bg: "#0a0a0a",
    border: "#333",
    icon: "❓",
  };
}

// ── Pipeline step totals ───────────────────────────────────────────────────
function PipelineBar({ students }: { students: AdminStudent[] }) {
  const total = students.length;
  const steps = [
    { key: "registered",    label: "REGISTERED",  icon: "📝" },
    { key: "cv_uploaded",   label: "CV",          icon: "📄" },
    { key: "pst_submitted", label: "PST",         icon: "⚔"  },
    { key: "selection",     label: "COMPANIES",   icon: "🏢"  },
    { key: "confirmed",     label: "CONFIRMED",   icon: "✓"  },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: "8px",
        marginBottom: "1.5rem",
      }}
    >
      {steps.map((s) => {
        const count = students.filter((st) => st.status === s.key).length;
        const cfg = getStatusCfg(s.key);
        return (
          <div
            key={s.key}
            style={{
              background: cfg.bg,
              border: `2px solid ${cfg.border}`,
              padding: "12px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: "clamp(14px,3vw,22px)", color: cfg.color, lineHeight: 1 }}>{count}</div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#555", marginTop: "6px", letterSpacing: "1px" }}>{s.label}</div>
            {total > 0 && (
              <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: cfg.color, marginTop: "4px" }}>
                {Math.round((count / total) * 100)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Student row ────────────────────────────────────────────────────────────
function StudentRow({ 
  s, 
  index,
  universities,
  faculties,
  years,
  allMajors,
}: { 
  s: AdminStudent; 
  index: number;
  universities: CatalogItem[];
  faculties: CatalogItem[];
  years: CatalogItem[];
  allMajors: MajorItem[];
}) {
  const [open, setOpen] = useState(false);
  const cfg = getStatusCfg(s.status);

  // Lookups for display names
  const uniName = s.university || universities.find(u => u.id === s.university_id)?.name;
  const facName = s.faculty || faculties.find(f => f.id === s.faculty_id)?.name;
  const yearName = s.year || years.find(y => y.id === s.year_id)?.name;
  const majorName = s.major || allMajors.find(m => m.id === s.major_id)?.name;

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: "pointer",
          background: index % 2 === 0 ? "#0a0a0a" : "#0d0d0d",
          borderBottom: "1px solid #1a1a1a",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#151515")}
        onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? "#0a0a0a" : "#0d0d0d")}
      >
        <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#444" }}>#{s.id}</td>
        <td style={{ padding: "10px 12px" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: "7px", color: "var(--white)" }}>{s.name}</div>
          <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#555", marginTop: "3px" }}>{s.email}</div>
        </td>
        <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#666" }}>{s.phone}</td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "6px",
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              padding: "3px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {cfg.icon} {cfg.label}
          </span>
        </td>
        <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#555" }}>
          {majorName ?? "—"}
        </td>
        <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "7px", textAlign: "center" }}>
          {s.pst_result ? (
            <span style={{ color: s.pst_result.percentage >= 60 ? "var(--green)" : "var(--red-light)" }}>
              {s.pst_result.score}/{s.pst_result.total_questions}
              <br />
              <span style={{ fontSize: "5px", color: "#555" }}>{s.pst_result.percentage}%</span>
            </span>
          ) : (
            <span style={{ color: "#333" }}>—</span>
          )}
        </td>
        <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", textAlign: "center" }}>
          {open ? "▲" : "▼"}
        </td>
      </tr>
      {open && (
        <tr style={{ background: "#060606", borderBottom: "2px solid var(--red-dark)" }}>
          <td colSpan={7} style={{ padding: "1rem 1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              {/* Personal */}
              <div>
                <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--red-light)", marginBottom: "8px", letterSpacing: "2px" }}>▶ PROFILE</div>
                {[
                  ["University", uniName],
                  ["Faculty",    facName],
                  ["Year",       yearName],
                  ["Program",    s.program],
                  ["CV",         s.cv_path ? "✓ uploaded" : "✗ none"],
                  ["Registered", s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", marginBottom: "4px" }}>
                    <span style={{ color: "#333" }}>{k}: </span>
                    <span style={{ color: s.cv_path && k === "CV" ? "var(--green)" : "#777" }}>{v ?? "—"}</span>
                  </div>
                ))}
              </div>
              {/* PST */}
              {s.pst_result && (
                <div>
                  <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--gold)", marginBottom: "8px", letterSpacing: "2px" }}>▶ PST RESULT</div>
                  {[
                    ["Score",      `${s.pst_result.score} / ${s.pst_result.total_questions}`],
                    ["Percentage", `${s.pst_result.percentage}%`],
                    ["Submitted",  new Date(s.pst_result.submitted_at).toLocaleString()],
                  ].map(([k, v]) => (
                    <div key={k} style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", marginBottom: "4px" }}>
                      <span style={{ color: "#333" }}>{k}: </span>
                      <span style={{ color: "#888" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Companies */}
              {s.internship_preferences && s.internship_preferences.length > 0 && (
                <div>
                  <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--green)", marginBottom: "8px", letterSpacing: "2px" }}>▶ COMPANIES</div>
                  {s.internship_preferences.map((p) => (
                    <div key={p.rank} style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", marginBottom: "4px" }}>
                      <span style={{ color: "#333" }}>#{p.rank}: </span>
                      <span style={{ color: "#888" }}>{p.company_name}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Actions */}
              <div>
                <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--gold)", marginBottom: "8px", letterSpacing: "2px" }}>▶ ACTIONS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <ActionButton 
                    label="SEND PST QR" 
                    onClick={() => handleSendQr("pst", s.id, s.token)} 
                    color="var(--blue)"
                  />
                  <ActionButton 
                    label="SEND INTERNSHIP QR" 
                    onClick={() => handleSendQr("companies", s.id, s.token)} 
                    color="var(--green)"
                  />
                  <ActionButton 
                    label="SEND INTERVIEW QR" 
                    onClick={() => handleSendQr("interview_slot", s.id, s.token)} 
                    color="var(--gold)"
                  />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ActionButton({ label, onClick, color }: { label: string; onClick: () => void; color: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
      toast.success(`${label} SENT`);
    } catch (err) {
      toast.error(`FAILED TO SEND ${label}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        fontFamily: "var(--pixel)",
        fontSize: "5px",
        padding: "6px 10px",
        background: "transparent",
        border: `1px solid ${color}`,
        color: color,
        cursor: loading ? "default" : "pointer",
        textAlign: "left",
        opacity: loading ? 0.5 : 1,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = color + "22"; }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "transparent"; }}
    >
      {loading ? "SENDING..." : `► ${label}`}
    </button>
  );
}

function handleSendQr(name: any, student_id: number, token?: string) {
  return sendQrMail({ name, student_id, token });
}

// ── Main Data page ─────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

function Data() {
  const [search, setSearch] = useState("");
  const [inputQ, setInputQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [uniId,    setUniId]    = useState<number | undefined>();
  const [facId,    setFacId]    = useState<number | undefined>();
  const [majorId,  setMajorId]  = useState<number | undefined>();
  const [yearId,   setYearId]   = useState<number | undefined>();
  const [page, setPage] = useState(1);

  // Catalog queries
  const { data: universities = [] } = useQuery<CatalogItem[]>({ queryKey: ["universities"], queryFn: fetchUniversities, staleTime: Infinity });
  const { data: faculties    = [] } = useQuery<CatalogItem[]>({ queryKey: ["faculties"],    queryFn: fetchFaculties,    staleTime: Infinity });
  const { data: allMajors    = [] } = useQuery<MajorItem[]> ({ queryKey: ["majors"],        queryFn: () => fetchMajors(), staleTime: Infinity });
  const { data: years        = [] } = useQuery<CatalogItem[]>({ queryKey: ["years"],         queryFn: fetchYears,         staleTime: Infinity });

  // When faculty is selected, filter majors client-side
  const majorsForFac = facId ? allMajors.filter((m) => m.faculty_id === facId) : allMajors;

  const { data, isLoading, isError, refetch } = useQuery<AdminStudentsResponse>({
    queryKey: ["premium26-admin-students", search, statusFilter, uniId, facId, majorId, yearId, page],
    queryFn: () => fetchAdminStudents({
      search:        search || undefined,
      status:        statusFilter !== "all" ? statusFilter : undefined,
      university_id: uniId,
      faculty_id:    facId,
      major_id:      majorId,
      year_id:       yearId,
      page:          page,
      per_page:      PAGE_SIZE,
    }),
    staleTime: 30_000,
  });

  const students = data?.data ?? [];
  const totalStudents = students.length;

  // client-side pagination since backend pagination was removed
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE);
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputQ);
    setPage(1);
  }

  function resetFilters() {
    setSearch(""); setInputQ("");
    setStatusFilter("all");
    setUniId(undefined); setFacId(undefined);
    setMajorId(undefined); setYearId(undefined);
    setPage(1);
  }

  const anyFilterActive = statusFilter !== "all" || uniId || facId || majorId || yearId || search;

  const statusOptions = ["all", "registered", "cv_uploaded", "pst_submitted", "selection", "confirmed"];

  return (
    <section style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" }}>
      {/* Title bar */}
      <div
        style={{
          background: "var(--red-dark)",
          borderBottom: "3px solid var(--red)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ fontFamily: "var(--pixel)", fontSize: "10px", color: "var(--white)" }}>
          📊 ADMIN DATA — PREMIUM 26
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#cc6666" }}>
            TOTAL:{" "}
            <span style={{ color: "var(--white)" }}>{isLoading ? "..." : totalStudents}</span>
          </div>
          <button
            onClick={() => void refetch()}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "6px",
              padding: "6px 12px",
              border: "1px solid #444",
              background: "#0a0a0a",
              color: "#888",
              cursor: "pointer",
            }}
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      {/* Pipeline totals */}
      {!isLoading && !isError && totalStudents > 0 && (
        <div style={{ padding: "1rem", background: "var(--dark2)", borderBottom: "2px solid #1a1a1a" }}>
          <PipelineBar students={students} />
        </div>
      )}

      {/* Search + filter bar */}
      <div
        style={{
          background: "#0d0d0d",
          borderBottom: "2px solid #1a1a1a",
          padding: "1rem 1.5rem",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "200px" }}>
          <input
            className="pixel-input"
            style={{ flex: 1 }}
            type="text"
            placeholder="SEARCH BY NAME / EMAIL / PHONE..."
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
          />
          <button
            type="submit"
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "7px",
              padding: "8px 16px",
              border: "2px solid var(--blue)",
              background: "#001133",
              color: "var(--blue)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ▶ SEARCH
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setInputQ(""); setPage(1); }}
              style={{
                fontFamily: "var(--pixel)",
                fontSize: "7px",
                padding: "8px 12px",
                border: "2px solid #333",
                background: "#0a0a0a",
                color: "#555",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </form>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {statusOptions.map((s) => {
            const cfg = s === "all"
              ? { color: "#888", border: "#333", bg: "#0a0a0a" }
              : getStatusCfg(s);
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                style={{
                  fontFamily: "var(--pixel)",
                  fontSize: "5px",
                  padding: "5px 10px",
                  border: `1px solid ${active ? cfg.color : "#222"}`,
                  background: active ? (s === "all" ? "#111" : cfg.bg) : "transparent",
                  color: active ? cfg.color : "#333",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  transition: "all 0.1s",
                }}
              >
                {s === "all" ? "ALL" : getStatusCfg(s).label}
              </button>
            );
          })}
        </div>

        {/* Major + Year + University + Faculty dropdowns */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>

          {/* University */}
          <SearchablePixelSelect
            label="University"
            placeholder="ALL UNIVERSITIES"
            options={universities}
            value={uniId ?? ""}
            onChange={(val) => { setUniId(val ? Number(val) : undefined); setPage(1); }}
          />

          {/* Faculty */}
          <SearchablePixelSelect
            label="Faculty"
            placeholder="ALL FACULTIES"
            options={faculties}
            value={facId ?? ""}
            onChange={(val) => {
              const v = val ? Number(val) : undefined;
              setFacId(v);
              setMajorId(undefined); // reset major when faculty changes
              setPage(1);
            }}
          />

          {/* Major — filtered by selected faculty */}
          <SearchablePixelSelect
            label="Major"
            placeholder="ALL MAJORS"
            options={majorsForFac}
            value={majorId ?? ""}
            onChange={(val) => { setMajorId(val ? Number(val) : undefined); setPage(1); }}
          />

          {/* Year */}
          <SearchablePixelSelect
            label="Year"
            placeholder="ALL YEARS"
            options={years}
            value={yearId ?? ""}
            onChange={(val) => { setYearId(val ? Number(val) : undefined); setPage(1); }}
          />

          {anyFilterActive && (
            <button onClick={resetFilters}
              style={{ fontFamily: "var(--pixel)", fontSize: "6px", padding: "6px 10px",
                border: "1px solid #333", background: "transparent", color: "#555", cursor: "pointer" }}
            >
              ✕ CLEAR ALL
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--dark2)", border: "3px solid var(--red)", borderTop: "none", overflow: "auto" }}>
        {isLoading && (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--pixel)", fontSize: "8px", color: "#444", animation: "blink 1s step-end infinite" }}>
              LOADING DATA...
            </div>
          </div>
        )}

        {isError && (
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--pixel)", fontSize: "8px", color: "var(--red-light)" }}>
            ✕ FAILED TO LOAD — CHECK API CONNECTION
          </div>
        )}

        {!isLoading && !isError && totalStudents === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--pixel)", fontSize: "7px", color: "#333" }}>
            NO STUDENTS MATCH YOUR FILTERS
          </div>
        )}

        {!isLoading && !isError && totalStudents > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "#0a0a0a", borderBottom: "2px solid #1a1a1a" }}>
                {["ID", "STUDENT", "PHONE", "STATUS", "MAJOR", "PST SCORE", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "var(--pixel)",
                      fontSize: "5px",
                      color: "#444",
                      padding: "10px 12px",
                      textAlign: "left",
                      letterSpacing: "2px",
                      fontWeight: "normal",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => (
                <StudentRow 
                  key={s.id} 
                  s={s} 
                  index={i} 
                  universities={universities}
                  faculties={faculties}
                  years={years}
                  allMajors={allMajors}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalStudents > PAGE_SIZE && (
        <div
          style={{
            background: "#0a0a0a",
            border: "3px solid #1a1a1a",
            borderTop: "none",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "7px",
              padding: "8px 16px",
              border: "2px solid #222",
              background: "transparent",
              color: page <= 1 ? "#222" : "#666",
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
          >
            ◀ PREV
          </button>
          <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#444" }}>
            PAGE {page} / {totalPages} &nbsp;·&nbsp; {totalStudents} STUDENTS
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "7px",
              padding: "8px 16px",
              border: "2px solid #222",
              background: "transparent",
              color: page >= totalPages ? "#222" : "#666",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            NEXT ▶
          </button>
        </div>
      )}
    </section>
  );
}

export default Data;
