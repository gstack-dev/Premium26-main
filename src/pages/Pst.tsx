import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  fetchPstQuestions,
  getApiErrorMessage,
  lookupStudent,
  resolveStorageUrl,
  submitPstAnswers,
} from "../services/apiServices";
import {
  PstAnswer,
  PstQuestion,
  StudentLookupResponse,
} from "../types/form";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { resumeAudio, usePixelSound } from "../services/usePixelSound";

type LookupFormData = {
  identifier: string;
};

const pstDurationSeconds = 45 * 60;

function formatTimer(timer: number) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return `${String(minutes).padStart(2, "0")}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

function getAnswersStorageKey(studentId: number) {
  return `premium26PstAnswers-${studentId}`;
}

function isPstAlreadySubmitted(student: StudentLookupResponse) {
  return Boolean(student.pst_result || student.status === "selection");
}

function QuestionBlock({
  question,
  selectedOptionId,
  onSelect,
}: {
  question: PstQuestion;
  selectedOptionId?: number;
  onSelect: (questionId: number, optionId: number) => void;
}) {
  const questionImages = question.image_urls?.length
    ? question.image_urls
    : question.image_url
    ? [question.image_url]
    : question.image_paths?.length
    ? question.image_paths
    : question.image_path
    ? [question.image_path]
    : [];

  return (
    <fieldset
      style={{
        border: "none",
        borderLeft: "4px solid var(--blue)",
        background: "#0a0a0f",
        padding: "1.5rem",
        marginTop: "1.5rem",
      }}
    >
      <legend
        style={{
          fontFamily: "var(--pixel)",
          fontSize: "6px",
          color: "var(--blue)",
          padding: "0 8px",
          letterSpacing: "2px",
        }}
      >
        {question.category} — {question.difficulty}
      </legend>

      {question.question_text && (
        <p
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: "15px",
            color: "var(--white)",
            lineHeight: "1.6",
            marginBottom: "1.5rem",
            fontWeight: "bold",
          }}
        >
          {question.question_text}
        </p>
      )}

      <div style={{ marginBottom: "1rem" }}>
        {questionImages.map((imagePath) => {
          const imageUrl = resolveStorageUrl(imagePath);
          if (!imageUrl) return null;
          return (
            <img
              key={imagePath}
              src={imageUrl}
              alt={question.question_text || `Question ${question.id}`}
              style={{
                maxWidth: "100%",
                border: "2px solid #333",
                marginBottom: "8px",
                imageRendering: "pixelated",
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {question.options.map((option) => {
          const optionImages = option.image_urls?.length
            ? option.image_urls
            : option.image_url
            ? [option.image_url]
            : option.image_paths?.length
            ? option.image_paths
            : option.image_path
            ? [option.image_path]
            : [];

          const isSelected = selectedOptionId === option.id;

          return (
            <label
              key={option.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                border: `2px solid ${isSelected ? "var(--gold)" : "#333"}`,
                background: isSelected ? "#1a1500" : "#0a0a0a",
                padding: "10px 14px",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: "14px",
                color: isSelected ? "var(--gold)" : "var(--white)",
                fontWeight: "bold",
              }}
            >
              <input
                style={{ marginTop: "2px", accentColor: "var(--gold)" }}
                type="radio"
                name={`question-${question.id}`}
                checked={isSelected}
                onChange={() => onSelect(question.id, option.id)}
              />
              <span style={{ flex: 1 }}>
                <span style={{ fontWeight: "bold", marginRight: "8px", color: "var(--blue)" }}>
                  {option.label}.
                </span>
                {option.text && <span>{option.text}</span>}
                {optionImages.map((imagePath) => {
                  const imageUrl = resolveStorageUrl(imagePath);
                  if (!imageUrl) return null;
                  return (
                    <img
                      key={imagePath}
                      src={imageUrl}
                      alt={`Option ${option.label}`}
                      style={{
                        maxWidth: "100%",
                        marginTop: "8px",
                        border: "1px solid #333",
                        imageRendering: "pixelated",
                      }}
                    />
                  );
                })}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const WARNING_SECONDS = 60;

// ── Cross-browser fullscreen helpers ──
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
function supportsFullscreen() {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  return !isIOS() && Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}
function enterFullscreen() {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  return Promise.resolve();
}
function exitFullscreenSafe() {
  const doc = document as Document & { webkitExitFullscreen?: () => Promise<void>; webkitFullscreenElement?: Element | null };
  const inFs = doc.fullscreenElement || doc.webkitFullscreenElement;
  if (!inFs) return;
  if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
  else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
}
function getFullscreenElement() {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return doc.fullscreenElement || doc.webkitFullscreenElement || null;
}

function Pst() {
  const navigate = useNavigate();
  const play = usePixelSound();
  const [student, setStudent] = useState<StudentLookupResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timer, setTimer] = useState(pstDurationSeconds);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [autoSubmissionTriggered, setAutoSubmissionTriggered] = useState(false);
  // Anti-cheat state
  const [, setIsFullscreen] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const isWarningRef = useRef(isWarning);
  useEffect(() => {
    isWarningRef.current = isWarning;
  }, [isWarning]);
  const [warningCountdown, setWarningCountdown] = useState(WARNING_SECONDS);
  const [violationCount, setViolationCount] = useState(0);
  // Instructions modal — shown after questions load, before timer starts
  const [showInstructions, setShowInstructions] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  // Image preloading state
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [imagesTotal, setImagesTotal] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const iosDevice = isIOS();
  const fsSupported = supportsFullscreen();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupFormData>();

  const {
    mutate: runLookup,
    isLoading: isLookingUp,
    reset: resetLookup,
  } = useMutation({
    mutationFn: lookupStudent,
    onSuccess: (data) => {
      play("success");
      setStudent(data);
      setTimer(pstDurationSeconds);
      setHasSubmitted(false);
      localStorage.removeItem(getAnswersStorageKey(data.id));
      setAnswers({});
      resetLookup();
    },
    onError: (error) => {
      play("error");
      toast.error(getApiErrorMessage(error));
    },
  });

  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isError: isQuestionsError,
  } = useQuery({
    queryKey: ["premium26-pst-questions", student?.id],
    queryFn: fetchPstQuestions,
    enabled: Boolean(student && !isPstAlreadySubmitted(student)),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const { mutate: submitPst, isLoading: isSubmitting } = useMutation({
    mutationFn: submitPstAnswers,
    onSuccess: (data) => {
      if (student) {
        localStorage.removeItem(getAnswersStorageKey(student.id));
      }
      localStorage.setItem("premium26PstComplete", "true");
      void data;
      setHasSubmitted(true);
      play("submit");
      toast.success("PST submitted successfully");
      if (autoSubmissionTriggered) {
        navigate("/", { replace: true });
      } else {
        navigate("/pst/complete", { replace: true, state: data.data });
      }
    },
    onError: (error) => {
      play("error");
      toast.error(getApiErrorMessage(error));
    },
  });

  const questionsReady = Boolean(questions && questions.length === 68);

  // ── Preload all question images after data loads ──
  useEffect(() => {
    if (!questionsReady || !questions || imagesReady) return;

    // Collect every unique resolved image URL across questions + options
    const urls = new Set<string>();
    questions.forEach((q) => {
      const qImgs = q.image_urls?.length
        ? q.image_urls
        : q.image_url
        ? [q.image_url]
        : q.image_paths?.length
        ? q.image_paths
        : q.image_path
        ? [q.image_path]
        : [];
      qImgs.forEach((p) => { const u = resolveStorageUrl(p); if (u) urls.add(u); });

      q.options.forEach((opt) => {
        const oImgs = opt.image_urls?.length
          ? opt.image_urls
          : opt.image_url
          ? [opt.image_url]
          : opt.image_paths?.length
          ? opt.image_paths
          : opt.image_path
          ? [opt.image_path]
          : [];
        oImgs.forEach((p) => { const u = resolveStorageUrl(p); if (u) urls.add(u); });
      });
    });

    const urlList = Array.from(urls);
    if (urlList.length === 0) {
      // No images — skip straight to ready
      setImagesTotal(0);
      setImagesReady(true);
      return;
    }

    setImagesTotal(urlList.length);
    setImagesLoaded(0);

    let settled = 0;
    urlList.forEach((src) => {
      const img = new Image();
      const done = () => {
        settled += 1;
        setImagesLoaded(settled);
        if (settled === urlList.length) setImagesReady(true);
      };
      img.onload = done;
      img.onerror = done; // count failures too — don't get stuck
      img.src = src;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsReady]);

  // Show instructions modal only after images are preloaded
  useEffect(() => {
    if (questionsReady && imagesReady && !examStarted && !showInstructions) {
      setShowInstructions(true);
    }
  }, [questionsReady, imagesReady, examStarted, showInstructions]);
  const selectedAnswers = useMemo<PstAnswer[]>(
    () =>
      Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: Number(questionId),
        option_id: optionId,
      })),
    [answers]
  );

  const submitCurrentAnswers = useCallback(
    (isAutoSubmit: boolean) => {
      if (!student || isSubmitting || hasSubmitted) return;

      if (!isAutoSubmit && selectedAnswers.length === 0) {
        toast.error("At least one answered question is required.");
        return;
      }

      const payloadAnswers: PstAnswer[] = questions
        ? questions.map((q) => {
            const answered = selectedAnswers.find((a) => a.question_id === q.id);
            return {
              question_id: q.id,
              option_id: answered ? answered.option_id : null,
            };
          })
        : selectedAnswers;

      // Stop repeating if it's an auto submit
      if (isAutoSubmit) {
        setHasSubmitted(true);
        setAutoSubmissionTriggered(true);
      }

      submitPst(
        {
          student_id: student.id,
          token: student.token,
          answers: payloadAnswers,
        },
        {
          onError: () => {
            if (isAutoSubmit) {
              navigate("/", { replace: true });
            }
          },
        }
      );
    },
    [hasSubmitted, isSubmitting, questions, selectedAnswers, student, submitPst, navigate]
  );

  // ── Persist answers (Removed to enforce fresh start on reopen) ──


  // ── Countdown timer — only runs after exam is started (instructions dismissed) ──
  useEffect(() => {
    if (!student || !questionsReady || hasSubmitted || isSubmitting || !examStarted) return;
    if (timer <= 0) { submitCurrentAnswers(true); return; }
    const id = window.setInterval(() => {
      setTimer((t) => {
        const next = Math.max(t - 1, 0);
        // Play tick every 10 seconds (quiet heartbeat)
        if (next % 10 === 0 && next > 0) play("tick");
        // Play danger sound once when entering last-5-min zone
        if (next === 5 * 60 - 1) play("danger");
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [hasSubmitted, isSubmitting, questionsReady, student, submitCurrentAnswers, timer, examStarted, play]);

  // ── Enter fullscreen when exam starts (not on iOS — no API support) ──
  useEffect(() => {
    if (!examStarted || hasSubmitted || !fsSupported) return;
    enterFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    return () => exitFullscreenSafe();
  }, [examStarted, hasSubmitted, fsSupported]);

  // ── Fullscreen change detection (standard + webkit) ──
  useEffect(() => {
    if (!student || !questionsReady || hasSubmitted || !fsSupported) return;
    const onFsChange = () => {
      const inFs = Boolean(getFullscreenElement());
      setIsFullscreen(inFs);
      if (!inFs && examStarted && !hasSubmitted) {
        if (!isWarningRef.current) {
          play("warning");
          setIsWarning(true);
          setWarningCountdown(WARNING_SECONDS);
          setViolationCount((prev) => {
            const next = prev + 1;
            if (next >= 5) {
              toast.error("MISSION ABORTED: TOO MANY VIOLATIONS", { duration: 5000 });
              submitCurrentAnswers(true);
            }
            return next;
          });
        }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [student, questionsReady, hasSubmitted, fsSupported, examStarted, play]);

  // ── Visibility change detection ──
  useEffect(() => {
    if (!student || !questionsReady || hasSubmitted) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && !hasSubmitted) {
        if (!isWarningRef.current) {
          play("warning");
          setIsWarning(true);
          setWarningCountdown(WARNING_SECONDS);
          setViolationCount((prev) => {
            const next = prev + 1;
            if (next >= 5) {
              toast.error("MISSION ABORTED: TOO MANY VIOLATIONS", { duration: 5000 });
              submitCurrentAnswers(true);
            }
            return next;
          });
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onBlur = () => {
      if (examStarted && !hasSubmitted && !isWarningRef.current) {
        play("warning");
        setIsWarning(true);
        setWarningCountdown(WARNING_SECONDS);
        setViolationCount((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            toast.error("MISSION ABORTED: TOO MANY VIOLATIONS", { duration: 5000 });
            submitCurrentAnswers(true);
          }
          return next;
        });
      }
    };
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [student, questionsReady, hasSubmitted, play, examStarted, submitCurrentAnswers]);

  // ── Warning countdown — auto-submit when it hits 0 ──
  useEffect(() => {
    if (!isWarning || hasSubmitted) return;
    if (warningCountdown <= 0) {
      setIsWarning(false);
      submitCurrentAnswers(true);
      return;
    }
    const id = window.setInterval(() => {
      setWarningCountdown((c) => Math.max(c - 1, 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isWarning, warningCountdown, hasSubmitted, submitCurrentAnswers]);

  // ── Keyboard / context-menu guards ──
  useEffect(() => {
    if (!student || !questionsReady || hasSubmitted) return;
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (
        e.key === "PrintScreen" ||
        (isCmdOrCtrl && isShift && e.key.toLowerCase() === "s") || // Snipping tool
        (isCmdOrCtrl && ["s", "u", "p"].includes(e.key.toLowerCase())) // Save, View Source, Print
      ) {
        e.preventDefault();
        toast.error("Screenshots, saving, and printing are not allowed during the PST.");
      }
      // Block Escape from exiting fullscreen (can't fully prevent but warn)
      if (e.key === "Escape") {
        toast.error("⚠ Do not leave fullscreen — your PST will be submitted!", { duration: 3000 });
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasSubmitted, questionsReady, student]);

  // ── Return-to-fullscreen helper (cross-browser) ──
  function handleReturnToFullscreen() {
    play("click");
    setIsWarning(false);
    setWarningCountdown(WARNING_SECONDS);
    if (fsSupported) {
      enterFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  }

  // ── Start exam from instructions modal ──
  function handleStartExam() {
    play("start");
    setShowInstructions(false);
    setExamStarted(true);
  }

  function onLookupSubmit(data: LookupFormData) {
    play("click");
    runLookup({ identifier: data.identifier.trim() });
  }

  function handleAnswerChange(questionId: number, optionId: number) {
    play("select");
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));
  }

  // Timer HP percent
  const timerPct = (timer / pstDurationSeconds) * 100;
  const timerDanger = timer < 5 * 60; // under 5 min

  // Pac-Man timer bar — dots eaten = time consumed
  const totalDots = 20;
  const remainingDots = Math.round((timer / pstDurationSeconds) * totalDots);

  return (
    <>
    {/* ── INSTRUCTIONS MODAL ── */}
    {showInstructions && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "rgba(0,0,0,0.96)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            background: "#0d0d0d",
            border: "3px solid var(--red)",
            boxShadow: "0 0 0 3px #0a0a0a, 0 0 0 6px var(--red-dark), 0 0 40px rgba(204,0,0,0.4)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--pixel)", fontSize: "clamp(10px,2.5vw,14px)", color: "var(--red-light)", textShadow: "3px 3px 0 var(--red-dark)", letterSpacing: "3px", lineHeight: 2 }}>
              ⚔ PST BATTLE — PREMIUM 26
            </div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: "7px", color: "#555", marginTop: "6px", letterSpacing: "2px" }}>
              READ CAREFULLY BEFORE YOU BEGIN
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, var(--red), transparent)" }} />

          {/* Instructions list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { icon: "⏱", color: "var(--blue)",  text: "You have 45 MINUTES to complete the 68 questions. The timer starts the moment you click START." },
              { icon: "📵", color: "var(--red-light)", text: "Do NOT switch tabs, minimize the browser, or leave this page. Doing so triggers a 60-second warning countdown." },
              { icon: "💀", color: "var(--red-light)", text: "If you do not return within 60 seconds, your answers will be AUTO-SUBMITTED immediately." },
              { icon: "🖥",  color: "var(--gold)",  text: fsSupported ? "The exam will run in FULLSCREEN MODE. Exiting fullscreen will trigger the warning." : "You are on iOS/Safari. Stay on this page at all times — switching apps or tabs will trigger the warning." },
              { icon: "🚫", color: "#ff6666",      text: "Right-click, screenshots (PrintScreen), and Ctrl+S/U are DISABLED during the exam." },
              { icon: "✅", color: "var(--green)",  text: "You can skip questions, but you must answer at least one before submitting. You can change answers anytime." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
                <p style={{ fontFamily: "var(--pixel)", fontSize: "clamp(6px,1.5vw,8px)", color: item.color, lineHeight: 2.2, margin: 0 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

          {/* iOS-specific note */}
          {iosDevice && (
            <div style={{ background: "#1a1000", border: "2px solid #553300", padding: "12px 16px" }}>
              <p style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "var(--gold)", lineHeight: 2.2, margin: 0 }}>
                📱 iPHONE / iPAD DETECTED
                <br />
                Fullscreen mode is not supported on iOS Safari.
                <br />
                Keep this tab open and DO NOT switch apps.
                <br />
                Leaving the browser will trigger the warning timer.
              </p>
            </div>
          )}

          {/* Acknowledgement */}
          <p style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", textAlign: "center", lineHeight: 2, margin: 0 }}>
            BY CLICKING START YOU AGREE TO THESE RULES.
            <br />
            ANY VIOLATION WILL RESULT IN AUTO-SUBMISSION.
          </p>

          {/* Start button */}
          <button
            onClick={handleStartExam}
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "clamp(9px,2vw,12px)",
              padding: "16px 32px",
              border: "3px solid var(--gold)",
              background: "#332200",
              color: "var(--gold)",
              cursor: "pointer",
              letterSpacing: "3px",
              width: "100%",
              textTransform: "uppercase",
              animation: "flash-gold 2s step-end infinite",
            }}
          >
            ▶ I UNDERSTAND — START EXAM
          </button>
        </div>
      </div>
    )}

    {/* ── WARNING OVERLAY ── */}
    {isWarning && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "rgba(0,0,0,0.94)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        {/* Scanline */}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.2) 2px,rgba(0,0,0,0.2) 4px)", pointerEvents: "none" }} />

        {/* Skull icon */}
        <div style={{ fontFamily: "var(--pixel)", fontSize: "clamp(24px,5vw,48px)", animation: "danger-blink 0.5s step-end infinite" }}>☠</div>

        {/* Title */}
        <div style={{ fontFamily: "var(--pixel)", fontSize: "clamp(10px,2vw,16px)", color: "var(--red-light)", textShadow: "3px 3px 0 var(--red-dark)", textAlign: "center", letterSpacing: "3px", lineHeight: 2 }}>
          ⚠ SECURITY VIOLATION ⚠
        </div>

        {/* Message */}
        <div style={{ fontFamily: "var(--pixel)", fontSize: "clamp(7px,1.2vw,10px)", color: "#ccc", textAlign: "center", lineHeight: 2.5, maxWidth: "480px", padding: "0 1rem" }}>
          YOU LEFT THE EXAM WINDOW!
          <br />
          RETURN IMMEDIATELY OR YOUR PST
          <br />
          WILL BE AUTO-SUBMITTED.
          <br />
          <span style={{ color: "var(--red-light)", marginTop: "1rem", display: "inline-block" }}>
            VIOLATION {violationCount} / 5
          </span>
        </div>

        {/* Countdown ring */}
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="120" height="120" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#330000" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={warningCountdown > 20 ? "var(--red)" : "var(--red-light)"}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - warningCountdown / WARNING_SECONDS)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div style={{ fontFamily: "var(--pixel)", fontSize: "clamp(18px,4vw,28px)", color: warningCountdown > 20 ? "var(--red-light)" : "#ff6600", animation: warningCountdown <= 10 ? "danger-blink 0.4s step-end infinite" : "none", zIndex: 1 }}>
            {warningCountdown}
          </div>
        </div>

        {/* Return button */}
        <button
          onClick={handleReturnToFullscreen}
          style={{
            fontFamily: "var(--pixel)",
            fontSize: "clamp(8px,1.5vw,11px)",
            padding: "14px 28px",
            border: "3px solid var(--gold)",
            background: "#332200",
            color: "var(--gold)",
            cursor: "pointer",
            letterSpacing: "2px",
            animation: "flash-gold 1s step-end infinite",
          }}
        >
          ▶ RETURN TO EXAM
        </button>

        {/* Bottom warning */}
        <div style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#555", letterSpacing: "2px" }}>
          LEAVING AGAIN WILL SUBMIT YOUR ANSWERS
        </div>
      </div>
    )}

    <section
      style={{
        maxWidth: "900px",
        margin: "3rem auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
    >
      {/* ── Title bar ── */}
      <div
        style={{
          background: "var(--red-dark)",
          borderBottom: "3px solid var(--red)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--white)" }}>
          ⚔ PST BATTLE — PREMIUM 26
        </div>
        <div style={{ fontSize: "6px", color: "#cc6666" }}>
          PROBLEM SOLVING TEST
        </div>
      </div>

      {/* ── Lookup form ── */}
      {!student && (
        <div
          className="pixel-box"
          style={{ padding: "2rem", background: "var(--dark2)", marginTop: "0" }}
        >
          <p style={{ fontSize: "8px", color: "var(--gold)", marginBottom: "1.5rem" }}>
            ▶ ENTER YOUR CREDENTIALS TO BEGIN
          </p>
          <form onSubmit={handleSubmit(onLookupSubmit)}>
            <label className="form-label" htmlFor="identifier">
              📧 REGISTERED EMAIL OR PHONE
            </label>
            <input
              id="identifier"
              className="pixel-input"
              type="text"
              placeholder="YOUR EMAIL OR PHONE NUMBER"
              onFocus={() => { resumeAudio(); play("click"); }}
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

      {/* ── Already submitted ── */}
      {student && isPstAlreadySubmitted(student) && (
        <div
          className="pixel-box-gold"
          style={{
            padding: "2rem",
            background: "#0a0800",
            textAlign: "center",
            marginTop: "0",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--gold)",
              animation: "flash-gold 1.5s step-end infinite",
              marginBottom: "1rem",
            }}
          >
            ✓ PST ALREADY SUBMITTED
          </div>
          <p style={{ fontSize: "7px", color: "#888", lineHeight: "2.5", letterSpacing: "1px", marginBottom: "1.5rem" }}>
            YOU HAVE ALREADY DONE THE PST ONCE.
            <br />
            WE HAVE RECEIVED YOUR ANSWERS AND YOU WILL BE NOTIFIED
            <br />
            OF THE NEXT STEPS VIA EMAIL SOON.
          </p>
        </div>
      )}

      {/* ── Loading questions ── */}
      {student && !isPstAlreadySubmitted(student) && (isLoadingQuestions || (questionsReady && !imagesReady)) && (
        <Spinner
          progress={
            isLoadingQuestions
              ? undefined  // API loading — indeterminate
              : imagesTotal > 0
              ? Math.round((imagesLoaded / imagesTotal) * 100)
              : undefined
          }
          label={
            isLoadingQuestions
              ? "LOADING QUESTIONS..."
              : `LOADING IMAGES... ${imagesLoaded}/${imagesTotal}`
          }
        />
      )}

      {/* ── Error ── */}
      {student && !isPstAlreadySubmitted(student) && isQuestionsError && (
        <div
          className="pixel-box"
          style={{ padding: "2rem", background: "var(--dark2)", textAlign: "center", marginTop: "0" }}
        >
          <p style={{ fontSize: "8px", color: "var(--red-light)" }}>
            ✕ PST QUESTIONS UNAVAILABLE
          </p>
          <p style={{ fontSize: "6px", color: "#555", marginTop: "1rem" }}>
            Please try again later.
          </p>
        </div>
      )}

      {/* ── Incomplete question set ── */}
      {student &&
        !isPstAlreadySubmitted(student) &&
        questions &&
        questions.length !== 68 && (
          <div
            className="pixel-box"
            style={{ padding: "2rem", background: "var(--dark2)", textAlign: "center", marginTop: "0" }}
          >
            <p style={{ fontSize: "8px", color: "var(--red-light)" }}>
              ⚠ PST NOT AVAILABLE
            </p>
            <p style={{ fontSize: "6px", color: "#555", marginTop: "1rem" }}>
              The question set is incomplete. Please try again later.
            </p>
          </div>
        )}

      {/* ── Active PST ── */}
      {student && !isPstAlreadySubmitted(student) && questionsReady && questions && (
        <>
          {/* Sticky HUD */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "#060606",
              borderBottom: "2px solid #1a1a1a",
              padding: "1rem 1.5rem",
            }}
          >
            {/* Timer display */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div className="hud-badge">
                  ⏱ TIME{" "}
                  <span
                    style={{
                      color: timerDanger ? "var(--red-light)" : "var(--blue)",
                      animation: timerDanger ? "danger-blink 0.6s step-end infinite" : "none",
                    }}
                  >
                    {formatTimer(timer)}
                  </span>
                </div>
                <div className="hud-badge">
                  Q{" "}
                  <span style={{ color: "var(--gold)" }}>
                    {selectedAnswers.length} / {questions.length}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                isLoading={isSubmitting}
                variant="gold"
                onClick={() => submitCurrentAnswers(false)}
              >
                ▶ SUBMIT PST
              </Button>
            </div>

            {/* Pac-Man Timer Bar */}
            <div style={{ marginBottom: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--pixel)",
                  fontSize: "6px",
                  color: timerDanger ? "var(--red-light)" : "#555",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: timerDanger ? "var(--red-light)" : "var(--green)" }}>
                  ⬤ TIME REMAINING
                </span>
                <span>{formatTimer(timer)}</span>
              </div>

              {/* The Pac-Man track */}
              <div
                style={{
                  position: "relative",
                  height: "28px",
                  background: "#0a0a0a",
                  border: `2px solid ${timerDanger ? "var(--red)" : "#333"}`,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                }}
              >
                {/* Eaten zone (dark track) */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${100 - timerPct}%`,
                    background: "rgba(0,0,0,0.6)",
                    transition: "width 1s linear",
                    zIndex: 0,
                  }}
                />

                {/* Dots row */}
                <div
                  style={{
                    position: "absolute",
                    left: "28px",
                    right: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    zIndex: 1,
                    justifyContent: "space-around",
                  }}
                >
                  {Array.from({ length: totalDots }).map((_, i) => {
                    const isEaten = i >= remainingDots;
                    return (
                      <div
                        key={i}
                        style={{
                          width: isEaten ? "0px" : "5px",
                          height: isEaten ? "0px" : "5px",
                          borderRadius: "50%",
                          background: timerDanger ? "var(--red-light)" : "var(--gold)",
                          opacity: isEaten ? 0 : 0.9,
                          transition: "all 0.4s step-end",
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Pac-Man character — positioned at the eaten/remaining boundary */}
                <div
                  style={{
                    position: "absolute",
                    left: `calc(${100 - timerPct}% - 2px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    transition: "left 1s linear",
                    zIndex: 2,
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    style={{ imageRendering: "pixelated", display: "block" }}
                  >
                    <path
                      style={{
                        animation: timerDanger
                          ? "pacman-chomp 0.3s step-end infinite"
                          : "pacman-chomp 0.5s step-end infinite",
                      }}
                      fill={timerDanger ? "var(--red-light)" : "var(--gold)"}
                      d="M11,11 L20,5 A10,10 0 1,0 20,17 Z"
                    />
                    {/* eye */}
                    <rect x="13" y="5" width="2" height="2" fill="#0a0a0a" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div
            style={{ padding: "0 1.5rem 2rem", background: "var(--dark2)", border: "3px solid var(--red)", borderTop: "none" }}
          >
            {questions.map((question) => (
              <QuestionBlock
                key={question.id}
                question={question}
                selectedOptionId={answers[question.id]}
                onSelect={handleAnswerChange}
              />
            ))}

            {/* Bottom submit */}
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
              <Button
                type="button"
                isLoading={isSubmitting}
                variant="gold"
                onClick={() => submitCurrentAnswers(false)}
              >
                ▶ SUBMIT PST
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
    </>
  );
}

export default Pst;
