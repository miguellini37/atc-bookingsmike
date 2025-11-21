import { useState } from 'react';
import { format } from 'date-fns';
import type { ApiKey } from '../types';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function ApiKeyList({ apiKeys, onDelete, isDeleting }: ApiKeyListProps) {
  const [copiedKey, setCopiedKey] = useState<number | null>(null);

  const copyToClipboard = async (key: string, id: number) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (apiKeys.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-500">
        No API keys found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((apiKey) => (
        <div key={apiKey.id} className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">{apiKey.name}</h3>
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                  CID: {apiKey.cid}
                </span>
              </div>

              <div className="flex gap-4 text-sm text-gray-600">
                <span>Division: {apiKey.division}</span>
                {apiKey.subdivision && <span>Subdivision: {apiKey.subdivision}</span>}
                {apiKey._count && (
                  <span className="text-primary-600 font-medium">
                    {apiKey._count.bookings} booking{apiKey._count.bookings !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                <code className="flex-1 text-sm font-mono break-all">{apiKey.key}</code>
                <button
                  onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                  className="btn-secondary text-sm px-3 py-1 whitespace-nowrap"
                >
                  {copiedKey === apiKey.id ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Created: {format(new Date(apiKey.createdAt), 'PPpp')}
              </div>
            </div>

            <button
              onClick={() => onDelete(apiKey.id)}
              disabled={isDeleting}
              className="btn-danger ml-4"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ApiKeyList;
