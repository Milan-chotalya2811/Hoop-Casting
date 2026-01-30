import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
        if (!OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Server misconfigured: Missing OpenAI API Key' }, { status: 500 });
        }

        const body = await req.json();
        const { message, session_id, history = [] } = body;

        const messages = [
            { role: 'system', content: SYSTEM_INSTRUCTION + "\n\nCONTEXT:\n" + CONTEXT }
        ];

        // Add history
        if (Array.isArray(history)) {
            history.forEach((msg: any) => {
                const role = msg.sender === 'user' ? 'user' : 'assistant';
                messages.push({ role, content: msg.message });
            });
        }

        // Add current message (if not already in history)
        messages.push({ role: 'user', content: message });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('OpenAI API Error:', data.error);
            return NextResponse.json({ error: 'AI Error: ' + data.error.message }, { status: 500 });
        }

        const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

        return NextResponse.json({
            reply,
            session_id: session_id || 'new_session'
        });

    } catch (error) {
        console.error('Chatbot Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
