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

export async function POST(req: Request) {
    try {
        // Try to find ANY available key
        let apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

        // Check for common misconfigurations
        if (!apiKey) {
            return NextResponse.json({
                error: 'Configuration Error: No API Key found on Server. Please add OPENAI_API_KEY or GEMINI_API_KEY in Vercel Settings.'
            }, { status: 500 });
        }

        const body = await req.json();
        const { message, session_id, history = [] } = body;

        // --- DETECT PROVIDER BASED ON KEY PREFIX ---
        const isGemini = apiKey.startsWith('AIza');
        const isOpenAI = apiKey.startsWith('sk-');
        const isReplicate = apiKey.startsWith('r8_');

        if (isReplicate) {
            return NextResponse.json({
                error: 'Unsupported Key: You provided a Replicate API Key (starts with r8_). Please use an OpenAI Key (starts with sk-) or Gemini Key (starts with AIza).'
            }, { status: 400 });
        }

        if (!isGemini && !isOpenAI) {
            // Fallback or unknown key type
            return NextResponse.json({
                error: 'Invalid Key Format: API Key must start with "sk-" (OpenAI) or "AIza" (Gemini).'
            }, { status: 400 });
        }

        let replyText = "";

        if (isOpenAI) {
            // --- OPENAI LOGIC ---
            const messages = [
                { role: 'system', content: SYSTEM_INSTRUCTION + "\n\nCONTEXT:\n" + CONTEXT }
            ];
            if (Array.isArray(history)) {
                history.forEach((msg: any) => {
                    const role = msg.sender === 'user' ? 'user' : 'assistant';
                    messages.push({ role, content: msg.message });
                });
            }
            messages.push({ role: 'user', content: message });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error("OpenAI: " + data.error.message);
            replyText = data.choices?.[0]?.message?.content;

        } else if (isGemini) {
            // --- GEMINI LOGIC ---
            const contents = [];
            if (Array.isArray(history)) {
                history.forEach((msg: any) => {
                    const role = msg.sender === 'user' ? 'user' : 'model';
                    contents.push({ role, parts: [{ text: msg.message }] });
                });
            }
            contents.push({ role: 'user', parts: [{ text: message }] });

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION + "\n\nCONTEXT:\n" + CONTEXT }] }
                })
            });

            const data = await response.json();
            if (data.error) throw new Error("Gemini: " + data.error.message);
            replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }

        return NextResponse.json({
            reply: replyText || "Sorry, no response generated.",
            session_id: session_id || 'new_session'
        });

    } catch (error) {
        console.error('Chatbot Error:', error);
        return NextResponse.json({ error: 'System Error: ' + (error as Error).message }, { status: 500 });
    }
}
