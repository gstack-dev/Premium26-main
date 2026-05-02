import { useState, useRef, useEffect } from "react";
import { EntityOption } from "../types/form";
import { resumeAudio, usePixelSound } from "../services/usePixelSound";

interface SearchablePixelSelectProps {
  label: string;
  options: EntityOption[];
  value: string | number;
  onChange: (value: number | string) => void;
  error?: string;
  placeholder?: string;
}

export function SearchablePixelSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
}: SearchablePixelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const play = usePixelSound();

  // Find current selected name
  const selectedOption = options.find((o) => String(o.id) === String(value));
  
  // Filter options
  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ position: "relative", width: "100%" }}
    >
      <div
        className={`pixel-select ${isOpen ? "open" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          padding: "10px 14px",
          minHeight: "42px",
          borderColor: error ? "var(--red-light)" : undefined,
        }}
        onClick={() => {
          resumeAudio();
          play("click");
          setIsOpen(!isOpen);
        }}
      >
        <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? `► ${selectedOption.name}` : placeholder || `► SELECT ${label.toUpperCase()}...`}
        </div>
        <div style={{ fontSize: "6px", marginLeft: "10px" }}>{isOpen ? "▲" : "▼"}</div>
      </div>

      {isOpen && (
        <div
          className="pixel-box"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--dark2)",
            marginTop: "4px",
            maxHeight: "300px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* Search Input */}
          <div style={{ padding: "8px", borderBottom: "1px solid #222" }}>
            <input
              autoFocus
              type="text"
              className="pixel-input"
              placeholder="SEARCH..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                resumeAudio();
                play("click");
              }}
              style={{
                fontSize: "7px",
                padding: "8px",
                width: "100%",
                background: "#0a0a0a",
              }}
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <div
                  key={option.id}
                  style={{
                    padding: "10px 14px",
                    fontSize: "7px",
                    color: String(option.id) === String(value) ? "var(--gold)" : "#888",
                    cursor: "pointer",
                    background: String(option.id) === String(value) ? "#1a1a1a" : "transparent",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a1a1a";
                    e.currentTarget.style.color = "var(--white)";
                  }}
                  onMouseLeave={(e) => {
                    if (String(option.id) !== String(value)) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#888";
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeAudio();
                    play("click");
                    onChange(option.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  ► {option.name}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px", fontSize: "6px", color: "#444", textAlign: "center" }}>
                NO RESULTS FOUND
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
