"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ExternalLink, FileText, Maximize2, Send, X, ZoomIn, ZoomOut } from "lucide-react";

export type ExerciseItem = {
  id: string;
  titleKh: string;
  descriptionKh: string | null;
  subjectKh: string | null;
  gradeKh: string | null;
  driveUrl: string;
  driveFileId: string;
  renderUrl: string;
  solutionUrl: string | null;
  featured: boolean;
};

type ExerciseSectionProps = {
  exercises: ExerciseItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  telegramUrl?: string | null;
};

export function ExerciseSection({
  exercises,
  eyebrow = "លំហាត់ & វិញ្ញាសាអនុវត្ត",
  title = "ពង្រឹងសមត្ថភាពតាមរយៈលំហាត់ជាក់ស្តែង",
  description = "ទាញយក និងអនុវត្តលំហាត់ត្រៀមប្រឡងតាមកម្រិតថ្នាក់ និងមុខវិជ្ជាផ្សេងៗ។",
  telegramUrl,
}: ExerciseSectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Extract unique filter tags
  const subjects = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.subjectKh?.trim()) set.add(ex.subjectKh.trim());
    });
    return Array.from(set);
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    if (selectedSubject === "all") return exercises;
    return exercises.filter((ex) => ex.subjectKh?.trim() === selectedSubject);
  }, [exercises, selectedSubject]);

  const activeExercise = activeExerciseIndex !== null ? filteredExercises[activeExerciseIndex] : null;

  const openLightbox = (index: number) => {
    setActiveExerciseIndex(index);
    setZoomLevel(1);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setActiveExerciseIndex(null);
    setZoomLevel(1);
    document.body.style.overflow = "";
  }, []);

  const nextExercise = useCallback(() => {
    if (activeExerciseIndex !== null && activeExerciseIndex < filteredExercises.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
      setZoomLevel(1);
    }
  }, [activeExerciseIndex, filteredExercises.length]);

  const prevExercise = useCallback(() => {
    if (activeExerciseIndex !== null && activeExerciseIndex > 0) {
      setActiveExerciseIndex(activeExerciseIndex - 1);
      setZoomLevel(1);
    }
  }, [activeExerciseIndex]);

  // Reset active exercise when filter changes to prevent index out-of-bounds
  useEffect(() => {
    if (activeExerciseIndex !== null && activeExerciseIndex >= filteredExercises.length) {
      setActiveExerciseIndex(null);
      document.body.style.overflow = "";
    }
  }, [activeExerciseIndex, filteredExercises.length]);

  // Clean up body overflow when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeExerciseIndex === null) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") nextExercise();
      if (event.key === "ArrowLeft") prevExercise();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeExerciseIndex, closeLightbox, nextExercise, prevExercise]);

  return (
    <section id="exercises" data-cms-section="exercises" className="section exercise-section paper-grid" style={{ backgroundColor: "#fbfcfe" }}>
      <div className="container">
        <p className="eyebrow" data-cms-key="exercises.eyebrow">
          {eyebrow}
        </p>
        <h2 className="display section-title" data-cms-key="exercises.title">
          {title}
        </h2>
        <p className="section-lead" data-cms-key="exercises.description" data-cms-rich="true">
          {description}
        </p>

        {/* Filter Pills */}
        {subjects.length > 1 && (
          <div className="exercise-filter-bar" role="tablist" aria-label="ជ្រើសរើសមុខវិជ្ជា">
            <button
              type="button"
              className={`exercise-filter-btn ${selectedSubject === "all" ? "active" : ""}`}
              onClick={() => setSelectedSubject("all")}
            >
              ទាំងអស់ ({exercises.length})
            </button>
            {subjects.map((subj) => (
              <button
                key={subj}
                type="button"
                className={`exercise-filter-btn ${selectedSubject === subj ? "active" : ""}`}
                onClick={() => setSelectedSubject(subj)}
              >
                {subj} ({exercises.filter((ex) => ex.subjectKh?.trim() === subj).length})
              </button>
            ))}
          </div>
        )}

        {/* Exercises Cards Grid */}
        {filteredExercises.length > 0 ? (
          <div className="exercise-grid">
            {filteredExercises.map((exercise, index) => (
              <article className="exercise-card" key={exercise.id}>
                <div
                  className="exercise-thumb-wrap"
                  onClick={() => openLightbox(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`បើកមើលរូបភាពពេញ ${exercise.titleKh}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openLightbox(index);
                  }}
                >
                  <img
                    src={exercise.renderUrl}
                    alt={exercise.titleKh}
                    className="exercise-thumb"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="exercise-thumb-overlay">
                    <span className="exercise-zoom-btn">
                      <Maximize2 size={16} aria-hidden="true" />
                      <span>ពង្រីកមើលរូបភាព</span>
                    </span>
                  </div>
                  {exercise.gradeKh && <span className="exercise-badge-grade">{exercise.gradeKh}</span>}
                </div>

                <div className="exercise-body">
                  <div className="exercise-tags">
                    {exercise.subjectKh && <span className="exercise-tag">{exercise.subjectKh}</span>}
                    {exercise.featured && <span className="exercise-tag exercise-tag-featured">★ លំហាត់សំខាន់</span>}
                  </div>
                  <h3 className="exercise-title" title={exercise.titleKh}>
                    {exercise.titleKh}
                  </h3>
                  {exercise.descriptionKh && <p className="exercise-desc">{exercise.descriptionKh}</p>}

                  <div className="exercise-actions">
                    <button
                      type="button"
                      className="button button-primary button-small"
                      onClick={() => openLightbox(index)}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Maximize2 size={14} aria-hidden="true" />
                      <span>មើលលំហាត់</span>
                    </button>
                    {exercise.solutionUrl ? (
                      <a
                        href={exercise.solutionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button button-outline button-small"
                        title="មើលចម្លើយ ឬដំណោះស្រាយ"
                      >
                        <FileText size={14} aria-hidden="true" />
                        <span>ចម្លើយ</span>
                      </a>
                    ) : telegramUrl ? (
                      <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button button-outline button-small"
                        title="សួរគ្រូតាម Telegram"
                      >
                        <Send size={14} aria-hidden="true" />
                        <span>សួរគ្រូ</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="player-empty" style={{ margin: "2rem auto", maxWidth: 460 }}>
            <span>
              <FileText size={36} aria-hidden="true" />
              <br />
              មិនទាន់មានលំហាត់ក្នុងផ្នែកនេះនៅឡើយទេ។
            </span>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {activeExercise && (
        <div className="lightbox-backdrop" onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="lightbox-header">
              <div className="lightbox-info">
                <div className="exercise-tags" style={{ marginBottom: ".2rem" }}>
                  {activeExercise.subjectKh && <span className="exercise-tag">{activeExercise.subjectKh}</span>}
                  {activeExercise.gradeKh && (
                    <span className="exercise-tag" style={{ background: "#e2e8f0", color: "#334155" }}>
                      {activeExercise.gradeKh}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{activeExercise.titleKh}</h3>
              </div>
              <div className="lightbox-controls">
                <button
                  type="button"
                  className="lightbox-tool-btn"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
                  title="ពង្រីក (Zoom in)"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  className="lightbox-tool-btn"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
                  title="បង្រួម (Zoom out)"
                >
                  <ZoomOut size={18} />
                </button>
                <a
                  href={activeExercise.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="lightbox-tool-btn"
                  title="បើកមើលក្នុង Google Drive / ទាញយក"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  type="button"
                  className="lightbox-tool-btn lightbox-close-btn"
                  onClick={closeLightbox}
                  title="បិទ (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Image Viewer Container */}
            <div className="lightbox-content">
              <div className="lightbox-image-wrap">
                <img
                  src={activeExercise.renderUrl}
                  alt={activeExercise.titleKh}
                  className="lightbox-image"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.2s ease-out",
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Footer with actions and navigation */}
            <div className="lightbox-footer">
              <div className="lightbox-nav-btns">
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={prevExercise}
                  disabled={activeExerciseIndex === 0}
                >
                  ← មុន
                </button>
                <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                  {activeExerciseIndex! + 1} / {filteredExercises.length}
                </span>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={nextExercise}
                  disabled={activeExerciseIndex === filteredExercises.length - 1}
                >
                  បន្ទាប់ →
                </button>
              </div>
              <div className="lightbox-actions-right">
                {activeExercise.solutionUrl && (
                  <a
                    href={activeExercise.solutionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-outline button-small"
                  >
                    <FileText size={14} aria-hidden="true" />
                    <span>មើលចម្លើយ</span>
                  </a>
                )}
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-primary button-small"
                  >
                    <Send size={14} aria-hidden="true" />
                    <span>សួរគ្រូតាម Telegram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
