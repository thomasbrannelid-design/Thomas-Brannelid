import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsPanel } from './components/ResultsPanel';
import { StorageOptions } from './components/StorageOptions';
import { Toast } from './components/Toast';
import { normalizeAndGetStrategy, summarizeNotes } from './services/geminiService';
import { enrichContact } from './services/enrichmentService';
import { saveToNotion } from './services/notionService';
import { saveToGoogleSheets } from './services/googleSheetsService';
import type { ContactData, RawInputs, StorageDestination, ToastMessage } from './types';

const App: React.FC = () => {
    const [rawInputs, setRawInputs] = useState<RawInputs>({
        name: '',
        company: '',
        linkedinUrl: '',
        notes: ''
    });
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [storageDests, setStorageDests] = useState<Set<StorageDestination>>(new Set());
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [cache, setCache] = useState<Map<string, ContactData>>(new Map());

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleEnrich = useCallback(async () => {
        if (!rawInputs.name && !rawInputs.company && !rawInputs.linkedinUrl) {
            showToast('Please provide at least a Name, Company, or LinkedIn URL.', 'error');
            return;
        }

        setIsLoading(true);
        setContactData(null);

        const cacheKey = rawInputs.linkedinUrl || `${rawInputs.name}|${rawInputs.company}`;
        if (cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey)!;
             if (rawInputs.notes !== cachedData.notesRaw) {
                try {
                    const notesSummary = await summarizeNotes(rawInputs.notes);
                    const updatedData = { ...cachedData, notesRaw: rawInputs.notes, ...notesSummary };
                    setContactData(updatedData);
                    cache.set(cacheKey, updatedData);
                    showToast('Used cached data and updated notes.', 'info');
                } catch (e) {
                     showToast('Failed to summarize notes. Using cached data.', 'error');
                     setContactData(cachedData);
                }
            } else {
                 setContactData(cachedData);
                 showToast('Contact data loaded from cache.', 'info');
            }
            setIsLoading(false);
            return;
        }

        try {
            const normalized = await normalizeAndGetStrategy(rawInputs);
            const enrichedProfile = await enrichContact(normalized);
            
            let notesSummary = { notesSummary: '', tags: [] };
            if (rawInputs.notes) {
                notesSummary = await summarizeNotes(rawInputs.notes);
            }

            const finalData: ContactData = {
                ...enrichedProfile,
                linkedinUrl: normalized.linkedinUrl || enrichedProfile.linkedinUrl,
                notesRaw: rawInputs.notes,
                notesSummary: notesSummary.notesSummary,
                tags: notesSummary.tags,
                createdAt: new Date().toISOString(),
            };

            setContactData(finalData);
            cache.set(cacheKey, finalData);
            showToast('Contact enriched successfully!', 'success');
        } catch (error) {
            console.error('Enrichment failed:', error);
            showToast(error instanceof Error ? error.message : 'An unknown error occurred during enrichment.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [rawInputs, cache]);

    const handleSave = useCallback(async () => {
        if (!contactData || storageDests.size === 0) {
            showToast('No data to save or no destination selected.', 'error');
            return;
        }
        setIsSaving(true);

        const destinations = Array.from(storageDests);
        const results = await Promise.allSettled(destinations.map(dest => {
            if (dest === 'notion') return saveToNotion(contactData);
            if (dest === 'google_sheets') return saveToGoogleSheets(contactData);
            return Promise.reject(new Error('Unknown destination'));
        }));

        let successCount = 0;
        results.forEach((result, index) => {
            const destName = destinations[index] === 'notion' ? 'Notion' : 'Google Sheets';
            if (result.status === 'fulfilled') {
                showToast(`Successfully saved to ${destName}.`, 'success');
                successCount++;
            } else {
                showToast(`Failed to save to ${destName}: ${result.reason.message}`, 'error');
            }
        });

        if (successCount === destinations.length) {
          setContactData(null);
          setRawInputs({ name: '', company: '', linkedinUrl: '', notes: ''});
        }

        setIsSaving(false);
    }, [contactData, storageDests]);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                        Contact Enrichment + Notes
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Enter contact details, get enriched data, and save it to your favorite tools. Powered by Gemini.
                    </p>
                </header>
                <main className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
                        <InputForm
                            rawInputs={rawInputs}
                            setRawInputs={setRawInputs}
                            onEnrich={handleEnrich}
                            isLoading={isLoading}
                        />
                        {contactData && (
                            <StorageOptions
                                selectedDests={storageDests}
                                setSelectedDests={setStorageDests}
                                onSave={handleSave}
                                isSaving={isSaving}
                            />
                        )}
                    </div>
                    <div className="mt-8 lg:mt-0">
                        <ResultsPanel contactData={contactData} isLoading={isLoading} />
                    </div>
                </main>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;