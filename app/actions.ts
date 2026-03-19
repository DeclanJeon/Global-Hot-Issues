import { GoogleGenAI, Type } from '@google/genai';

export async function getHotIssues(countryName: string, ageGroup: string = 'All') {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key is missing');

    let promptContext = `Generate the top 10 current hot issues or news topics for ${countryName}.`;
    if (ageGroup !== 'All') {
      promptContext = `Generate the top 10 current hot issues, trends, or viral topics specifically popular among people in their ${ageGroup} in ${countryName}. Focus on what this specific demographic is currently discussing on their most popular community sites, social media, and forums.`;
    }

    const prompt = `${promptContext}
The issues MUST be written in the primary local language of ${countryName}.
Include a title, a short summary, a relevant keyword for an image search (in English), an SEO-friendly meta description, and a realistic-looking URL slug.
You MUST return the result as a raw JSON array of objects. Do not include markdown formatting like \`\`\`json.
Each object must have these exact keys: "title", "summary", "thumbnailKeyword", "metaDescription", "urlSlug".`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';
    
    // Extract JSON array if wrapped in markdown
    const match = text.match(/\[[\s\S]*\]/);
    const jsonString = match ? match[0] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error fetching hot issues:', error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key is missing');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [{ role: "user", content: `Translate the following text into ${targetLanguage}. Return ONLY the translated text, nothing else.\n\nText to translate:\n${text}` }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
}

export async function translateNewsArray(newsArray: any[], targetLanguage: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key is missing');

    const prompt = `Translate the 'title', 'summary', and 'metaDescription' fields of the following JSON array into ${targetLanguage}. Keep the 'thumbnailKeyword' and 'urlSlug' as they are. 
You MUST return the translated JSON array as raw JSON. Do not include markdown formatting like \`\`\`json.
\n\nJSON:\n${JSON.stringify(newsArray)}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';
    
    // Extract JSON array if wrapped in markdown
    const match = text.match(/\[[\s\S]*\]/);
    const jsonString = match ? match[0] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error translating news array:', error);
    throw error;
  }
}
