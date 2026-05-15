import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { toast } from "react-toastify";
import API from "../service/api";
import jsPDF from "jspdf";
import "../styles/Dashboard.css";

const AiFeatures = () => {
  const { resumeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialJobDesc = location.state?.jobDescription || "";
  const autoRun = location.state?.autoRun || null;

  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumeId || "");
  const [jobDescription, setJobDescription] = useState<string>(initialJobDesc);
  const [resumes, setResumes] = useState<any[]>([]);

  const [coverLetter, setCoverLetter] = useState<string>("");
  const [coverLetterLoading, setCoverLetterLoading] = useState<boolean>(false);
  const [resumeRewrite, setResumeRewrite] = useState<string>("");
  const [resumeRewriteLoading, setResumeRewriteLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"cover-letter" | "rewrite">("cover-letter");

  useEffect(() => {
    // Fetch resumes to populate the dropdown
    API.get("/resume/history")
      .then((res) => {
        setResumes(res.data.data);
        if (!resumeId && res.data.data.length > 0 && !selectedResumeId) {
          setSelectedResumeId(res.data.data[0]._id);
        }
      })
      .catch((err) => console.error("Failed to load resumes", err));
  }, [resumeId]);

  useEffect(() => {
    if (autoRun === "cover-letter" && !coverLetter && !coverLetterLoading) {
      setActiveTab("cover-letter");
      handleGenerateCoverLetter();
    } else if (autoRun === "rewrite" && !resumeRewrite && !resumeRewriteLoading) {
      setActiveTab("rewrite");
      handleImproveResume();
    }
  }, [autoRun, resumeId]);

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeId) {
      toast.warn("Please select a resume");
      return;
    }
    if (!jobDescription) {
      toast.warn("Job description is required!");
      return;
    }
    try {
      setCoverLetterLoading(true);
      const res = await API.post("/resume/generate-cover-letter", { resumeId: selectedResumeId, jobDescription });
      setCoverLetter(res.data.data);
      toast.success("Cover letter generated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate cover letter");
    } finally {
      setCoverLetterLoading(false);
    }
  };

  const handleImproveResume = async () => {
    if (!selectedResumeId) {
      toast.warn("Please select a resume");
      return;
    }
    if (!jobDescription) {
      toast.warn("Job description is required!");
      return;
    }
    try {
      setResumeRewriteLoading(true);
      const res = await API.post("/resume/improve-resume", { resumeId: selectedResumeId, jobDescription });
      setResumeRewrite(res.data.data);
      toast.success("Resume improvements generated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to improve resume");
    } finally {
      setResumeRewriteLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadPDF = (text: string, title: string) => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, margin, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
    let y = 35;
    for (let i = 0; i < splitText.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], margin, y);
      y += 6; // line height
    }
    
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    toast.success("PDF Downloaded!");
  };

  return (
    <>
      <Navigation />
      <div className="dash-root">
        <div className="dash-blob dash-blob-1" />
        <div className="dash-blob dash-blob-2" />
        <div className="dash-grid" />

        <div className="dash-content visible" style={{ maxWidth: '900px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'none', border: 'none', color: '#a48fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '14px', padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>

          <div className="dash-header">
            <h1 className="dash-title">Advanced AI Features</h1>
            <p className="dash-subtitle">Generate a tailored cover letter or rewrite your experience bullets to match the job description perfectly.</p>
          </div>

          <div className="dash-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Select Resume</label>
                <select 
                  value={selectedResumeId} 
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="dash-textarea" 
                  style={{ minHeight: 'auto', padding: '12px' }}
                >
                  <option value="" disabled>Select a resume</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.originalFileName || "Untitled"}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Job Description</label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  className="dash-textarea"
                  rows={2}
                  style={{ minHeight: '50px' }}
                />
              </div>
            </div>
          </div>

          <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                onClick={() => setActiveTab("cover-letter")}
                style={{ flex: 1, padding: '16px', background: activeTab === 'cover-letter' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: activeTab === 'cover-letter' ? '#f0eeff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '15px', fontWeight: 500, transition: '0.2s' }}
              >
                Cover Letter Generator
              </button>
              <button 
                onClick={() => setActiveTab("rewrite")}
                style={{ flex: 1, padding: '16px', background: activeTab === 'rewrite' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: activeTab === 'rewrite' ? '#f0eeff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '15px', fontWeight: 500, transition: '0.2s' }}
              >
                Resume Bullet Rewriter
              </button>
            </div>

            <div style={{ padding: '28px' }}>
              {activeTab === 'cover-letter' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Create a personalized cover letter using Gemini AI based on your resume and the target job.</p>
                    <button className="dash-btn dash-btn-analyze" onClick={handleGenerateCoverLetter} disabled={coverLetterLoading} style={{ width: 'auto', flex: 'none' }}>
                      {coverLetterLoading ? <><span className="spinner"/>Generating...</> : "Generate"}
                    </button>
                  </div>
                  
                  {coverLetter && (
                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleCopy(coverLetter)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} title="Copy to clipboard">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button onClick={() => handleDownloadPDF(coverLetter, "Cover Letter")} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} title="Download PDF">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                       <pre style={{ whiteSpace: 'pre-wrap', color: '#f0eeff', fontSize: '14px', lineHeight: '1.7', fontFamily: 'inherit', margin: 0, marginTop: '20px' }}>
                         {coverLetter}
                       </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rewrite' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Rewrite your work experience bullets to be more impactful and perfectly aligned with the job.</p>
                    <button className="dash-btn dash-btn-analyze" onClick={handleImproveResume} disabled={resumeRewriteLoading} style={{ width: 'auto', flex: 'none' }}>
                      {resumeRewriteLoading ? <><span className="spinner"/>Rewriting...</> : "Rewrite Bullets"}
                    </button>
                  </div>
                  
                  {resumeRewrite && (
                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleCopy(resumeRewrite)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} title="Copy to clipboard">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button onClick={() => handleDownloadPDF(resumeRewrite, "Resume Rewrite")} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} title="Download PDF">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                       <pre style={{ whiteSpace: 'pre-wrap', color: '#f0eeff', fontSize: '14px', lineHeight: '1.7', fontFamily: 'inherit', margin: 0, marginTop: '20px' }}>
                         {resumeRewrite}
                       </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiFeatures;
