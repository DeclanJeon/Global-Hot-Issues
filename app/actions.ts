import { GoogleGenAI, Type } from '@google/genai';

export async function getHotIssues(countryName: string, ageGroup: string = 'All') {
  let promptContext = `Generate the top 10 current hot issues or news topics for ${countryName}.`;
  if (ageGroup !== 'All') {
    promptContext = `Generate the top 10 current hot issues, trends, or viral topics specifically popular among people in their ${ageGroup} in ${countryName}. Focus on what this specific demographic is currently discussing on their most popular community sites, social media, and forums.`;
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (apiKey) {
    try {
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
      console.warn('OpenRouter failed, falling back to Gemini:', error);
    }
  }

  // Fallback to Gemini
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${promptContext}
The issues MUST be written in the primary local language of ${countryName}.
Include a title, a short summary, a relevant keyword for an image search (in English), an SEO-friendly meta description, and a realistic-looking URL slug.
Return the result as a JSON array.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'News title in the local language' },
              summary: { type: Type.STRING, description: 'Short summary in the local language' },
              thumbnailKeyword: { type: Type.STRING, description: 'A single English keyword representing the news for image search' },
              metaDescription: { type: Type.STRING, description: 'SEO friendly meta description in the local language' },
              urlSlug: { type: Type.STRING, description: 'A realistic-looking URL slug for this news' },
            },
            required: ['title', 'summary', 'thumbnailKeyword', 'metaDescription', 'urlSlug'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gemini');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching hot issues (both APIs failed):', error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (apiKey) {
    try {
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
      console.warn('OpenRouter translation failed, falling back to Gemini:', error);
    }
  }

  // Fallback to Gemini
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text into ${targetLanguage}. Return ONLY the translated text, nothing else.\n\nText to translate:\n${text}`,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error('Error translating text (both APIs failed):', error);
    throw error;
  }
}

export async function translateNewsArray(newsArray: any[], targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (apiKey) {
    try {
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
      console.warn('OpenRouter array translation failed, falling back to Gemini:', error);
    }
  }

  // Fallback to Gemini
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the 'title', 'summary', and 'metaDescription' fields of the following JSON array into ${targetLanguage}. Keep the 'thumbnailKeyword' and 'urlSlug' as they are. Return the translated JSON array.\n\nJSON:\n${JSON.stringify(newsArray)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              thumbnailKeyword: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              urlSlug: { type: Type.STRING },
            },
            required: ['title', 'summary', 'thumbnailKeyword', 'metaDescription', 'urlSlug'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gemini');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error translating news array (both APIs failed):', error);
    throw error;
  }
}
