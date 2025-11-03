
import { GoogleGenAI, Type } from '@google/genai';
import type { RawInputs, NormalizedData, NotesSummary } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const normalizationSchema = {
    type: Type.OBJECT,
    properties: {
        firstName: { type: Type.STRING, description: 'The person\'s first name.' },
        lastName: { type: Type.STRING, description: 'The person\'s last name.' },
        companyName: { type: Type.STRING, description: 'The cleaned company name.' },
        domain: { type: Type.STRING, description: 'The inferred company domain (e.g., acme.com).' },
        linkedinUrl: { type: Type.STRING, description: 'The validated LinkedIn profile URL.' },
        enrichmentPath: {
            type: Type.STRING,
            enum: ['nameAndDomain', 'linkedin', 'nameOnly'],
            description: 'The best enrichment path. Use "linkedin" if URL is provided. Use "nameAndDomain" if name and company/domain are provided. Otherwise, use "nameOnly".'
        }
    },
};

const notesSummarySchema = {
    type: Type.OBJECT,
    properties: {
        notesSummary: {
            type: Type.STRING,
            description: 'A concise summary of the notes, highlighting key topics and action items.'
        },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 1-3 relevant tags or keywords (e.g., "Follow-up", "Pricing", "Q4-Prospect").'
        }
    }
};

export async function normalizeAndGetStrategy(inputs: RawInputs): Promise<NormalizedData> {
    const prompt = `
        Normalize the following contact information.
        - Trim whitespace from all fields.
        - Extract the first and last name from the full name.
        - If a company name is given but no domain, infer the most likely company domain.
        - Validate the LinkedIn URL if provided.
        - Determine the best enrichment path based on the available data.

        Inputs:
        Name: "${inputs.name}"
        Company: "${inputs.company}"
        LinkedIn URL: "${inputs.linkedinUrl}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: normalizationSchema
            }
        });
        const result = JSON.parse(response.text);
        // Ensure enrichmentPath has a fallback
        if (!result.enrichmentPath) {
             if (result.linkedinUrl) result.enrichmentPath = 'linkedin';
             else if (result.firstName && result.domain) result.enrichmentPath = 'nameAndDomain';
             else result.enrichmentPath = 'nameOnly';
        }
        return result as NormalizedData;
    } catch (error) {
        console.error('Error in Gemini normalization:', error);
        throw new Error('Could not normalize contact data via AI.');
    }
}

export async function summarizeNotes(notes: string): Promise<NotesSummary> {
    if (!notes.trim()) {
        return { notesSummary: '', tags: [] };
    }

    const prompt = `
        Summarize the following notes. Identify key topics, dates, and potential follow-up actions.
        Extract a few relevant tags. Keep the summary concise.

        Notes:
        ---
        ${notes}
        ---
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: notesSummarySchema
            }
        });

        return JSON.parse(response.text) as NotesSummary;
    } catch (error) {
        console.error('Error in Gemini note summarization:', error);
        throw new Error('Could not summarize notes via AI.');
    }
}
