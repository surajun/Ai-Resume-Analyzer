import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';

// ─── Score Ring Component ──────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 70) return '#34d399'; // emerald
    if (s >= 40) return '#fbbf24'; // amber
    return '#f87171'; // red
  };

  const getLabel = (s) => {
    if (s >= 70) return { text: 'Strong Match', color: 'text-emerald-400' };
    if (s >= 40) return { text: 'Moderate Match', color: 'text-amber-400' };
    return { text: 'Weak Match', color: 'text-red-400' };
  };

  const color = getColor(score);
  const label = getLabel(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
          <circle
            cx="64" cy="64" r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-white">{score}</span>
          <span className="text-xs text-surface-200/70 font-mono">/ 100</span>
        </div>
      </div>
      <p className={`text-sm font-semibold mt-2 ${label.color}`}>{label.text}</p>
    </div>
  );
}

// ─── Skill Tag Component ───────────────────────────────────────────────────────
function SkillTag({ skill, variant }) {
  const styles = {
    matched: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    missing: 'bg-red-500/10 text-red-300 border-red-500/20',
    neutral: 'bg-white/5 text-surface-200 border-white/10',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${styles[variant] || styles.neutral}`}>
      {variant === 'matched' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />}
      {variant === 'missing' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />}
      {skill}
    </span>
  );
}

// ─── Main Results Page ─────────────────────────────────────────────────────────
export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeAPI.getResult(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load results.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-surface-200 text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-brand-400 hover:text-brand-300 text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const matchPct = data.match_score;

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-800 rounded-full opacity-5 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-surface-200 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white text-sm font-medium">Analysis Results</span>
          </div>
          <span className="text-surface-200/60 text-xs hidden sm:block">
            {data.file_name} · {new Date(data.created_at).toLocaleString()}
          </span>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-8 animate-slide-up">

        {/* ── Header Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-surface-900 border border-white/10 rounded-2xl p-6">
          <ScoreRing score={matchPct} />
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-white mb-1">Resume Analysis Complete</h1>
            <p className="text-surface-200 text-sm mb-4">
              Your resume matches <span className="text-white font-semibold">{matchPct}%</span> of the job requirements.
              {matchPct >= 70 && " You're a strong candidate — apply with confidence!"}
              {matchPct >= 40 && matchPct < 70 && " There are key areas to strengthen before applying."}
              {matchPct < 40 && " Significant gaps found — review the suggestions below."}
            </p>
            {/* Mini progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-surface-200/60">
                <span>Match score</span>
                <span>{matchPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    matchPct >= 70 ? 'bg-emerald-500' : matchPct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${matchPct}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-900/40"
          >
            New Analysis
          </button>
        </div>

        {/* ── Skills Grid ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Matched Skills */}
          <div className="bg-surface-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-white text-sm">
                Matched Skills
                <span className="ml-2 text-xs font-mono text-emerald-400 font-normal">{data.matched_skills?.length || 0}</span>
              </h3>
            </div>
            {data.matched_skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.matched_skills.map((s, i) => (
                  <SkillTag key={i} skill={s} variant="matched" />
                ))}
              </div>
            ) : (
              <p className="text-surface-200/50 text-sm">No matched skills found.</p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="bg-surface-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-white text-sm">
                Missing Skills
                <span className="ml-2 text-xs font-mono text-red-400 font-normal">{data.missing_skills?.length || 0}</span>
              </h3>
            </div>
            {data.missing_skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.missing_skills.map((s, i) => (
                  <SkillTag key={i} skill={s} variant="missing" />
                ))}
              </div>
            ) : (
              <p className="text-emerald-400/70 text-sm">🎉 No missing skills — great coverage!</p>
            )}
          </div>
        </div>

        {/* ── All Skills Row ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface-900 border border-white/10 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Your Resume Skills
              <span className="text-xs font-mono text-brand-400 font-normal">{data.resume_skills?.length || 0}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {(data.resume_skills || []).map((s, i) => <SkillTag key={i} skill={s} variant="neutral" />)}
            </div>
          </div>
          <div className="bg-surface-900 border border-white/10 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Job Required Skills
              <span className="text-xs font-mono text-purple-400 font-normal">{data.job_skills?.length || 0}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {(data.job_skills || []).map((s, i) => <SkillTag key={i} skill={s} variant="neutral" />)}
            </div>
          </div>
        </div>

        {/* ── Suggestions ── */}
        {data.suggestions?.length > 0 && (
          <div className="bg-surface-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-white text-sm">AI Improvement Suggestions</h3>
            </div>
            <div className="space-y-3">
              {data.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-surface-950/60 rounded-xl border border-white/5">
                  <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-surface-200 text-sm leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
