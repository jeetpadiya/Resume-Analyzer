import { useEffect, useState } from "react";
import API from "../service/api";
import Navigation from "../components/Navigation";
import type { AnalysisResult, ResumeHistoryItem } from "../type/types";
import "../styles/ResumeHistory.css";
import { MdDelete } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import RenamePopup from "../Popups/RenamePopup";



const ScoreRing = ({ score }: { score: number }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#2dd4bf" : score >= 50 ? "#a48fff" : "#e85d9a";

  return (
    <svg width="92" height="92" viewBox="0 0 92 92">
      <circle cx="46" cy="46" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx="46"
        cy="46"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 46 46)"
      />
      <text x="46" y="50" textAnchor="middle" fill="#f0eeff" fontSize="15" fontWeight="600" fontFamily="DM Sans, sans-serif">
        {score}
      </text>
    </svg>
  );
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ResumeHistory = () => {
  const [mounted, setMounted] = useState(false);
  const [resumes, setResumes] = useState<ResumeHistoryItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [isRenamePopupOpen, setIsRenamePopupOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeHistoryItem | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setListLoading(true);
        setListError("");

        const res = await API.get("/resume/history");
        const history = res.data.data as ResumeHistoryItem[];

        setResumes(history);

        const firstAnalyzedResume = history.find((item) => item.latestAnalysis)?._id || history[0]?._id || "";
        setSelectedResumeId(firstAnalyzedResume);
      } catch (error: any) {
        setListError(error.response?.data?.message || "Unable to load your resume history");
      } finally {
        setListLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedResumeId) {
        setSelectedAnalysis(null);
        setDetailsError("");
        return;
      }

      try {
        setDetailsLoading(true);
        setDetailsError("");
        const res = await API.get(`/resume/${selectedResumeId}/analysis`);
        setSelectedAnalysis(res.data.data);
      } catch (error: any) {
        setSelectedAnalysis(null);
        setDetailsError(error.response?.data?.message || "This resume has not been analyzed yet");
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedResumeId]);


  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }

    try {
      await API.delete(`/resume/${resumeId}`);
      setResumes((prev) => prev.filter((item) => item._id !== resumeId));
      if (selectedResumeId === resumeId) {
        setSelectedResumeId("");
        setSelectedAnalysis(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete the resume. Please try again.");
    }
  }

  const handleEditResume = (resume: ResumeHistoryItem) => {
    setEditingResume(resume);
    setIsRenamePopupOpen(true);
  };

  const handleRenameSubmit = async (newName: string) => {
    if (!editingResume?._id) {
      alert("No resume selected for editing.");
      return;
    }

    try {
      setRenameLoading(true);
      const res = await API.put(`/resume/${editingResume._id}`, {
        originalFileName: newName,
      });

      const updatedResume = res.data.data as ResumeHistoryItem;

      setResumes((prev) =>
        prev.map((item) =>
          item._id === editingResume._id
            ? {
                ...item,
                originalFileName: updatedResume.originalFileName,
                updatedAt: updatedResume.updatedAt,
              }
            : item
        )
      );

      setEditingResume((prev) =>
        prev
          ? {
              ...prev,
              originalFileName: updatedResume.originalFileName,
              updatedAt: updatedResume.updatedAt,
            }
          : prev
      );
      setIsRenamePopupOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update the resume. Please try again.");
    } finally {
      setRenameLoading(false);
    }
  };

  const selectedResume = resumes.find((resume) => resume._id === selectedResumeId) || null;

  return (
    <>
      <Navigation />
      <div className="history-root">
        <div className="history-blob history-blob-1" />
        <div className="history-blob history-blob-2" />
        <div className="history-grid" />

        <div className={`history-content ${mounted ? "visible" : ""}`}>
          <div className="history-header">
            <p className="history-eyebrow">Library</p>
            <h1 className="history-title">Your Resume History</h1>
            <p className="history-subtitle">Browse uploaded resumes, reopen earlier analyses, and inspect score breakdowns without re-uploading files.</p>
          </div>

          <div className="history-layout">
            <section className="history-panel history-list-panel">
              <div className="history-panel-head">
                <div>
                  <p className="history-panel-label">Uploaded Resumes</p>
                  <h2 className="history-panel-title">Saved entries</h2>
                </div>
                <span className="history-count">{resumes.length}</span>
              </div>

              {listLoading ? <div className="history-state">Loading resume history...</div> : null}
              {listError ? <div className="history-state error">{listError}</div> : null}
              {!listLoading && !listError && resumes.length === 0 ? (
                <div className="history-state">No resumes uploaded yet. Upload one from the dashboard to start building history.</div>
              ) : null}

              <div className="history-list">
                {resumes.map((resume) => (
                  <button
                    key={resume._id}
                    className={`history-item ${selectedResumeId === resume._id ? "active" : ""}`}
                    onClick={() => setSelectedResumeId(resume._id)}
                    type="button"
                  >
                    <div className="history-item-top">
                      <div>
                        <div className="history-item-title">
                          {resume.originalFileName}
                          <MdDelete
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteResume(resume._id);
                            }}
                            size={28}
                            className="cursor-pointer"
                          />
                          <MdEditDocument
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditResume(resume);
                            }}
                            size={28}
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="history-item-meta">Uploaded {formatDate(resume.createdAt)}</div>
                      </div>
                      <span className={`history-status ${resume.latestAnalysis ? "scored" : "pending"}`}>
                        {resume.latestAnalysis ? "Analyzed" : "Pending"}
                      </span>
                    </div>

                    <div className="history-item-bottom">
                      <span className="history-item-status">{resume.status}</span>
                      <span className="history-item-score">
                        {resume.latestAnalysis ? `${resume.latestAnalysis.score}/100` : "No score yet"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="history-panel history-detail-panel">
              {!selectedResume ? (
                <div className="history-state">Select a resume to view its latest score and breakdown.</div>
              ) : (
                <>
                  <div className="history-detail-head">
                    <div>
                      <p className="history-panel-label">Resume Detail</p>
                      <h2 className="history-detail-title">{selectedResume.originalFileName}</h2>
                      <p className="history-detail-meta">
                        Uploaded {formatDate(selectedResume.createdAt)}
                      </p>
                    </div>

                    {selectedAnalysis ? (
                      <div className="history-score-wrap">
                        <ScoreRing score={selectedAnalysis.score} />
                        <span className={`history-tag ${selectedAnalysis.score >= 75 ? "strong" : selectedAnalysis.score >= 50 ? "good" : "weak"}`}>
                          {selectedAnalysis.lable}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {detailsLoading ? <div className="history-state">Loading analysis...</div> : null}
                  {!detailsLoading && detailsError ? <div className="history-state error">{detailsError}</div> : null}

                  {!detailsLoading && selectedAnalysis ? (
                    <div className="history-detail-content">
                      {selectedAnalysis.breakdown ? (
                        <div className="history-card">
                          <p className="history-card-title">Breakdown</p>
                          <div className="history-breakdown">
                            {Object.entries(selectedAnalysis.breakdown).map(([key, value]) => (
                              <div key={key} className="history-breakdown-item">
                                <div className="history-breakdown-key">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                                <div className="history-breakdown-value">{String(value)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedAnalysis.missingSkills?.length ? (
                        <div className="history-card">
                          <p className="history-card-title">Missing Skills</p>
                          <div className="history-chip-grid">
                            {selectedAnalysis.missingSkills.map((skill) => (
                              <span key={skill} className="history-chip skill">{skill}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedAnalysis.suggestions?.length ? (
                        <div className="history-card">
                          <p className="history-card-title">Suggestions</p>
                          <div className="history-suggestion-list">
                            {selectedAnalysis.suggestions.map((suggestion) => (
                              <div key={suggestion} className="history-suggestion-item">{suggestion}</div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>

        {isRenamePopupOpen && editingResume ? (
          <RenamePopup
            initialName={editingResume.originalFileName}
            isSubmitting={renameLoading}
            onClose={() => {
              if (!renameLoading) {
                setIsRenamePopupOpen(false);
                setEditingResume(null);
              }
            }}
            onSubmit={handleRenameSubmit}
          />
        ) : null}
      </div>
    </>
  );
};

export default ResumeHistory;
