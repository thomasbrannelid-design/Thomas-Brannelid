
export interface RawInputs {
    name: string;
    company: string;
    linkedinUrl: string;
    notes: string;
}

export interface NormalizedData {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    domain?: string;
    linkedinUrl?: string;
    enrichmentPath: 'nameAndDomain' | 'linkedin' | 'nameOnly';
}

export interface EnrichedProfile {
    name: string;
    company: string;
    role?: string;
    website?: string;
    email?: string;
    emailConfidence?: number;
    phone?: string;
    industry?: string;
    linkedinUrl?: string;
    sources: string[];
}

export interface NotesSummary {
    notesSummary: string;
    tags: string[];
}

export interface ContactData extends EnrichedProfile {
    notesRaw: string;
    notesSummary: string;
    tags: string[];
    createdAt: string;
}

export type StorageDestination = 'notion' | 'google_sheets';

export interface ToastMessage {
    message: string;
    type: 'success' | 'error' | 'info';
}
