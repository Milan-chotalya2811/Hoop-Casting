const fs = require('fs');
const path = require('path');
const Replicate = require('replicate');

const envPath = path.join(__dirname, '.env.local');
let key = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.*)/) || envContent.match(/REPLICATE_API_TOKEN=(.*)/);
    if (match && match[1]) {
        key = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env.local", e);
}

if (!key) {
    console.error("No API key found in .env.local");
    process.exit(1);
}

console.log("Using Key:", key.substring(0, 5) + "...");

async function testReplicate() {
    try {
        const replicate = new Replicate({
            auth: key,
        });

        console.log("Running Llama 3...");
        const output = await replicate.run(
            "meta/meta-llama-3-70b-instruct",
            {
                input: {
                    prompt: "Hello, are you working?",
                    max_tokens: 50
                }
            }
        );

        console.log("Output Raw:", output);
        if (Array.isArray(output)) {
            console.log("Result:", output.join(""));
        } else {
            console.log("Result:", output);
        }

    } catch (e) {
        console.error("Replicate Error:", e);
    }
}

testReplicate();
