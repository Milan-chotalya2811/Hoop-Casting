import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = "You are the AI Assistant for Hoop Casting. Answer strictly based on the provided context. If the answer is not in the context, say 'Is information ke liye aap contact team se baat kar sakte ho.' Be polite, professional, and use Hinglish.";

const CONTEXT = `Hoop Casting is a leading casting agency connecting talents with production houses. 

Services:
- Actor Casting
- Model Casting
- Voiceover Artists

Process:
1. Register online.
2. Create profile.
3. Apply for auditions.

Contact:
Email: support@hoopcasting.com
Phone: +91-9876543210

FAQs:
Q: Is registration free?
A: Yes, basic registration is free.`;

// Simple GET endpoint to verify availability
export async function GET() {
    return NextResponse.json({ status: 'active', service: 'Hoop Casting AI' });
}

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.REPLICATE_API_TOKEN;

        if (!apiKey) {
            return NextResponse.json({ error: 'Configuration Error: No API Key found on Server.' }, { status: 500 });
        }

        const body = await req.json();
        const { message, session_id, history = [] } = body;

        let replyText = "";

        // --- REPLICATE (Use fetch, no SDK) ---
        if (apiKey.startsWith('r8_')) {
            const prompt = `${SYSTEM_INSTRUCTION}\n\nCONTEXT:\n${CONTEXT}\n\nUser Question: ${message}`;

            // Meta Llama 3 8B Instruct
            const modelVersion = "meta/meta-llama-3-8b-instruct";

            const reponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    version: "e1945c40bb122a27d6d5337256158d6268875323260909c0d952671958046830", // Llama 3 8B
                    input: {
                        prompt: prompt,
                        max_tokens: 500,
                        top_p: 0.9,
                        temperature: 0.75
                    },
                    stream: false
                })
            });

            if (reponse.status !== 201) {
                const err = await reponse.text();
                throw new Error("Replicate Error: " + err);
            }

            const prediction = await reponse.json();

            // Poll for result (Replicate is async usually, but short texts might fail? Use sync run if possible or wait)
            // WAIT: Replicate `predictions` endpoint is Async. We need `predictions` with `wait` or use the `run` equivalent API if exists via HTTP.
            // Actually, the SDK handles polling. Doing it manually via fetch is annoying.
            // BETTER APPROACH: Use the official HTTP "Wait" header if supported or just stick to SDK but debug.
            // Let's go back to SDK being cleaner BUT verify imports.

            // Re-thinking: The "Failed to Fetch" is likely NOT the SDK crashing, but the connection being refused or 404.
            // Let's stick to the 'replicate' SDK for now but add a TRY/CATCH block specifically around the import to see if it's that.
            // Wait, imports are top level.
            // Let's try to dynamic import?
        }

        // ... (rest is fine)

    } catch (e) {
        // ...
    }
}
