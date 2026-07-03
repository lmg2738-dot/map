import { getOpenRouterKey, getOpenRouterMeta } from "@/lib/env";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MODELS_CACHE_TTL_MS = 60 * 60 * 1000;

interface OpenRouterModel {
  id: string;
  name?: string;
  context_length?: number;
  architecture?: { modality?: string; output_modalities?: string[] };
  pricing?: { prompt?: string; completion?: string };
}

interface ModelsCache {
  fetchedAt: number;
  modelIds: string[];
}

let modelsCache: ModelsCache | null = null;
const runtimeFailedModels = new Set<string>();

const NON_TEXT_PATTERNS = [
  /lyria/i,
  /clip-preview/i,
  /image/i,
  /audio/i,
  /tts/i,
  /embedding/i,
];

function isFreeTextModel(model: OpenRouterModel): boolean {
  const prompt = parseFloat(model.pricing?.prompt ?? "1");
  const completion = parseFloat(model.pricing?.completion ?? "1");
  if (prompt !== 0 || completion !== 0) return false;

  if (NON_TEXT_PATTERNS.some((p) => p.test(model.id))) return false;

  const outputMods = model.architecture?.output_modalities;
  if (outputMods && !outputMods.includes("text")) return false;

  return true;
}

export async function fetchFreeTextModels(): Promise<string[]> {
  const now = Date.now();
  if (modelsCache && now - modelsCache.fetchedAt < MODELS_CACHE_TTL_MS) {
    return modelsCache.modelIds.filter((id) => !runtimeFailedModels.has(id));
  }

  const res = await fetch(`${OPENROUTER_BASE}/models`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`OpenRouter 모델 목록 조회 실패 (${res.status})`);
  }

  const body = (await res.json()) as { data: OpenRouterModel[] };
  const freeModels = body.data
    .filter(isFreeTextModel)
    .sort((a, b) => (b.context_length ?? 0) - (a.context_length ?? 0));

  const prioritized = [
    ...freeModels.filter((m) => m.id === "openrouter/free"),
    ...freeModels.filter((m) => m.id !== "openrouter/free"),
  ].map((m) => m.id);

  modelsCache = { fetchedAt: now, modelIds: prioritized };
  return prioritized.filter((id) => !runtimeFailedModels.has(id));
}

export function markModelFailed(modelId: string) {
  runtimeFailedModels.add(modelId);
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResult {
  content: string;
  model: string;
}

function isModelUnavailable(status: number, body: string): boolean {
  if (status === 404 || status === 410) return true;
  if (status === 400 || status === 402 || status === 429) {
    return (
      /model/i.test(body) &&
      (/not found|unavailable|deprecated|invalid|no longer|disabled|capacity|rate/i.test(body))
    );
  }
  return false;
}

export async function chatWithFreeModels(
  messages: ChatMessage[]
): Promise<ChatResult> {
  const apiKey = getOpenRouterKey();
  const { siteUrl, appName } = getOpenRouterMeta();
  const models = await fetchFreeTextModels();

  if (models.length === 0) {
    throw new Error("사용 가능한 무료 OpenRouter 모델이 없습니다.");
  }

  const errors: string[] = [];

  for (const model of models) {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      if (siteUrl) headers["HTTP-Referer"] = siteUrl;
      headers["X-Title"] = appName;

      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model, messages, max_tokens: 600 }),
      });

      const bodyText = await res.text();

      if (!res.ok) {
        if (isModelUnavailable(res.status, bodyText)) {
          markModelFailed(model);
          errors.push(`${model}: ${res.status}`);
          continue;
        }
        throw new Error(`OpenRouter 오류 (${res.status}): ${bodyText.slice(0, 200)}`);
      }

      const data = JSON.parse(bodyText) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        markModelFailed(model);
        errors.push(`${model}: empty response`);
        continue;
      }

      return { content, model };
    } catch (err) {
      markModelFailed(model);
      errors.push(`${model}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  throw new Error(
    `모든 무료 모델 시도 실패 (${errors.slice(0, 3).join("; ")})`
  );
}

export async function generateLandSummary(analysisData: Record<string, unknown>): Promise<ChatResult> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "당신은 한국 토지 개발 타당성 분석 전문가입니다. 제공된 분석 데이터를 바탕으로 3~4문장의 한국어 요약을 작성하세요. 경사도, 입지, POI, 개발 가능성을 포함하고, 과장 없이 객관적으로 서술하세요.",
    },
    {
      role: "user",
      content: JSON.stringify(analysisData, null, 2),
    },
  ];

  return chatWithFreeModels(messages);
}
