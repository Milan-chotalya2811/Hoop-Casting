import { NextResponse } from 'next/server';
import Replicate from 'replicate';

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

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function GET() {
    return NextResponse.json(
        { status: 'active', service: 'Hoop Casting AI' },
        { headers: getCorsHeaders() }
    );
}

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.REPLICATE_API_TOKEN;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Configuration Error: No API Key found on Server.' },
                { status: 500, headers: getCorsHeaders() }
            );
        }

        const body = await req.json();
        const { message, session_id, history = [] } = body;

        let replyText = "";

        // --- DETECT PROVIDER ---
        const isReplicate = apiKey.startsWith('r8_');
        const isOpenAI = apiKey.startsWith('sk-');
        const isGemini = apiKey.startsWith('AIza');

        if (isReplicate) {
            const replicate = new Replicate({ auth: apiKey });
            const prompt = `${SYSTEM_INSTRUCTION}\n\nCONTEXT:\n${CONTEXT}\n\nUser Question: ${message}`;

            // Using Llama 3 8B
            const output = await replicate.run("meta/meta-llama-3-8b-instruct", {
                input: {
                    prompt: prompt,
                    system_prompt: SYSTEM_INSTRUCTION + "\nCONTEXT:\n" + CONTEXT,
                    message: message,
                    max_tokens: 500
                }
            });
            replyText = Array.isArray(output) ? output.join("") : String(output);

        } else if (isOpenAI) {
            const messages = [{ role: 'system', content: SYSTEM_INSTRUCTION + "\n\nCONTEXT:\n" + CONTEXT }];
            // Add history logs...
            messages.push({ role: 'user', content: message });

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, temperature: 0.7 })
            });
            const data = await res.json();
            if (data.error) throw new Error("OpenAI Error: " + data.error.message);
            replyText = data.choices?.[0]?.message?.content;

        } else if (isGemini) {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const res = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: message }] }],
                    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION + "\n\nCONTEXT:\n" + CONTEXT }] }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error("Gemini Error: " + data.error.message);
            replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }

        return NextResponse.json({
            reply: replyText || "Sorry, no response.",
            session_id: session_id || 'new_session'
        }, { headers: getCorsHeaders() });

    } catch (error) {
        console.error('Chatbot Error:', error);
        return NextResponse.json(
            { error: 'System Error: ' + (error as Error).message },
            { status: 500, headers: getCorsHeaders() }
        );
    }
}
