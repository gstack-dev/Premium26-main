import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useSlots,
  useCreateSlot,
  useUpdateSlot,
  useDeleteSlot,
  useBookSlot,
  useCancelSlot,
  Slot,
} from "../features/slots/useSlots";
import {
  fetchAdminStudents,
  AdminStudentsResponse,
} from "../services/apiServices";
import Spinner from "../ui/Spinner";

type Tab = "list" | "add" | "book";

function Slots() {
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [searchStudent, setSearchStudent] = useState("");

  const { slots, isLoading } = useSlots();
  const { createSlot, isCreating } = useCreateSlot();
  const { updateSlot, isUpdating } = useUpdateSlot();
  const { deleteSlot, isDeleting } = useDeleteSlot();
  const { bookSlot, isBooking } = useBookSlot();
  const { cancelSlot, isCancelling } = useCancelSlot();

  const { data: studentsData } = useQuery<AdminStudentsResponse>({
    queryKey: ["premium26-admin-students", searchStudent],
    queryFn: () =>
      fetchAdminStudents({
        search: searchStudent || undefined,
        per_page: 50,
      }),
    staleTime: 30_000,
  });

  const students = studentsData?.data ?? [];

  const [newSlot, setNewSlot] = useState({ interviewer: "", slot_time: null as Date | null });
  const [editForm, setEditForm] = useState({ interviewer: "", slot_time: null as Date | null });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.interviewer || !newSlot.slot_time) return;
    createSlot(
      {
        interviewer: newSlot.interviewer,
        slot_time: format(newSlot.slot_time, "yyyy-MM-dd HH:mm:ss"),
      },
      {
        onSuccess: () => {
          setNewSlot({ interviewer: "", slot_time: null });
          setActiveTab("list");
        },
      }
    );
  };

  const handleUpdate = (id: number) => {
    if (!editForm.interviewer || !editForm.slot_time) return;
    updateSlot(
      {
        id,
        data: {
          interviewer: editForm.interviewer,
          slot_time: format(editForm.slot_time, "yyyy-MM-dd HH:mm:ss"),
        },
      },
      {
        onSuccess: () => setEditingSlot(null),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this slot?")) {
      deleteSlot(id);
    }
  };

  const handleBook = (studentId: number) => {
    if (bookingSlotId === null) return;
    bookSlot(
      { slotId: bookingSlotId, studentId },
      {
        onSuccess: () => setBookingSlotId(null),
      }
    );
  };

  const handleCancelBooking = (slotId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelSlot(slotId);
    }
  };

  const sortedSlots = [...(slots ?? [])].sort(
    (a, b) => new Date(a.slot_time).getTime() - new Date(b.slot_time).getTime()
  );

  return (
    <section style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" }}>
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
          📅 INTERVIEW SLOTS MANAGEMENT — PREMIUM 26
        </div>
      </div>

      <div
        style={{
          background: "#0d0d0d",
          borderBottom: "2px solid #1a1a1a",
          padding: "1rem",
          display: "flex",
          gap: "10px",
        }}
      >
        {(["list", "add", "book"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "6px",
              padding: "8px 16px",
              border: `2px solid ${activeTab === tab ? "var(--green)" : "#222"}`,
              background: activeTab === tab ? "#001a05" : "transparent",
              color: activeTab === tab ? "var(--green)" : "#444",
              cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            {tab === "list" && "▶ ALL SLOTS"}
            {tab === "add" && "▶ ADD SLOT"}
            {tab === "book" && "▶ BOOK SLOT"}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--dark2)", border: "3px solid var(--red)", borderTop: "none", minHeight: "400px" }}>
        {activeTab === "list" && (
          <div style={{ padding: "1rem" }}>
            {isLoading ? (
              <Spinner />
            ) : sortedSlots.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", fontFamily: "var(--pixel)", fontSize: "7px", color: "#333" }}>
                NO SLOTS AVAILABLE — ADD SOME FIRST
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0a0a0a", borderBottom: "2px solid #1a1a1a" }}>
                    {["ID", "INTERVIEWER", "TIME", "STATUS", "STUDENT", "ACTIONS"].map((h) => (
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
                  {sortedSlots.map((slot, index) => {
                    const isBooked = slot.student_id !== null && slot.student_id !== undefined;
                    const isEditing = editingSlot?.id === slot.id;

                    return (
                      <tr
                        key={slot.id}
                        style={{
                          background: index % 2 === 0 ? "#0a0a0a" : "#0d0d0d",
                          borderBottom: "1px solid #1a1a1a",
                        }}
                      >
                        <td style={{ padding: "10px 12px", fontFamily: "var(--pixel)", fontSize: "6px", color: "#444" }}>
                          #{slot.id}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {isEditing ? (
                            <input
                              className="pixel-input"
                              style={{ width: "150px", fontSize: "6px" }}
                              value={editForm.interviewer}
                              onChange={(e) => setEditForm({ ...editForm, interviewer: e.target.value })}
                            />
                          ) : (
                            <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#888" }}>
                              {slot.interviewer}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {isEditing ? (
                            <div style={{ fontSize: "6px", width: "180px" }}>
                              <DatePicker
                                selected={editForm.slot_time}
                                onChange={(date) => setEditForm({ ...editForm, slot_time: date })}
                                showTimeSelect
                                timeFormat="HH:mm"
                                dateFormat="MMM dd, yyyy HH:mm"
                                timeIntervals={15}
                                minDate={new Date()}
                                minTime={new Date(new Date().setHours(8, 0, 0))}
                                maxTime={new Date(new Date().setHours(22, 0, 0))}
                                className="pixel-input"
                                placeholderText="Select date & time"
                              />
                            </div>
                          ) : (
                            <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#666" }}>
                              {format(parseISO(slot.slot_time), "MMM dd, hh:mm aa")}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontFamily: "var(--pixel)",
                              fontSize: "5px",
                              padding: "3px 8px",
                              background: isBooked ? "#1a0800" : "#001a05",
                              border: `1px solid ${isBooked ? "var(--red-light)" : "var(--green)"}`,
                              color: isBooked ? "var(--red-light)" : "var(--green)",
                            }}
                          >
                            {isBooked ? "BOOKED" : "AVAILABLE"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {isBooked ? (
                            <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#888" }}>
                              {slot.student_name || `Student #${slot.student_id}`}
                              <br />
                              <span style={{ color: "#444", fontSize: "5px" }}>{slot.student_phone}</span>
                            </span>
                          ) : (
                            <span style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#333" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(slot.id)}
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
                                  onClick={() => setEditingSlot(null)}
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
                                    setEditingSlot(slot);
                                    setEditForm({
                                      interviewer: slot.interviewer,
                                      slot_time: parseISO(slot.slot_time),
                                    });
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
                                  onClick={() => handleDelete(slot.id)}
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
                                {!isBooked && (
                                  <button
                                    onClick={() => setBookingSlotId(slot.id)}
                                    style={{
                                      fontFamily: "var(--pixel)",
                                      fontSize: "5px",
                                      padding: "4px 8px",
                                      border: "1px solid var(--green)",
                                      background: "transparent",
                                      color: "var(--green)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    BOOK
                                  </button>
                                )}
                                {isBooked && (
                                  <button
                                    onClick={() => handleCancelBooking(slot.id)}
                                    disabled={isCancelling}
                                    style={{
                                      fontFamily: "var(--pixel)",
                                      fontSize: "5px",
                                      padding: "4px 8px",
                                      border: "1px solid var(--gold)",
                                      background: "transparent",
                                      color: "var(--gold)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {isCancelling ? "..." : "CANCEL"}
                                  </button>
                                )}
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
        )}

        {activeTab === "add" && (
          <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", marginBottom: "8px", letterSpacing: "2px" }}>
                  INTERVIEWER NAME
                </label>
                <input
                  className="pixel-input"
                  style={{ width: "100%", fontSize: "7px" }}
                  type="text"
                  placeholder="e.g. Dr. Sara Ahmed"
                  value={newSlot.interviewer}
                  onChange={(e) => setNewSlot({ ...newSlot, interviewer: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", marginBottom: "8px", letterSpacing: "2px" }}>
                  SLOT TIME
                </label>
                <div style={{ width: "100%" }}>
                  <DatePicker
                    selected={newSlot.slot_time}
                    onChange={(date) => setNewSlot({ ...newSlot, slot_time: date })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    dateFormat="MMM dd, yyyy HH:mm"
                    timeIntervals={15}
                    minDate={new Date()}
                    minTime={new Date(new Date().setHours(8, 0, 0))}
                    maxTime={new Date(new Date().setHours(22, 0, 0))}
                    className="pixel-input"
                    placeholderText="Select date & time"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isCreating}
                style={{
                  fontFamily: "var(--pixel)",
                  fontSize: "7px",
                  padding: "12px 24px",
                  border: "2px solid var(--green)",
                  background: "#001a05",
                  color: "var(--green)",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {isCreating ? "CREATING..." : "▶ CREATE SLOT"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "book" && (
          <div style={{ padding: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <input
                className="pixel-input"
                style={{ width: "100%", maxWidth: "400px", fontSize: "7px" }}
                type="text"
                placeholder="SEARCH STUDENT BY NAME / EMAIL / PHONE..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gap: "8px", maxWidth: "600px" }}>
              {students.length === 0 ? (
                <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#333", textAlign: "center", padding: "1rem" }}>
                  {searchStudent ? "NO STUDENTS FOUND" : "START TYPING TO SEARCH"}
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      background: "#0a0a0a",
                      border: "1px solid #1a1a1a",
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#888" }}>
                        {student.name}
                      </div>
                      <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#444", marginTop: "4px" }}>
                        {student.email} — {student.phone}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#333" }}>
                      #{student.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {bookingSlotId !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setBookingSlotId(null)}
        >
          <div
            style={{
              background: "var(--dark2)",
              border: "3px solid var(--green)",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "var(--pixel)", fontSize: "8px", color: "var(--green)", marginBottom: "1rem", letterSpacing: "2px" }}>
              SELECT STUDENT TO BOOK SLOT
            </h3>
            <input
              className="pixel-input"
              style={{ width: "100%", fontSize: "7px", marginBottom: "1rem" }}
              type="text"
              placeholder="SEARCH..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
            <div style={{ display: "grid", gap: "8px", maxHeight: "300px", overflow: "auto" }}>
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleBook(student.id)}
                  disabled={isBooking}
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    padding: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#888" }}>
                    {student.name}
                  </div>
                  <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#444", marginTop: "4px" }}>
                    {student.email} — {student.phone}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setBookingSlotId(null)}
              style={{
                fontFamily: "var(--pixel)",
                fontSize: "6px",
                padding: "8px 16px",
                border: "1px solid #333",
                background: "transparent",
                color: "#555",
                cursor: "pointer",
                marginTop: "1rem",
                width: "100%",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Slots;