import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        /* 
           Using process.env.NEXT_PUBLIC_API_URL directly might be fine, 
           but ensure it's defined on the server side environment too.
        */
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hoopcasting.com/php_backend/api';
        const phpUrl = `${apiUrl}/contact.php`;

        const response = await fetch(phpUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // Try to parse JSON, but handle if PHP returns HTML error
        let data;
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("PHP Response was not JSON:", text);
            return NextResponse.json({ message: "Invalid response from backend", details: text }, { status: 500 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
    }
}
