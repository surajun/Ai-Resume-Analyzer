import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeAPI } from '../services/api';

const STEPS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  ANALYZING: 'analyzing',
  DONE: 'done',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [step, setStep] = useState(STEPS.IDLE);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history on mount
  useEffect(() => {
    resumeAPI.getHistory()
      .then((res) => setHistory(res.data.history || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = f.name.split('.').pop().toLowerCase();
    if (!allowed.includes(f.type) && !['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return setError('Please upload your resume.');
    if (jobDescription.trim().length < 50) return setError('Job description must be at least 50 characters.');
    setError('');

    try {
      // Step 1: Upload
      setStep(STEPS.UPLOADING);
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription.trim());
      const uploadRes = await resumeAPI.upload(formData);
      const resumeId = uploadRes.data.resume_id;

      // Step 2: Analyze
      setStep(STEPS.ANALYZING);
      const analysisRes = await resumeAPI.analyze(resumeId);
      const analysisId = analysisRes.data.analysis_id;

      setStep(STEPS.DONE);
      setTimeout(() => navigate(`/results/${analysisId}`), 500);
    } catch (err) {
      setStep(STEPS.IDLE);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    }
  };

  const isLoading = step === STEPS.UPLOADING || step === STEPS.ANALYZING;

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-800 rounded-full opacity-5 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">ResumeAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-surface-200 text-sm hidden sm:block">
              Welcome, <span className="text-white font-medium">{user?.name}</span>
            </span>
            <button
              onClick={logout}
              className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Main Upload Panel ── */}
          <div className="lg:col-span-3 space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Analyze Your Resume</h2>
              <p className="text-surface-200 text-sm mt-1">Upload your resume and paste a job description to get an AI-powered match score.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* File Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                file
                  ? 'border-brand-500/60 bg-brand-600/5'
                  : 'border-white/15 hover:border-brand-500/50 hover:bg-white/3'
              } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">{file.name}</p>
                    <p className="text-surface-200 text-xs">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-surface-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm">Drop your resume here</p>
                  <p className="text-surface-200 text-xs mt-1">or click to browse · PDF or DOCX · max 5MB</p>
                </>
              )}
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-2">
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={8}
                disabled={isLoading}
                placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities, and qualifications for the best analysis."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-3 bg-surface-900 border border-white/10 rounded-xl text-white placeholder-surface-200/40 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm resize-none disabled:opacity-60"
              />
              <p className="text-xs text-surface-200/60 mt-1">{jobDescription.length} characters {jobDescription.length < 50 && jobDescription.length > 0 && <span className="text-amber-400">(min 50)</span>}</p>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !file || jobDescription.trim().length < 50}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-xl shadow-brand-900/50 text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {step === STEPS.UPLOADING ? 'Uploading & parsing resume...' : 'AI is analyzing your resume...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Resume with AI
                </>
              )}
            </button>

            {/* Loading status indicator */}
            {isLoading && (
              <div className="bg-surface-900 border border-white/10 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
                  <span className="text-sm text-surface-200">
                    {step === STEPS.UPLOADING ? 'Extracting text from your document...' : 'GPT-4o Mini is reading your resume and job description...'}
                  </span>
                </div>
                <div className="h-1 bg-surface-950 rounded-full overflow-hidden">
                  <div className={`h-full bg-brand-500 rounded-full transition-all duration-1000 ${step === STEPS.UPLOADING ? 'w-1/3' : 'w-4/5'}`} />
                </div>
              </div>
            )}
          </div>

          {/* ── History Panel ── */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="bg-surface-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="font-display font-semibold text-white text-sm">Recent Analyses</h3>
              </div>

              {loadingHistory ? (
                <div className="p-6 flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin text-surface-200" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-surface-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-surface-200/70 text-sm">No analyses yet</p>
                  <p className="text-surface-200/40 text-xs mt-1">Your results will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {history.map((item) => (
                    <button
                      key={item.analysis_id}
                      onClick={() => navigate(`/results/${item.analysis_id}`)}
                      className="w-full px-5 py-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.file_name || 'Resume'}</p>
                          <p className="text-surface-200/60 text-xs mt-0.5 line-clamp-2">{item.job_snippet}</p>
                          <p className="text-surface-200/40 text-xs mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className={`text-lg font-bold font-mono shrink-0 ${getScoreColor(item.match_score)}`}>
                          {item.match_score}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="mt-4 bg-brand-600/10 border border-brand-500/20 rounded-2xl p-5">
              <h4 className="text-brand-300 text-sm font-semibold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Tips for best results
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-200/80">
                <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Use a text-based PDF (not scanned)</li>
                <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Paste the complete job posting</li>
                <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Include the requirements section</li>
                <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> More detail = more accurate analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
