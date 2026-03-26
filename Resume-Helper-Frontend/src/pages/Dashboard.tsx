import { useState, useRef, useEffect } from "react";
import API from "../service/api";
import type { AnalysisResult } from "../type/types";
import Navigation from "../components/Navigation";
import "../styles/Dashboard.css";

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 75 ? "#2dd4bf" : score >= 50 ? "#a48fff" : "#e85d9a";

  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1), stroke 0.3s" }}
      />
      <text x="44" y="48" textAnchor="middle" fill="#f0eeff" fontSize="15" fontWeight="600" fontFamily="DM Sans, sans-serif">
        {score}
      </text>
    </svg>
  );
};

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resume, setResume] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploadLoading(true);
      setUploadStatus("idle");
      const res = await API.post("/resume/upload", formData);
      setResume(res.data.data._id);
      setUploadStatus("success");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume || !jobDescription) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await API.post("/resume/analyze", { resumeId: resume, jobDescription });
      setResult(res.data.data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const canUpload = !!file && uploadStatus !== "success";
  const canAnalyze = !!resume && !!jobDescription && !loading;

  return (
    <>
      <Navigation />
      <div className="dash-root">
        <div className="dash-blob dash-blob-1" />
        <div className="dash-blob dash-blob-2" />
        <div className="dash-grid" />

        <div className={`dash-content ${mounted ? "visible" : ""}`}>
          {/* Header */}
          <div className="dash-header">
            <h1 className="dash-title">Resume Analyzer</h1>
            <p className="dash-subtitle">Upload your resume, paste a job description, and get an instant ATS score.</p>
          </div>

          {/* Upload card */}
          <div className="dash-card">
            <p className="dash-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Resume
            </p>

            <div
              className={`dash-dropzone ${file ? "has-file" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="dash-hidden-input"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setUploadStatus("idle");
                  setResume("");
                }}
              />
              {file ? (
                <div className="dash-filename">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  {file.name}
                </div>
              ) : (
                <>
                  <div className="dash-dropzone-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(164,143,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="dash-dropzone-label">Click to select your resume</p>
                  <p className="dash-dropzone-sub">PDF or DOCX — max 10MB</p>
                </>
              )}
            </div>

            {uploadStatus === "success" && (
              <div style={{ display: "flex" }}>
                <span className="dash-badge success">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Uploaded successfully
                </span>
              </div>
            )}
            {uploadStatus === "error" && (
              <div style={{ display: "flex" }}>
                <span className="dash-badge error">Upload failed — try again</span>
              </div>
            )}

            <div className="dash-btn-row" style={{ marginTop: "18px" }}>
              <button
                className="dash-btn dash-btn-upload"
                onClick={handleUpload}
                disabled={!canUpload || uploadLoading}
              >
                {uploadLoading ? <><span className="spinner" />Uploading…</> : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  </svg>
                  Upload Resume
                </>}
              </button>
            </div>
          </div>

          {/* JD card */}
          <div className="dash-card">
            <p className="dash-card-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Job Description
            </p>
            <textarea
              className="dash-textarea"
              placeholder="Paste the job description here…"
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <div className="dash-btn-row" style={{ marginTop: "16px" }}>
              <button
                className="dash-btn dash-btn-analyze"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {loading ? (
                  <><span className="spinner" />Analyzing…</>
                ) : (
                  <>
                    Analyze Resume
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="dash-results">
              {/* Score */}
              <div className="dash-score-card">
                <ScoreRing score={result.score} />
                <div className="dash-score-info">
                  <div className="dash-score-label">ATS Score</div>
                  <div className="dash-score-sublabel">Based on keyword match, structure & relevance</div>
                  <div>
                    <span className={`dash-tag ${result.score >= 75 ? "tag-strong" : result.score >= 50 ? "tag-good" : "tag-weak"}`}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {result.lable}
                    </span>
                  </div>
                </div>
              </div>

              {/* Missing Skills */}
              {result.missingSkills?.length! > 0 && (
                <div className="dash-card">
                  <p className="dash-card-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Missing Skills
                  </p>
                  <div className="dash-list-grid">
                    {result.missingSkills!.map((skill: string, i: number) => (
                      <div key={i} className="dash-list-item">
                        <span className="dash-list-item-dot dot-skill" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length! > 0 && (
                <div className="dash-card">
                  <p className="dash-card-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Suggestions
                  </p>
                  <div className="dash-list-grid">
                    {result.suggestions!.map((s: string, i: number) => (
                      <div key={i} className="dash-list-item">
                        <span className="dash-list-item-dot dot-suggest" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown */}
              {result.breakdown && (
                <div className="dash-card">
                  <p className="dash-card-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Breakdown
                  </p>
                  <div className="dash-breakdown">
                    {Object.entries(result.breakdown).map(([key, val]) => (
                      <div key={key} className="dash-breakdown-item">
                        <div className="dash-breakdown-key">{key.replace(/_/g, " ")}</div>
                        <div className="dash-breakdown-val">{String(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;