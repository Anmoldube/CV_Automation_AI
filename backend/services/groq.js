import axios from 'axios';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const MODEL_MAP = {
  'groq-llama3-70b': 'llama-3.3-70b-versatile',
  'groq-llama3-8b': 'llama-3.1-8b-instant',
  'groq-mixtral': 'mixtral-8x7b-32768',
  'groq-gemma2': 'gemma2-9b-it',
  'groq-llama3.1-70b': 'llama-3.1-70b-versatile',
  'groq-llama3.1-8b': 'llama-3.1-8b-instant',
  'groq-deepseek': 'deepseek-r1-distill-llama-70b',
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
    "header": { "name": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string", "website": "string", "github": "string" },
    "professionalSummary": "string",
    "skills": ["skill1", "skill2", ...],
    "experience": [{ "company": "string", "position": "string", "dates": "string", "location": "string", "bullets": ["bullet1", ...] }],
    "education": [{ "institution": "string", "degree": "string", "field": "string", "dates": "string", "gpa": "string" }],
    "projects": [{ "name": "string", "technologies": "string", "description": "string", "bullets": ["bullet1", ...] }],
    "certifications": ["cert1", ...],
    "publications": [{ "title": "string", "journal": "string", "year": "string" }]
  }
}

If a section has no data, use an empty array or empty string.`;

async function callGroq(apiKey, modelId, jobDescription, currentResume, attempt = 1) {
  try {
    return await axios.post(
      GROQ_API,
      {
        model: modelId,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Job Description:\n${jobDescription}\n\nCurrent Resume:\n${currentResume}\n\nReturn only valid JSON.` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );
  } catch (err) {
    const status = err.response?.status;
    const body = err.response?.data;
    const errMsg = body?.error?.message || `Groq returned ${status || 'unknown error'}`;
    console.error('Groq API error:', status, JSON.stringify(body));

    if (status === 429 && attempt <= 3) {
      console.log(`Groq rate limited (attempt ${attempt}/3). Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
      return callGroq(apiKey, modelId, jobDescription, currentResume, attempt + 1);
    }

    const e = new Error(errMsg);
    e.statusCode = status || 500;
    throw e;
  }
}

export async function optimizeResume(jobDescription, currentResume, model) {
  const apiKey = (process.env.GROQ || '').trim();
  if (!apiKey) {
    throw new Error('GROQ API key not found in backend/.env');
  }

  const modelId = MODEL_MAP[model];
  if (!modelId) {
    throw new Error(`Unknown Groq model: ${model}`);
  }

  console.log(`Using Groq key: ${apiKey.substring(0, 12)}... model: ${modelId}`);

  const response = await callGroq(apiKey, modelId, jobDescription, currentResume);

  const content = response.data.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response did not contain valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}
