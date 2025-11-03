
import type { ContactData } from '../types';

// This is a mock Notion service. A real implementation would use the
// @notionhq/client library and require OAuth or an integration token.
// We simulate the API call to demonstrate the application's flow.

export const saveToNotion = (data: ContactData): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log('--- Sending data to Notion ---');

        // This is the data structure that would be sent to the Notion API
        const notionPagePayload = {
            // database_id: 'YOUR_DATABASE_ID', // This would be configured by the user
            properties: {
                'Name': { title: [{ text: { content: data.name } }] },
                'Company': { rich_text: [{ text: { content: data.company } }] },
                'Role': { rich_text: [{ text: { content: data.role || '' } }] },
                'Website': { url: data.website || null },
                'Email': { email: data.email || null },
                'EmailConfidence': { number: data.emailConfidence || null },
                'Phone': { phone_number: data.phone || null },
                'LinkedInURL': { url: data.linkedinUrl || null },
                'Sources': { multi_select: data.sources.map(s => ({ name: s })) },
                'NotesRaw': { rich_text: [{ text: { content: data.notesRaw } }] },
                'NotesSummary': { rich_text: [{ text: { content: data.notesSummary } }] },
                'CreatedAt': { date: { start: data.createdAt } },
            },
        };

        console.log(JSON.stringify(notionPagePayload, null, 2));
        
        setTimeout(() => {
            // Simulate a potential API failure
            if (data.name.toLowerCase().includes('fail')) {
                 reject(new Error('Invalid Notion API token.'));
            } else {
                 resolve(`Successfully created Notion page for ${data.name}.`);
            }
        }, 1000); // Simulate network delay
    });
};
