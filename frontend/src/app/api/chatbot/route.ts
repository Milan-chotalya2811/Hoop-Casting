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

export async function POST(req: Request) {
    try {
        // Try to find ANY available key
        let apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.REPLICATE_API_TOKEN;

        // Parsing body
        const body = await req.json();
        const { message, session_id, history = [] } = body;

        if (!apiKey) {
            return NextResponse.json({
                error: 'Configuration Error: No API Key found on Server.'
            }, { status: 500 });
        }

        // --- DETECT PROVIDER BASED ON KEY PREFIX ---
        const isGemini = apiKey.startsWith('AIza');
        const isOpenAI = apiKey.startsWith('sk-');
        const isReplicate = apiKey.startsWith('r8_');

        let replyText = "";

        if (isReplicate) {
            // --- REPLICATE LOGIC (Llama 3) ---
            const replicate = new Replicate({
                auth: apiKey,
            });

            // Construct prompt efficiently
            // Llama 3 prompt format: <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n

            const prompt = `${SYSTEM_INSTRUCTION}\n\nCONTEXT:\n${CONTEXT}\n\nUser Question: ${message}`;

            // Using Llama-3-8b-instruct (faster response to avoid Vercel timeouts)
            const output = await replicate.run(
                "meta/meta-llama-3-8b-instruct",
                {
                    input: {
                        prompt: prompt,
                        system_prompt: SYSTEM_INSTRUCTION + "\nCONTEXT:\n" + CONTEXT,
                        message: message,
                        top_p: 0.9,
                        temperature: 0.75,
                        max_tokens: 500
                    }
                }
            );

            // Replicate output is usually an array of strings (tokens)
            if (Array.isArray(output)) {
                replyText = output.join("");
            } else {
                replyText = String(output);
            }

        } else if (isOpenAI) {
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
        } else {
            return NextResponse.json({
                error: 'Invalid Key: Key must start with sk- (OpenAI), AIza (Gemini), or r8_ (Replicate).'
            }, { status: 400 });
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
