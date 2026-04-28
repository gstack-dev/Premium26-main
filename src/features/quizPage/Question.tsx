import { ChangeEvent } from "react";
import { QuestionType } from "../../pages/Quiz";
import { toast } from "react-hot-toast";

interface QuestionProps {
  q: QuestionType;
  setOnChange: (id: number, value: string, index: string) => void;
  selected: string;
}

const Question = ({ q, setOnChange, selected }: QuestionProps) => {
  const change = (e: ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.selectedIndex;
    let val;
    switch (index) {
      case 1:
        val = "option_a";
        break;
      case 2:
        val = "option_b";
        break;
      case 3:
        val = "option_c";
        break;
      case 4:
        val = "option_d";
        break;
      case 5:
        val = "option_e";
        break;
      default:
        toast.error("Select an option please");
        break;
    }
    setOnChange(q.id, e.target.value, val as string);
  };

  return (
    <div
      style={{
        borderLeft: "4px solid var(--blue)",
        background: "#0a0a0f",
        padding: "1.5rem",
        marginBottom: "1rem",
      }}
    >
      {q.question?.length > 0 && (
        <p
          style={{
            fontFamily: "var(--pixel)",
            fontSize: "8px",
            color: "var(--white)",
            lineHeight: "2.2",
            marginBottom: "1rem",
          }}
        >
          {q.question}
        </p>
      )}
      {q.image_link && (
        <img
          src={q.image_link}
          alt={q.question}
          width={400}
          style={{
            marginBottom: "1rem",
            border: "2px solid #333",
            imageRendering: "pixelated",
            maxWidth: "100%",
          }}
        />
      )}
      <select
        value={selected || ""}
        name={`question_${q.id}`}
        className="pixel-select"
        onChange={change}
      >
        <option value="" disabled>
          ► CHOOSE AN OPTION...
        </option>
        <option value={q.option_a}>A. {q.option_a}</option>
        <option value={q.option_b}>B. {q.option_b}</option>
        {q.option_c?.trim() && (
          <option value={q.option_c}>C. {q.option_c}</option>
        )}
        {q.option_d?.trim() && (
          <option value={q.option_d}>D. {q.option_d}</option>
        )}
        {q.option_e?.trim() && (
          <option value={q.option_e}>E. {q.option_e}</option>
        )}
      </select>
    </div>
  );
};

export default Question;
