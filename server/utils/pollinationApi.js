import fetch from "node-fetch";

/**
 * @params {string} prompt - The prompt describing the image
 * @returns {Promise<string>} - Direct URL to the generated image
 */



async function callPollinations({prompt}){
    try {
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
        const res = await fetch(url);
        if(!res.ok){
            throw new Error(`Pollinations API error: ${res.statusText}`);
        }
        return url;
    } catch (error) {
        console.error("callPollinations error : ", error.message);
        throw error;
    }
}

export {callPollinations};