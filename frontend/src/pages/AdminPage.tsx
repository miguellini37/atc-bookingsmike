import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiKeysApi, authApi, handleApiError } from '../lib/api';
import ApiKeyForm from '../components/ApiKeyForm';
import ApiKeyList from '../components/ApiKeyList';
import type { CreateApiKeyData } from '../types';

function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: apiKeysApi.getAll,
    retry: false,
    onError: () => {
      navigate('/login');
    },
  });

  const createMutation = useMutation({
    mutationFn: apiKeysApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setShowForm(false);
      setError('');
    },
    onError: (err) => {
      setError(handleApiError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiKeysApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      navigate('/login');
    },
  });

  const handleCreate = (data: CreateApiKeyData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this API key? All associated bookings will be deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">API Key Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'Create New API Key'}
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>
          <ApiKeyForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        </div>
      )}

      <ApiKeyList
        apiKeys={apiKeys}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminPage;
