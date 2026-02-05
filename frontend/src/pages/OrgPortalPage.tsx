import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, LogOut, Calendar, Building2, Clock } from 'lucide-react';
import { orgApi, bookingsApi, setAuthToken, handleApiError } from '@/lib/api';
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
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import type { CreateBookingData, Booking } from '@/types';

function OrgPortalPage() {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Booking | null>(null);
  const [editTarget, setEditTarget] = React.useState<Booking | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Restore API key from session storage
  React.useEffect(() => {
    const storedKey = sessionStorage.getItem('orgApiKey');
    if (storedKey) {
      setAuthToken(storedKey);
    } else {
      navigate('/org/login');
    }
  }, [navigate]);

  // Fetch organization info
  const {
    data: organization,
    isLoading: isLoadingOrg,
    error: orgError,
  } = useQuery({
    queryKey: ['myOrganization'],
    queryFn: orgApi.getMyOrganization,
    retry: false,
  });

  // Fetch organization's bookings
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
  } = useQuery({
    queryKey: ['myBookings'],
    queryFn: orgApi.getMyBookings,
    retry: false,
    enabled: !!organization,
  });

  // Redirect to login on auth error
  React.useEffect(() => {
    if (orgError) {
      sessionStorage.removeItem('orgApiKey');
      setAuthToken(null);
      toast.error('Session expired. Please log in again.');
      navigate('/org/login');
    }
  }, [orgError, navigate]);

  // Create booking mutation
  const createMutation = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
      setShowCreateDialog(false);
      toast.success('Booking created successfully');
    },
    onError: (err) => {
      toast.error('Failed to create booking', {
        description: handleApiError(err),
      });
    },
  });

  // Update booking mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBookingData }) =>
      bookingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setEditTarget(null);
      toast.success('Booking updated successfully');
    },
    onError: (err) => {
      toast.error('Failed to update booking', {
        description: handleApiError(err),
      });
    },
  });

  // Delete booking mutation
  const deleteMutation = useMutation({
    mutationFn: bookingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
      setDeleteTarget(null);
      toast.success('Booking deleted successfully');
    },
    onError: (err) => {
      toast.error('Failed to delete booking', {
        description: handleApiError(err),
      });
    },
  });

  const handleCreate = (data: CreateBookingData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (booking: Booking) => {
    setEditTarget(booking);
  };

  const handleUpdate = (data: CreateBookingData) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data });
    }
  };

  const handleDeleteClick = (booking: Booking) => {
    setDeleteTarget(booking);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('orgApiKey');
    setAuthToken(null);
    toast.success('Logged out successfully');
    navigate('/org/login');
  };

  // Calculate stats
  const now = new Date();
  const activeBookings = bookings.filter(
    (b) => new Date(b.start) <= now && new Date(b.end) >= now
  ).length;
  const upcomingBookings = bookings.filter((b) => new Date(b.start) > now).length;

  const isLoading = isLoadingOrg || isLoadingBookings;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Portal</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{organization?.name}</h1>
          <p className="text-muted-foreground">
            {organization?.division}
            {organization?.subdivision ? ` / ${organization.subdivision}` : ''} - Organization Portal
          </p>
        </div>

        <Button variant="outline" onClick={handleLogout} className="gap-2 w-fit">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently in session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">Scheduled bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              Manage ATC position bookings for your organization.
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Book an ATC position for a controller in your organization.
                </DialogDescription>
              </DialogHeader>
              <BookingForm
                onSubmit={handleCreate}
                isLoading={createMutation.isPending}
                apiKeys={[]} // Empty - org portal doesn't need org selection
                mode="create"
                defaultValues={{
                  division: organization?.division,
                  subdivision: organization?.subdivision || undefined,
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <BookingList
            bookings={bookings}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Edit Booking Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the booking details for {editTarget?.callsign}.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <BookingForm
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              apiKeys={[]}
              mode="edit"
              defaultValues={{
                cid: editTarget.cid,
                callsign: editTarget.callsign,
                type: editTarget.type,
                start: editTarget.start.slice(0, 16),
                end: editTarget.end.slice(0, 16),
                division: editTarget.division,
                subdivision: editTarget.subdivision || undefined,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Booking"
        description={`Are you sure you want to delete the booking for "${deleteTarget?.callsign}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default OrgPortalPage;
