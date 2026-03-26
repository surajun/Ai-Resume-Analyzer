const fetch = require('node-fetch');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Calls OpenRouter API to analyze resume vs job description.
 * Returns structured JSON with skills, match score, and suggestions.
 *
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} - Parsed AI analysis result
 */
const analyzeWithAI = async (resumeText, jobDescription) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Set OPENROUTER_API_KEY in .env');
  }

  // Truncate very long texts to avoid token limits
  const truncatedResume = resumeText.slice(0, 4000);
  const truncatedJob = jobDescription.slice(0, 2000);

  const prompt = buildPrompt(truncatedResume, truncatedJob);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Resume Analyzer',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert ATS (Applicant Tracking System) and career coach. You analyze resumes against job descriptions. You ALWAYS respond with valid JSON only — no markdown, no explanation text, just raw JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON output
        max_tokens: 1500,
      }),
    });
  } catch (err) {
    throw new Error(`Network error calling OpenRouter API: ${err.message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OpenRouter API error response:', errorBody);

    if (response.status === 401) {
      throw new Error('Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY.');
    } else if (response.status === 429) {
      throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
    } else if (response.status === 402) {
      throw new Error('OpenRouter API credits exhausted. Please add credits to your account.');
    }
    throw new Error(`OpenRouter API returned status ${response.status}`);
  }

  const data = await response.json();

  // Extract the text content from OpenRouter response
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter API returned empty response content.');
  }

  return parseAIResponse(content);
};

/**
 * Builds the analysis prompt sent to the AI model.
 */
const buildPrompt = (resumeText, jobDescription) => {
  return `Analyze the following resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "resume_skills": ["skill1", "skill2"],
  "job_skills": ["skill1", "skill2"],
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "match_score": 75,
  "suggestions": [
    "Add certification in X to strengthen your profile",
    "Highlight experience with Y in your summary"
  ]
}

Rules:
- Extract clear technical AND soft skills from both texts
- Match intelligently (synonyms count: e.g. "JS" matches "JavaScript")
- match_score must be a realistic integer 0-100 based on overlap quality
- Provide 4-6 specific, actionable suggestions
- Do NOT include any text outside the JSON object`;
};

/**
 * Safely parses the AI response string into a validated JSON object.
 */
const parseAIResponse = (content) => {
  // Strip markdown code fences if present (e.g., ```json ... ```)
  let cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Find the JSON object within the response (in case there's surrounding text)
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse AI response:', content);
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // Validate and sanitize the parsed result
  return {
    resume_skills: Array.isArray(parsed.resume_skills) ? parsed.resume_skills : [],
    job_skills: Array.isArray(parsed.job_skills) ? parsed.job_skills : [],
    matched_skills: Array.isArray(parsed.matched_skills) ? parsed.matched_skills : [],
    missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
    match_score: typeof parsed.match_score === 'number'
      ? Math.min(100, Math.max(0, Math.round(parsed.match_score)))
      : 0,
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  };
};

module.exports = { analyzeWithAI };
