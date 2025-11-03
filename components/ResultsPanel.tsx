import React from 'react';
import type { ContactData } from '../types';
import { Spinner } from './Spinner';

interface ResultsPanelProps {
    contactData: ContactData | null;
    isLoading: boolean;
}

const ResultItem: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({ label, value }) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return null;

    let displayValue: React.ReactNode;
    if (Array.isArray(value)) {
        displayValue = (
            <ul className="list-disc list-inside">
                {value.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        );
    } else {
        displayValue = <span>{value}</span>;
    }
    
    return (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-words">{displayValue}</dd>
        </div>
    );
};

const ConfidenceBadge: React.FC<{ score?: number }> = ({ score }) => {
    if (score === undefined) return null;
    let color = 'bg-gray-400';
    if (score > 80) color = 'bg-green-500';
    else if (score > 50) color = 'bg-yellow-500';
    else color = 'bg-red-500';

    return <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${color}`}>{score}%</span>;
};


export const ResultsPanel: React.FC<ResultsPanelProps> = ({ contactData, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="text-gray-500">
                    <Spinner />
                </div>
                <p className="mt-4 text-gray-600 text-lg">Enriching contact data...</p>
            </div>
        );
    }

    if (!contactData) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-full min-h-[300px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-gray-500">Enriched data will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enriched Profile</h2>
            <div className="border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                    <ResultItem label="Name" value={contactData.name} />
                    <ResultItem label="Company" value={contactData.company} />
                    <ResultItem label="Role" value={contactData.role} />
                    <ResultItem label="Email" value={
                        contactData.email ? (
                            <>
                                {contactData.email}
                                <ConfidenceBadge score={contactData.emailConfidence} />
                            </>
                        ) : 'Not found'
                    }/>
                    <ResultItem label="Phone" value={contactData.phone} />
                    <ResultItem label="Website" value={contactData.website ? <a href={contactData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contactData.website}</a> : undefined} />
                    <ResultItem label="LinkedIn" value={contactData.linkedinUrl ? <a href={contactData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contactData.linkedinUrl}</a> : undefined} />
                    <ResultItem label="Industry" value={contactData.industry} />
                    <ResultItem label="Sources" value={contactData.sources} />
                </dl>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4 pt-6 border-t border-gray-200">Notes Analysis</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-gray-600">Summary</h4>
                    <p className="mt-1 text-sm text-gray-800 bg-gray-100 p-3 rounded-md whitespace-pre-wrap">{contactData.notesSummary || 'No summary generated.'}</p>
                </div>
                <div>
                    <h4 className="font-medium text-gray-600">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {contactData.tags.length > 0 ? contactData.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">{tag}</span>
                        )) : <p className="text-sm text-gray-500">No tags identified.</p>}
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-gray-600">Original Notes</h4>
                    <p className="mt-1 text-sm text-gray-500 bg-gray-100/50 p-3 rounded-md whitespace-pre-wrap">{contactData.notesRaw || 'No notes were provided.'}</p>
                </div>
            </div>
        </div>
    );
};