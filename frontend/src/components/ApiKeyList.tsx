import * as React from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Copy, Check, MoreHorizontal, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApiKey } from '@/types';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDelete: (apiKey: ApiKey) => void;
  isDeleting?: boolean;
}

function ApiKeyList({ apiKeys, onDelete, isDeleting }: ApiKeyListProps) {
  const [copiedKey, setCopiedKey] = React.useState<number | null>(null);
  const [visibleKeys, setVisibleKeys] = React.useState<Set<number>>(new Set());

  const copyToClipboard = async (key: string, id: number) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(id);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy API key');
    }
  };

  const toggleKeyVisibility = (id: number) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const maskKey = (key: string) => {
    return `${key.slice(0, 8)}${'*'.repeat(24)}${key.slice(-4)}`;
  };

  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No API keys found</p>
        <p className="text-sm">Create one to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Organization
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Division
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                API Key
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Portal
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Bookings
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Created
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((apiKey) => {
              const isKeyVisible = visibleKeys.has(apiKey.id);
              const isCopied = copiedKey === apiKey.id;

              return (
                <tr
                  key={apiKey.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <span className="font-medium">{apiKey.name}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{apiKey.division}</span>
                      {apiKey.subdivision && (
                        <span className="text-muted-foreground">/ {apiKey.subdivision}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                        {isKeyVisible ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {isKeyVisible ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={apiKey.portalEnabled ? 'default' : 'secondary'}>
                      {apiKey.portalEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={apiKey._count?.bookings ? 'default' : 'secondary'}>
                      {apiKey._count?.bookings || 0}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-sm text-muted-foreground">
                    {format(new Date(apiKey.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyToClipboard(apiKey.key, apiKey.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy API Key
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(apiKey)}
                          disabled={isDeleting}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApiKeyList;
