import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  useInterns,
  useUpdateIntern,
  useDeleteIntern,
} from "../features/interns/useInterns";
import { Intern } from "../services/apiServices";
import {
  CatalogItem,
  MajorItem,
  fetchMajors,
  fetchYears,
  fetchCompanies,
  CompanyItem,
} from "../services/apiServices";
import Spinner from "../ui/Spinner";
import { SearchablePixelSelect } from "../ui/SearchablePixelSelect";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  active: { label: "ACTIVE", color: "var(--green)", bg: "#001a05", border: "var(--green)" },
  completed: { label: "COMPLETED", color: "var(--blue)", bg: "#001133", border: "var(--blue)" },
  cancelled: { label: "CANCELLED", color: "var(--red-light)", bg: "#1a0800", border: "var(--red-light)" },
};

function getStatusCfg(status: string) {
  return STATUS_CONFIG[status] ?? {
    label: status.toUpperCase(),
    color: "#888",
    bg: "#0a0a0a",
    border: "#333",
  };
}

function Interns() {
  const [majorId, setMajorId] = useState<number | undefined>();
  const [yearId, setYearId] = useState<number | undefined>();
  const [companyId, setCompanyId] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const { interns, isLoading } = useInterns({
    major_id: majorId,
    year_id: yearId,
    company_id: companyId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { updateIntern, isUpdating } = useUpdateIntern();
  const { deleteIntern, isDeleting } = useDeleteIntern();

  const { data: allMajors = [] } = useQuery<MajorItem[]>({
    queryKey: ["majors"],
    queryFn: () => fetchMajors(),
    staleTime: Infinity,
  });
  const { data: years = [] } = useQuery<CatalogItem[]>({
    queryKey: ["years"],
    queryFn: fetchYears,
    staleTime: Infinity,
  });
  const { data: companiesData } = useQuery<CompanyItem[]>({
    queryKey: ["companies"],
    queryFn: () => fetchCompanies(),
    staleTime: Infinity,
  });
  const companies = companiesData ?? [];

  const majorsForFac = allMajors;

  const handleStatusUpdate = (id: number) => {
    if (!editStatus) return;
    updateIntern({ id, data: { status: editStatus } }, {
      onSuccess: () => setEditingIntern(null),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this intern record?")) {
      deleteIntern(id);
    }
  };

  const activeCount = interns.filter((i) => i.status === "active").length;
  const completedCount = interns.filter((i) => i.status === "completed").length;

  return (
    <section style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
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
          📋 INTERNS MANAGEMENT — PREMIUM 26
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#cc6666" }}>
            TOTAL:{" "}
            <span style={{ color: "var(--white)" }}>{isLoading ? "..." : interns.length}</span>
          </div>
        </div>
      </div>

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
        <SearchablePixelSelect
          label="Major"
          placeholder="ALL MAJORS"
          options={majorsForFac}
          value={majorId ?? ""}
          onChange={(val) => setMajorId(val ? Number(val) : undefined)}
        />

        <SearchablePixelSelect
          label="Year"
          placeholder="ALL YEARS"
          options={years}
          value={yearId ?? ""}
          onChange={(val) => setYearId(val ? Number(val) : undefined)}
        />

        <SearchablePixelSelect
          label="Company"
          placeholder="ALL COMPANIES"
          options={companies}
          value={companyId ?? ""}
          onChange={(val) => setCompanyId(val ? Number(val) : undefined)}
        />

        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "active", "completed", "cancelled"].map((s) => {
            const cfg = s === "all"
              ? { color: "#888", border: "#333", bg: "#111" }
              : getStatusCfg(s);
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  fontFamily: "var(--pixel)",
                  fontSize: "5px",
                  padding: "5px 10px",
                  border: `1px solid ${active ? cfg.color : "#222"}`,
                  background: active ? cfg.bg : "transparent",
                  color: active ? cfg.color : "#333",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                {s === "all" ? "ALL" : getStatusCfg(s).label}
              </button>
            );
          })}
        </div>

        {(majorId || yearId || companyId || statusFilter !== "all") && (
          <button
            onClick={() => {
              setMajorId(undefined);
              setYearId(undefined);
              setCompanyId(undefined);
              setStatusFilter("all");
            }}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "6px",
              padding: "6px 10px",
              border: "1px solid #333",
              background: "transparent",
              color: "#555",
              cursor: "pointer",
            }}
          >
            ✕ CLEAR
          </button>
        )}
      </div>

      {activeCount > 0 && completedCount > 0 && (
        <div style={{ padding: "1rem", background: "var(--dark2)", borderBottom: "2px solid #1a1a1a", display: "flex", gap: "1rem" }}>
          <div style={{ background: "#001a05", border: "1px solid var(--green)", padding: "8px 16px" }}>
            <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--green)" }}>ACTIVE: {activeCount}</span>
          </div>
          <div style={{ background: "#001133", border: "1px solid var(--blue)", padding: "8px 16px" }}>
            <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--blue)" }}>COMPLETED: {completedCount}</span>
          </div>
        </div>
      )}

      <div style={{ background: "var(--dark2)", border: "3px solid var(--red)", borderTop: "none", overflow: "auto" }}>
        {isLoading && (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Spinner />
          </div>
        )}

        {!isLoading && interns.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--pixel)", fontSize: "7px", color: "#333" }}>
            NO INTERNS FOUND
          </div>
        )}

        {!isLoading && interns.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#0a0a0a", borderBottom: "2px solid #1a1a1a" }}>
                {["ID", "STUDENT", "COMPANY", "MAJOR", "YEAR", "STATUS", "PERIOD", "ACTIONS"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "var(--pixel)",
                      fontSize: "5px",
                      color: "#444",
                      padding: "10px 12px",
                      textAlign: "left",
                      letterSpacing: "2px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interns.map((intern, index) => {
                const isEditing = editingIntern?.id === intern.id;
                const cfg = getStatusCfg(intern.status);

                return (
                  <tr
                    key={intern.id}
                    style={{
                      background: index % 2 === 0 ? "#0a0a0a" : "#0d0d0d",
                      borderBottom: "1px solid #1a1a1a",
                    }}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#444" }}>
                      #{intern.id}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#888" }}>{intern.student_name}</div>
                      <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#444", marginTop: "2px" }}>{intern.student_email}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#888" }}>{intern.company_name}</div>
                      <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#444", marginTop: "2px" }}>{intern.company_industry}</div>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#666" }}>
                      {intern.major_name}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#666" }}>
                      {intern.year_name}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {isEditing ? (
                        <select
                          className="pixel-input"
                          style={{ fontSize: "5px", padding: "4px" }}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span
                          style={{
                            fontFamily: "var(--pixel)",
                            fontSize: "5px",
                            padding: "3px 8px",
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "5px", color: "#555" }}>
                      {intern.started_at && intern.ended_at && (
                        <>
                          {format(parseISO(intern.started_at), "MMM dd")} - {format(parseISO(intern.ended_at), "MMM dd, yyyy")}
                        </>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(intern.id)}
                              disabled={isUpdating}
                              style={{
                                fontFamily: "var(--pixel)",
                                fontSize: "5px",
                                padding: "4px 8px",
                                border: "1px solid var(--green)",
                                background: "#001a05",
                                color: "var(--green)",
                                cursor: "pointer",
                              }}
                            >
                              {isUpdating ? "..." : "SAVE"}
                            </button>
                            <button
                              onClick={() => setEditingIntern(null)}
                              style={{
                                fontFamily: "var(--pixel)",
                                fontSize: "5px",
                                padding: "4px 8px",
                                border: "1px solid #333",
                                background: "transparent",
                                color: "#555",
                                cursor: "pointer",
                              }}
                            >
                              CANCEL
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingIntern(intern);
                                setEditStatus(intern.status);
                              }}
                              style={{
                                fontFamily: "var(--pixel)",
                                fontSize: "5px",
                                padding: "4px 8px",
                                border: "1px solid var(--blue)",
                                background: "transparent",
                                color: "var(--blue)",
                                cursor: "pointer",
                              }}
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDelete(intern.id)}
                              disabled={isDeleting}
                              style={{
                                fontFamily: "var(--pixel)",
                                fontSize: "5px",
                                padding: "4px 8px",
                                border: "1px solid var(--red-light)",
                                background: "transparent",
                                color: "var(--red-light)",
                                cursor: "pointer",
                              }}
                            >
                              {isDeleting ? "..." : "DEL"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default Interns;