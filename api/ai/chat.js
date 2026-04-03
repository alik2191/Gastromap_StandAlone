/**
 * Vercel Serverless Function — AI Chat Proxy
 *
 * Proxies requests to OpenRouter so the API key stays server-side.
 * The OPENROUTER_API_KEY env var (no VITE_ prefix) is only available here.
 *
 * Cascading model rotation: when a model is rate-limited (429),
 * automatically retry with the next free model until one succeeds.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Free models with tool-use support, ordered by quality.
 * More models = lower chance of all being rate-limited simultaneously.
 */
const MODEL_CASCADE = [
    'mistralai/devstral-2512:free',            // Mistral Devstral 2 — best agentic
    'mistralai/mistral-small-3.1:free',        // Mistral Small 3.1 — reliable
    'z-ai/glm-4.5-air:free',                   // GLM-4.5-Air — strong reasoning
    'openai/gpt-oss-20b:free',                 // GPT-OSS 20B — Apache 2.0
    'nvidia/nemotron-nano-9b-v2:free',         // Nemotron Nano 9B v2 — fast
    'minimax/minimax-m2.5:free',               // MiniMax M2.5 — productive
    'meta-llama/llama-3.3-70b-instruct:free',  // Llama 3.3 70B — fallback
    'qwen/qwen3-coder:free',                   // Qwen3 Coder — last resort
]

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    // Debug: log key presence and length (never log the actual key)
    const keyStatus = apiKey ? `present (length: ${apiKey.length}, startsWith: ${apiKey.substring(0, 10)}...)` : 'MISSING'
    console.log(`[ai/chat] OPENROUTER_API_KEY status: ${keyStatus}`)

    if (!apiKey || apiKey.trim() === '') {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured on server', debug: `key length: ${apiKey ? apiKey.length : 0}` })
    }

    try {
        const { messages, model, max_tokens, tools, tool_choice } = req.body

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' })
        }

        // Start cascade from the requested model index
        let startIdx = MODEL_CASCADE.indexOf(model)
        if (startIdx === -1) startIdx = 0

        let lastError = null
        let usedModel = null

        for (let i = startIdx; i < MODEL_CASCADE.length; i++) {
            const currentModel = MODEL_CASCADE[i]

            const body = {
                model: currentModel,
                messages,
                max_tokens: Math.min(max_tokens || 1024, 4096),
            }

            if (tools) {
                body.tools = tools
                body.tool_choice = tool_choice || 'auto'
            }

            const response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://gastromap.app',
                    'X-Title': 'GastroMap',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (response.ok) {
                // Inject which model was used for transparency
                data._model_used = currentModel
                return res.status(200).json(data)
            }

            lastError = data
            usedModel = currentModel

            // Only retry on 429 (rate limit) or 5xx (server errors)
            const status = response.status
            if (status !== 429 && status !== 500 && status !== 502 && status !== 503) {
                // Non-retryable error — return immediately
                return res.status(status).json(data)
            }

            console.log(`[ai/chat] ${currentModel} returned ${status}, trying next model...`)
        }

        // All models exhausted
        console.error('[ai/chat] All models failed:', lastError)
        return res.status(503).json({
            error: 'All AI models are currently rate-limited. Please try again in a minute.',
            last_error: lastError?.error?.message,
            models_tried: MODEL_CASCADE.slice(startIdx),
        })
    } catch (error) {
        console.error('[ai/chat proxy] Error:', error.message)
        return res.status(500).json({ error: 'AI proxy error' })
    }
}
