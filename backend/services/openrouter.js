import axios from 'axios';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

const MODEL_MAP = {
  'gemini-flash-2.0': 'google/gemini-2.0-flash-exp:free',
  'gemini-flash-1.5': 'google/gemini-flash-1.5:free',
  'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek-v3': 'deepseek/deepseek-chat:free',
  'deepseek-r1': 'deepseek/deepseek-r1:free',
};

const SYSTEM_PROMPT = `You are an expert ATS resume optimization system. Your task is to:
1. Analyze the job description to extract key requirements, skills, and keywords
2. Rewrite the provided resume to maximize ATS keyword matching while maintaining readability
3. Return a structured JSON object with the optimized resume

Guidelines:
- Use exact keywords and phrases from the job description where relevant
- Rewrite bullet points using strong action verbs and quantified achievements
- Maintain truthfulness - don't add skills the candidate doesn't have
- Reorder skills to match job description priority
- The "matchScore" should reflect the percentage of key requirements matched

Return JSON with this exact structure:
{
  "matchScore": <number 0-100>,
  "keywords": ["keyword1", "keyword2", ...],
  "sections": {
    "header": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "website": "string",
      "github": "string"
    },
    "professionalSummary": "string",
    "skills": ["skill1", "skill2", ...],
    "experience": [
      {
        "company": "string",
        "position": "string",
        "dates": "string",
        "location": "string",
        "bullets": ["bullet1", "bullet2", ...]
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "field": "string",
        "dates": "string",
        "gpa": "string"
      }
    ],
    "projects": [
      {
        "name": "string",
        "technologies": "string",
        "description": "string",
        "bullets": ["bullet1", ...]
      }
    ],
    "certifications": ["cert1", ...],
    "publications": [
      {
        "title": "string",
        "journal": "string",
        "year": "string"
      }
    ]
  }
}

If a section has no data, use an empty array or empty string.`;

async function callOpenRouter(apiKey, modelId, jobDescription, currentResume, attempt = 1) {
  try {
    return await axios.post(
      OPENROUTER_API,
      {
        model: modelId,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Job Description:\n${jobDescription}\n\nCurrent Resume:\n${currentResume}\n\nReturn only valid JSON.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
        },
        timeout: 120000,
      }
    );
  } catch (err) {
    const status = err.response?.status;
    const body = err.response?.data;
    const raw = body?.error?.metadata?.raw || '';
    const retryAfter = body?.error?.metadata?.retry_after_seconds || 5;

    if (status === 429 && attempt <= 3) {
      console.log(`Rate limited (attempt ${attempt}/3). Waiting ${retryAfter}s before retry...`);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      return callOpenRouter(apiKey, modelId, jobDescription, currentResume, attempt + 1);
    }

    console.error('OpenRouter API error:', status, JSON.stringify(body));
    const errMsg = raw || body?.error?.message || body?.error || `OpenRouter returned ${status || 'unknown error'}`;
    const e = new Error(errMsg);
    e.statusCode = status || 500;
    throw e;
  }
}

export async function optimizeResume(jobDescription, currentResume, model) {
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is empty or not set in backend/.env');
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  console.log(`Using API key: ${apiKey.substring(0, 12)}... (length: ${apiKey.length})`);

  const modelId = MODEL_MAP[model] || MODEL_MAP['gemini-flash-2.0'];

  const response = await callOpenRouter(apiKey, modelId, jobDescription, currentResume);

  const content = response.data.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response did not contain valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}
