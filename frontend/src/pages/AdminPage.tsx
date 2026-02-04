import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, LogOut, Key, Users, Calendar, Shield } from 'lucide-react';
import { apiKeysApi, authApi, handleApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ApiKeyForm from '@/components/ApiKeyForm';
import ApiKeyList from '@/components/ApiKeyList';
import { ApiKeyTableSkeleton } from '@/components/skeletons/ApiKeyRowSkeleton';
import type { CreateApiKeyData, ApiKey } from '@/types';

function AdminPage() {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiKey | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: apiKeys = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: apiKeysApi.getAll,
    retry: false,
  });

  // Redirect to login on auth error
  React.useEffect(() => {
    if (error) {
      toast.error('Please log in to access the admin panel');
      navigate('/login');
    }
  }, [error, navigate]);

  const createMutation = useMutation({
    mutationFn: apiKeysApi.create,
    onSuccess: (newKey) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setShowCreateDialog(false);
      toast.success('API key created successfully', {
        description: `Key created for ${newKey.name}`,
      });
    },
    onError: (err) => {
      toast.error('Failed to create API key', {
        description: handleApiError(err),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiKeysApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setDeleteTarget(null);
      toast.success('API key deleted successfully');
    },
    onError: (err) => {
      toast.error('Failed to delete API key', {
        description: handleApiError(err),
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: (err) => {
      toast.error('Logout failed', {
        description: handleApiError(err),
      });
    },
  });

  const handleCreate = (data: CreateApiKeyData) => {
    createMutation.mutate(data);
  };

  const handleDeleteClick = (apiKey: ApiKey) => {
    setDeleteTarget(apiKey);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate stats
  const totalBookings = apiKeys.reduce((sum, key) => sum + (key._count?.bookings || 0), 0);
  const uniqueDivisions = new Set(apiKeys.map((k) => k.division)).size;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Manage API keys and controllers</p>
          </div>
        </div>
        <ApiKeyTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage API keys and controllers</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for a controller. They will use this key to authenticate
                  their booking requests.
                </DialogDescription>
              </DialogHeader>
              <ApiKeyForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">Active controllers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Across all keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDivisions}</div>
            <p className="text-xs text-muted-foreground">Active divisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage controller API keys. Each key allows a controller to create and manage their
            bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyList
            apiKeys={apiKeys}
            onDelete={handleDeleteClick}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete API Key"
        description={`Are you sure you want to delete the API key for "${deleteTarget?.name}"? This action cannot be undone and will also delete all ${deleteTarget?._count?.bookings || 0} associated bookings.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminPage;
