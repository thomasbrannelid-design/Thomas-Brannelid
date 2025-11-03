
import type { NormalizedData, EnrichedProfile } from '../types';

// This is a mock enrichment service. In a real application, this would
// make a call to a third-party API like Clearbit, Hunter.io, etc.
// We are simulating the API response to demonstrate the application's flow.

const mockDatabase: Record<string, Omit<EnrichedProfile, 'name'>> = {
    'linkedin.com/in/janedoe': {
        company: 'Innovate Inc.',
        role: 'Senior Software Engineer',
        website: 'https://innovate.com',
        email: 'jane.doe@innovate.com',
        emailConfidence: 95,
        phone: '+1-555-0101',
        industry: 'Technology',
        linkedinUrl: 'https://www.linkedin.com/in/janedoe',
        sources: ['api.mockenrich.com/v1/person'],
    },
    'john.smith@acme.com': {
        company: 'Acme Corp',
        role: 'Product Manager',
        website: 'https://acme.com',
        email: 'john.smith@acme.com',
        emailConfidence: 88,
        phone: '+1-555-0102',
        industry: 'Manufacturing',
        linkedinUrl: 'https://www.linkedin.com/in/johnsmith',
        sources: ['api.mockenrich.com/v1/person'],
    },
     'sara.jones@techsolutions.com': { // Test case for no email found
        company: 'Tech Solutions',
        role: 'Marketing Director',
        website: 'https://techsolutions.com',
        email: undefined,
        emailConfidence: 0,
        phone: '+1-555-0103',
        industry: 'IT Services',
        linkedinUrl: 'https://www.linkedin.com/in/sarajones',
        sources: ['api.mockenrich.com/v1/person'],
    },
};

export const enrichContact = (normalized: NormalizedData): Promise<EnrichedProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let result: Omit<EnrichedProfile, 'name'> | null = null;
            const fullName = `${normalized.firstName || ''} ${normalized.lastName || ''}`.trim();

            if (normalized.enrichmentPath === 'linkedin' && normalized.linkedinUrl) {
                const key = normalized.linkedinUrl.includes('linkedin.com/in/') 
                    ? `linkedin.com/in/${normalized.linkedinUrl.split('/in/')[1].split('/')[0]}`
                    : null;
                if (key && mockDatabase[key]) {
                    result = mockDatabase[key];
                }
            } else if (normalized.enrichmentPath === 'nameAndDomain' && normalized.domain && fullName) {
                 const emailKey = `${normalized.firstName?.toLowerCase()}.${normalized.lastName?.toLowerCase()}@${normalized.domain}`;
                 if(mockDatabase[emailKey]) {
                     result = mockDatabase[emailKey];
                 } else { // simulate partial match
                     result = {
                        company: normalized.companyName || 'Unknown Company',
                        role: 'Role not found',
                        website: `https://${normalized.domain}`,
                        email: undefined,
                        emailConfidence: 0,
                        phone: undefined,
                        industry: 'Unknown',
                        linkedinUrl: normalized.linkedinUrl,
                        sources: ['api.mockenrich.com/v1/partial'],
                     }
                 }
            }

            if (result) {
                resolve({
                    ...result,
                    name: fullName || 'Name Not Provided',
                    company: result.company || normalized.companyName || 'Unknown Company',
                });
            } else {
                 // Return a partial profile if no match is found
                 resolve({
                    name: fullName || 'Name Not Provided',
                    company: normalized.companyName || 'Unknown Company',
                    role: undefined,
                    website: normalized.domain ? `https://${normalized.domain}` : undefined,
                    email: undefined,
                    emailConfidence: 0,
                    phone: undefined,
                    industry: undefined,
                    linkedinUrl: normalized.linkedinUrl,
                    sources: ['api.mockenrich.com/v1/notfound'],
                });
            }
        }, 1500); // Simulate network delay
    });
};
