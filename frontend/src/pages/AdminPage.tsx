import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, LogOut, Key, Calendar, Shield, Building2, Users, Hash } from 'lucide-react';
import { apiKeysApi, bookingsApi, authApi, orgMembersApi, handleApiError, setAuthToken, type OrgMember } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import OrgMemberList from '@/components/OrgMemberList';
import { ApiKeyTableSkeleton } from '@/components/skeletons/ApiKeyRowSkeleton';
import type { CreateApiKeyData, ApiKey, CreateBookingData, Booking } from '@/types';

interface AddMemberForm {
  cid: string;
  apiKeyId: string;
  role: string;
}

function AdminPage() {
  const [activeTab, setActiveTab] = React.useState('bookings');
  const [showCreateKeyDialog, setShowCreateKeyDialog] = React.useState(false);
  const [showCreateBookingDialog, setShowCreateBookingDialog] = React.useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = React.useState(false);
  const [deleteKeyTarget, setDeleteKeyTarget] = React.useState<ApiKey | null>(null);
  const [deleteBookingTarget, setDeleteBookingTarget] = React.useState<Booking | null>(null);
  const [editBookingTarget, setEditBookingTarget] = React.useState<Booking | null>(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = React.useState<OrgMember | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddMemberForm>({
    defaultValues: { role: 'manager' },
  });

  // Fetch API keys
  const {
    data: apiKeys = [],
    isLoading: isLoadingKeys,
    error: keysError,
  } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: apiKeysApi.getAll,
    retry: false,
  });

  // Fetch bookings
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
  } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: () => bookingsApi.getAll(),
    retry: false,
  });

  // Fetch org members
  const {
    data: members = [],
    isLoading: isLoadingMembers,
  } = useQuery({
    queryKey: ['orgMembers'],
    queryFn: orgMembersApi.getAll,
    retry: false,
  });

  // Redirect to login on auth error
  React.useEffect(() => {
    if (keysError) {
      toast.error('Please log in to access the admin panel');
      navigate('/login');
    }
  }, [keysError, navigate]);

  // API Key mutations
  const createKeyMutation = useMutation({
    mutationFn: apiKeysApi.create,
    onSuccess: (newKey) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setShowCreateKeyDialog(false);
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

  const deleteKeyMutation = useMutation({
    mutationFn: apiKeysApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setDeleteKeyTarget(null);
      toast.success('API key deleted successfully');
    },
    onError: (err) => {
      toast.error('Failed to delete API key', {
        description: handleApiError(err),
      });
    },
  });

  // Member mutations
  const addMemberMutation = useMutation({
    mutationFn: orgMembersApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setShowAddMemberDialog(false);
      reset();
      toast.success('Member added successfully');
    },
    onError: (err) => {
      toast.error('Failed to add member', {
        description: handleApiError(err),
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: orgMembersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setDeleteMemberTarget(null);
      toast.success('Member removed successfully');
    },
    onError: (err) => {
      toast.error('Failed to remove member', {
        description: handleApiError(err),
      });
    },
  });

  // Booking mutations
  const createBookingMutation = useMutation({
    mutationFn: async ({ data, apiKeyId }: { data: CreateBookingData; apiKeyId: number }) => {
      const apiKey = apiKeys.find(k => k.id === apiKeyId);
      if (apiKey) {
        setAuthToken(apiKey.key);
      }
      const result = await bookingsApi.create(data);
      setAuthToken(null);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setShowCreateBookingDialog(false);
      toast.success('Booking created successfully');
    },
    onError: (err) => {
      setAuthToken(null);
      toast.error('Failed to create booking', {
        description: handleApiError(err),
      });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateBookingData }) => {
      const booking = bookings.find(b => b.id === id);
      const apiKey = apiKeys.find(k => k.id === booking?.apiKeyId);
      if (apiKey) {
        setAuthToken(apiKey.key);
      }
      const result = await bookingsApi.update(id, data);
      setAuthToken(null);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      setEditBookingTarget(null);
      toast.success('Booking updated successfully');
    },
    onError: (err) => {
      setAuthToken(null);
      toast.error('Failed to update booking', {
        description: handleApiError(err),
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (booking: Booking) => {
      const apiKey = apiKeys.find(k => k.id === booking.apiKeyId);
      if (apiKey) {
        setAuthToken(apiKey.key);
      }
      await bookingsApi.delete(booking.id);
      setAuthToken(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setDeleteBookingTarget(null);
      toast.success('Booking deleted successfully');
    },
    onError: (err) => {
      setAuthToken(null);
      toast.error('Failed to delete booking', {
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

  // Handlers
  const handleCreateKey = (data: CreateApiKeyData) => {
    createKeyMutation.mutate(data);
  };

  const handleDeleteKeyClick = (apiKey: ApiKey) => {
    setDeleteKeyTarget(apiKey);
  };

  const handleDeleteKeyConfirm = () => {
    if (deleteKeyTarget) {
      deleteKeyMutation.mutate(deleteKeyTarget.id);
    }
  };

  const handleAddMember = (data: AddMemberForm) => {
    addMemberMutation.mutate({
      cid: data.cid,
      apiKeyId: parseInt(data.apiKeyId),
      role: data.role,
    });
  };

  const handleRemoveMemberClick = (member: OrgMember) => {
    setDeleteMemberTarget(member);
  };

  const handleRemoveMemberConfirm = () => {
    if (deleteMemberTarget) {
      removeMemberMutation.mutate(deleteMemberTarget.id);
    }
  };

  const handleCreateBooking = (data: CreateBookingData, apiKeyId?: number) => {
    if (apiKeyId) {
      createBookingMutation.mutate({ data, apiKeyId });
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditBookingTarget(booking);
  };

  const handleUpdateBooking = (data: CreateBookingData) => {
    if (editBookingTarget) {
      updateBookingMutation.mutate({ id: editBookingTarget.id, data });
    }
  };

  const handleDeleteBookingClick = (booking: Booking) => {
    setDeleteBookingTarget(booking);
  };

  const handleDeleteBookingConfirm = () => {
    if (deleteBookingTarget) {
      deleteBookingMutation.mutate(deleteBookingTarget);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => {
    const now = new Date();
    return new Date(b.start) <= now && new Date(b.end) >= now;
  }).length;

  const isLoading = isLoadingKeys || isLoadingBookings || isLoadingMembers;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Manage organizations and bookings</p>
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
          <p className="text-muted-foreground">Manage organizations and bookings</p>
        </div>

        <Button variant="outline" onClick={handleLogout} className="gap-2 w-fit">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">FIRs/vARTCCs with API keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">{activeBookings} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">Authorized users</p>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="gap-2">
            <Key className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Managers
          </TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  Create and manage ATC position bookings for organizations.
                </CardDescription>
              </div>
              <Dialog open={showCreateBookingDialog} onOpenChange={setShowCreateBookingDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={apiKeys.length === 0}>
                    <Plus className="h-4 w-4" />
                    Create Booking
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                    <DialogDescription>
                      Create a booking on behalf of an organization.
                    </DialogDescription>
                  </DialogHeader>
                  <BookingForm
                    onSubmit={handleCreateBooking}
                    isLoading={createBookingMutation.isPending}
                    apiKeys={apiKeys}
                    mode="create"
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No organizations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create an organization first before creating bookings.
                  </p>
                  <Button onClick={() => setActiveTab('apikeys')}>
                    Go to Organizations
                  </Button>
                </div>
              ) : (
                <BookingList
                  bookings={bookings}
                  onEdit={handleEditBooking}
                  onDelete={handleDeleteBookingClick}
                  isDeleting={deleteBookingMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="apikeys" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>
                  Manage organization API keys. Each key allows an organization to manage their bookings.
                </CardDescription>
              </div>
              <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                      Generate an API key for an organization (FIR/vARTCC).
                    </DialogDescription>
                  </DialogHeader>
                  <ApiKeyForm onSubmit={handleCreateKey} isLoading={createKeyMutation.isPending} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ApiKeyList
                apiKeys={apiKeys}
                onDelete={handleDeleteKeyClick}
                isDeleting={deleteKeyMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Organization Managers</CardTitle>
                <CardDescription>
                  Add VATSIM members who can manage bookings for their organization via the web portal.
                </CardDescription>
              </div>
              <Dialog open={showAddMemberDialog} onOpenChange={(open) => {
                setShowAddMemberDialog(open);
                if (!open) reset();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={apiKeys.length === 0}>
                    <Plus className="h-4 w-4" />
                    Add Manager
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Organization Manager</DialogTitle>
                    <DialogDescription>
                      Add a VATSIM member who can log in and manage bookings for an organization.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(handleAddMember)} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="cid" className="text-sm font-medium flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        VATSIM CID <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="cid"
                        {...register('cid', { required: 'CID is required' })}
                        placeholder="e.g., 1234567"
                        className={errors.cid ? 'border-destructive' : ''}
                      />
                      {errors.cid && (
                        <p className="text-sm text-destructive">{errors.cid.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        Organization <span className="text-destructive">*</span>
                      </label>
                      <Select onValueChange={(v) => setValue('apiKeyId', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization..." />
                        </SelectTrigger>
                        <SelectContent>
                          {apiKeys.map((key) => (
                            <SelectItem key={key.id} value={key.id.toString()}>
                              {key.name} ({key.division}{key.subdivision ? `/${key.subdivision}` : ''})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Role
                      </label>
                      <Select defaultValue="manager" onValueChange={(v) => setValue('role', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member (view only)</SelectItem>
                          <SelectItem value="manager">Manager (can create/edit/delete)</SelectItem>
                          <SelectItem value="admin">Admin (full access)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={addMemberMutation.isPending}>
                        {addMemberMutation.isPending ? 'Adding...' : 'Add Manager'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No organizations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create an organization first before adding managers.
                  </p>
                  <Button onClick={() => setActiveTab('apikeys')}>
                    Go to Organizations
                  </Button>
                </div>
              ) : (
                <OrgMemberList
                  members={members}
                  onRemove={handleRemoveMemberClick}
                  isRemoving={removeMemberMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Booking Dialog */}
      <Dialog open={!!editBookingTarget} onOpenChange={(open) => !open && setEditBookingTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the booking details for {editBookingTarget?.callsign}.
            </DialogDescription>
          </DialogHeader>
          {editBookingTarget && (
            <BookingForm
              onSubmit={handleUpdateBooking}
              isLoading={updateBookingMutation.isPending}
              apiKeys={apiKeys}
              mode="edit"
              defaultValues={{
                cid: editBookingTarget.cid,
                callsign: editBookingTarget.callsign,
                type: editBookingTarget.type,
                start: editBookingTarget.start.slice(0, 16),
                end: editBookingTarget.end.slice(0, 16),
                division: editBookingTarget.division,
                subdivision: editBookingTarget.subdivision || undefined,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete API Key Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteKeyTarget}
        onOpenChange={(open) => !open && setDeleteKeyTarget(null)}
        title="Delete Organization"
        description={`Are you sure you want to delete "${deleteKeyTarget?.name}"? This will delete all ${deleteKeyTarget?._count?.bookings || 0} bookings and remove all managers.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteKeyConfirm}
        loading={deleteKeyMutation.isPending}
      />

      {/* Delete Booking Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteBookingTarget}
        onOpenChange={(open) => !open && setDeleteBookingTarget(null)}
        title="Delete Booking"
        description={`Are you sure you want to delete the booking for "${deleteBookingTarget?.callsign}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteBookingConfirm}
        loading={deleteBookingMutation.isPending}
      />

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteMemberTarget}
        onOpenChange={(open) => !open && setDeleteMemberTarget(null)}
        title="Remove Manager"
        description={`Are you sure you want to remove CID ${deleteMemberTarget?.cid} from ${deleteMemberTarget?.apiKey?.name || 'this organization'}?`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveMemberConfirm}
        loading={removeMemberMutation.isPending}
      />
    </div>
  );
}

export default AdminPage;
