import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { submitFeedback, fetchCommitteeMembers, FeedbackRating, CommitteeMember } from "../services/apiServices";
import InputGroup from "../ui/InputGroup";
import InputCol from "../ui/InputCol";
import Button from "../ui/Button";
import { SearchablePixelSelect } from "../ui/SearchablePixelSelect";

const RATING_OPTIONS: { value: FeedbackRating; label: string; color: string }[] = [
  { value: "excellent", label: "Excellent", color: "var(--green)" },
  { value: "good", label: "Very Good", color: "var(--blue)" },
  { value: "fair", label: "Good", color: "var(--gold)" },
  { value: "poor", label: "Fair", color: "var(--red-light)" },
];

const QUESTION_LABELS = [
  { key: "ushering", label: "How did you find the ushering member's communication skills?" },
  { key: "information", label: "Was all the information explained clearly?" },
  { key: "friendly", label: "Was the ushering member friendly?" },
  { key: "flyer", label: "How did you find the flyer's content?" },
  { key: "satisfied", label: "How satisfied are you with the registration process?" },
  { key: "design", label: "How would you rate the event design and organization?" },
] as const;

function Feedback() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    ushering: "" as FeedbackRating | "",
    information: "" as FeedbackRating | "",
    friendly: "" as FeedbackRating | "",
    flyer: "" as FeedbackRating | "",
    satisfied: "" as FeedbackRating | "",
    design: "" as FeedbackRating | "",
    comments: "",
  });

  const { data: committeeMembers = [] } = useQuery<CommitteeMember[]>({
    queryKey: ["committee-members"],
    queryFn: fetchCommitteeMembers,
    staleTime: Infinity,
  });

  const submitMutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      navigate("/thank-you?submit=feedback");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ushering || !formData.information || !formData.friendly || !formData.flyer || !formData.satisfied || !formData.design) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitMutation.mutate({
      name: formData.name,
      ushering: formData.ushering,
      information: formData.information,
      friendly: formData.friendly,
      flyer: formData.flyer,
      satisfied: formData.satisfied,
      design: formData.design,
      comments: formData.comments || undefined,
    });
  };

  const handleRatingChange = (field: string, value: FeedbackRating) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <div
        style={{
          background: "var(--red-dark)",
          borderBottom: "3px solid var(--red)",
          padding: "1rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "var(--pixel)", fontSize: "8px", color: "var(--white)", letterSpacing: "3px", marginBottom: "4px" }}>
          APEC'26 PREMIUM
        </div>
        <div style={{ fontFamily: "var(--pixel)", fontSize: "14px", color: "var(--white)", letterSpacing: "2px" }}>
          Ushering & Registration Feedback
        </div>
      </div>

      <div className="pixel-box" style={{ background: "var(--dark2)", padding: "2rem", marginTop: "1rem" }}>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <InputCol>
              <label className="form-label" style={{ fontSize: "6px", marginBottom: "8px", display: "block" }}>
                USHERING MEMBER NAME *
              </label>
              <SearchablePixelSelect
                label="USHERING MEMBER NAME"
                placeholder="Select ushering member"
                options={committeeMembers.map(m => ({ id: m.member_name, name: m.member_name }))}
                value={formData.name}
                onChange={(val: any) => setFormData({ ...formData, name: String(val) })}
              />
            </InputCol>
          </InputGroup>

          <div style={{ marginTop: "1.5rem" }}>
            {QUESTION_LABELS.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "2rem", textAlign: "center" }}>
                <label className="form-label" style={{ fontSize: "7px", display: "block", marginBottom: "12px", textAlign: "center", color: "#888" }}>
                  {label} *
                </label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                  {RATING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRatingChange(key, option.value)}
                      style={{
                        fontFamily: "var(--pixel)",
                        fontSize: "8px",
                        padding: "14px 28px",
                        minWidth: "100px",
                        border: `2px solid ${formData[key as keyof typeof formData] === option.value ? option.color : "#333"}`,
                        background: formData[key as keyof typeof formData] === option.value ? `${option.color}22` : "#0a0a0a",
                        color: formData[key as keyof typeof formData] === option.value ? option.color : "#555",
                        cursor: "pointer",
                        letterSpacing: "1px",
                        transition: "all 0.15s",
                        borderRadius: "4px",
                      }}
                      onMouseEnter={(e) => {
                        if (formData[key as keyof typeof formData] !== option.value) {
                          e.currentTarget.style.borderColor = option.color;
                          e.currentTarget.style.color = option.color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData[key as keyof typeof formData] !== option.value) {
                          e.currentTarget.style.borderColor = "#333";
                          e.currentTarget.style.color = "#555";
                        }
                      }}
                    >
                      {option.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <InputGroup>
            <InputCol>
              <label className="form-label" style={{ fontSize: "6px" }}>
                OTHER COMMENTS TO IMPROVE?
              </label>
              <textarea
                className="form-input"
                style={{ minHeight: "100px", resize: "vertical" }}
                placeholder="Write your comments here..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                maxLength={1000}
              />
              <div style={{ fontFamily: "var(--pixel)", fontSize: "5px", color: "#333", marginTop: "4px", textAlign: "right" }}>
                {formData.comments.length}/1000
              </div>
            </InputCol>
          </InputGroup>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Button type="submit" isLoading={submitMutation.isLoading}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Feedback;