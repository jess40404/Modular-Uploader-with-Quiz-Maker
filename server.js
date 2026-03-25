const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');

loadEnvFile();

const app = express();
const port = Number(process.env.PORT || 3000);
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const fileManager = geminiApiKey ? new GoogleAIFileManager(geminiApiKey) : null;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: modelName, provider: 'gemini' });
});

app.post('/api/generate-quiz', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const count = Number(req.body?.count || 10);
  const file = req.body?.file;

  if (!prompt && !file) {
    return res.status(400).json({ error: 'A prompt or file is required.' });
  }

  if (!geminiApiKey || !genAI || !fileManager) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is missing. Add your Google Gemini API key to backend.env before starting the server.',
    });
  }

  try {
    const questions = file
      ? await createQuizFromFile(file, count)
      : await createQuizFromPrompt(prompt, count);

    if (!questions.length) {
      return res.status(502).json({
        error: 'Gemini returned an empty or invalid quiz response.',
      });
    }

    return res.json(questions);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error.';
    return res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`AI quiz server running on http://localhost:${port}`);
});

async function createQuizFromPrompt(prompt, count) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: buildQuizSchema(count),
    },
  });

  const result = await model.generateContent(buildPrompt(prompt, count));
  return parseGeminiQuizResponse(result.response.text());
}

async function createQuizFromFile(file, count) {
  validateIncomingFile(file);

  const uploadedFile = await uploadFileToGemini(file);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: buildQuizSchema(count),
    },
  });

  const result = await model.generateContent([
    buildFilePrompt(count),
    {
      fileData: {
        mimeType: uploadedFile.mimeType,
        fileUri: uploadedFile.uri,
      },
    },
  ]);

  return parseGeminiQuizResponse(result.response.text());
}

function buildPrompt(sourceText, count) {
  return [
    `Create exactly ${count} multiple-choice quiz questions from the study material below.`,
    'Keep the wording clear for students.',
    'Each question must have exactly 4 answer options.',
    'Set correctAnswer to one of the provided options exactly.',
    'Avoid duplicate questions.',
    '',
    'Study material:',
    sourceText,
  ].join('\n');
}

function buildFilePrompt(count) {
  return [
    `Read the uploaded file and create exactly ${count} multiple-choice quiz questions from it.`,
    'Use the file contents as the source material.',
    'If the file contains slides or a document outline, cover the main teaching points.',
    'Each question must have exactly 4 answer options.',
    'Set correctAnswer to one of the provided options exactly.',
    'Avoid duplicate questions.',
  ].join('\n');
}

function buildQuizSchema(count) {
  return {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        minItems: count,
        maxItems: count,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: {
              type: SchemaType.STRING,
            },
            options: {
              type: SchemaType.ARRAY,
              minItems: 4,
              maxItems: 4,
              items: {
                type: SchemaType.STRING,
              },
            },
            correctAnswer: {
              type: SchemaType.STRING,
            },
          },
          required: ['question', 'options', 'correctAnswer'],
        },
      },
    },
    required: ['questions'],
  };
}

function parseGeminiQuizResponse(rawText) {
  if (!rawText) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawText);
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    return questions.filter(isValidQuestion);
  } catch {
    return [];
  }
}

function isValidQuestion(question) {
  if (!question || typeof question !== 'object') {
    return false;
  }

  const options = question.options;

  return (
    typeof question.question === 'string' &&
    Array.isArray(options) &&
    options.length === 4 &&
    options.every((option) => typeof option === 'string') &&
    typeof question.correctAnswer === 'string' &&
    options.includes(question.correctAnswer)
  );
}

function validateIncomingFile(file) {
  if (!file || typeof file !== 'object') {
    throw new Error('A valid file payload is required.');
  }

  if (typeof file.name !== 'string' || !file.name.trim()) {
    throw new Error('Uploaded file name is missing.');
  }

  if (typeof file.data !== 'string' || !file.data.trim()) {
    throw new Error('Uploaded file data is missing.');
  }

  if (typeof file.mimeType !== 'string' || !file.mimeType.trim()) {
    throw new Error('Uploaded file MIME type is missing.');
  }
}

async function uploadFileToGemini(file) {
  const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);

  try {
    fs.writeFileSync(tempFilePath, Buffer.from(file.data, 'base64'));

    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.mimeType,
      displayName: file.name,
    });

    if (!uploadResult?.file?.uri || !uploadResult.file.mimeType) {
      throw new Error('Gemini file upload did not return usable file metadata.');
    }

    return uploadResult.file;
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

function loadEnvFile() {
  const envCandidates = ['backend.env', '.env'];

  for (const fileName of envCandidates) {
    const envPath = path.join(__dirname, fileName);

    if (!fs.existsSync(envPath)) {
      continue;
    }

    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    return;
  }
}