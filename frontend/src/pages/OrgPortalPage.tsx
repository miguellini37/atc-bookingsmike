import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, LogOut, Calendar, Building2, Clock, ChevronDown, Users, RefreshCw, Trash2, Pencil, UserPlus } from 'lucide-react';
import { vatsimAuthApi, orgSessionApi, handleApiError, type OrgMember } from '@/lib/api';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import type { CreateBookingData, Booking } from '@/types';

function OrgPortalPage() {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Booking | null>(null);
  const [editTarget, setEditTarget] = React.useState<Booking | null>(null);
  const [showAddMemberDialog, setShowAddMemberDialog] = React.useState(false);
  const [newMemberCid, setNewMemberCid] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState('member');
  const [deleteMemberTarget, setDeleteMemberTarget] = React.useState<OrgMember | null>(null);
  const [editMemberTarget, setEditMemberTarget] = React.useState<OrgMember | null>(null);
  const [editMemberRole, setEditMemberRole] = React.useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch session info
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useQuery({
    queryKey: ['orgSession'],
    queryFn: vatsimAuthApi.getSession,
    retry: false,
  });

  // Determine current role
  const currentRole = React.useMemo(() => {
    if (!session?.currentOrg) return 'member';
    const org = session.organizations.find((o) => o.id === session.currentOrg?.id);
    return org?.role || 'member';
  }, [session]);

  const isAdmin = currentRole === 'admin';
  const isManager = currentRole === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  // Fetch organization's bookings using session-based endpoint
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useQuery({
    queryKey: ['myBookings'],
    queryFn: orgSessionApi.getMyBookings,
    retry: false,
    enabled: !!session?.currentOrg,
  });

  // Show error if bookings fail to load
  React.useEffect(() => {
    if (bookingsError) {
      toast.error('Failed to load bookings', {
        description: handleApiError(bookingsError),
      });
    }
  }, [bookingsError]);

  // Fetch members (admin/manager only)
  const {
    data: members = [],
    isLoading: isLoadingMembers,
  } = useQuery({
    queryKey: ['orgMembers'],
    queryFn: orgSessionApi.getMembers,
    retry: false,
    enabled: !!session?.currentOrg && isAdminOrManager,
  });

  // Redirect to login on auth error
  React.useEffect(() => {
    if (sessionError) {
      toast.error('Please log in to access the portal');
      navigate('/org/login');
    }
  }, [sessionError, navigate]);

  // Switch organization mutation
  const switchOrgMutation = useMutation({
    mutationFn: vatsimAuthApi.switchOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgSession'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      toast.success('Switched organization');
    },
    onError: (err) => {
      toast.error('Failed to switch organization', {
        description: handleApiError(err),
      });
    },
  });

  // Create booking mutation (using session-based endpoint)
  const createMutation = useMutation({
    mutationFn: orgSessionApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setShowCreateDialog(false);
      toast.success('Booking created successfully');
    },
    onError: (err) => {
      toast.error('Failed to create booking', {
        description: handleApiError(err),
      });
    },
  });

  // Update booking mutation (using session-based endpoint)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBookingData }) =>
      orgSessionApi.updateBooking(id, data),
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

  // Delete booking mutation (using session-based endpoint)
  const deleteMutation = useMutation({
    mutationFn: orgSessionApi.deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setDeleteTarget(null);
      toast.success('Booking deleted successfully');
    },
    onError: (err) => {
      toast.error('Failed to delete booking', {
        description: handleApiError(err),
      });
    },
  });

  // Member mutations
  const addMemberMutation = useMutation({
    mutationFn: orgSessionApi.addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setShowAddMemberDialog(false);
      setNewMemberCid('');
      setNewMemberRole('member');
      toast.success('Member added successfully');
    },
    onError: (err) => {
      toast.error('Failed to add member', {
        description: handleApiError(err),
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      orgSessionApi.updateMember(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setEditMemberTarget(null);
      toast.success('Member role updated');
    },
    onError: (err) => {
      toast.error('Failed to update member', {
        description: handleApiError(err),
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: orgSessionApi.removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setDeleteMemberTarget(null);
      toast.success('Member removed');
    },
    onError: (err) => {
      toast.error('Failed to remove member', {
        description: handleApiError(err),
      });
    },
  });

  const syncRosterMutation = useMutation({
    mutationFn: orgSessionApi.syncRoster,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      toast.success(result.message || 'Roster synced');
    },
    onError: (err) => {
      toast.error('Failed to sync roster', {
        description: handleApiError(err),
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: vatsimAuthApi.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/org/login');
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
    logoutMutation.mutate();
  };

  const handleSwitchOrg = (orgId: number) => {
    switchOrgMutation.mutate(orgId);
  };

  const handleAddMember = () => {
    if (!newMemberCid.trim()) return;
    addMemberMutation.mutate({ cid: newMemberCid.trim(), role: newMemberRole });
  };

  const handleUpdateMemberRole = () => {
    if (editMemberTarget && editMemberRole) {
      updateMemberMutation.mutate({ id: editMemberTarget.id, role: editMemberRole });
    }
  };

  const handleRemoveMemberConfirm = () => {
    if (deleteMemberTarget) {
      removeMemberMutation.mutate(deleteMemberTarget.id);
    }
  };

  // Calculate stats
  const now = new Date();
  const activeBookings = bookings.filter(
    (b) => new Date(b.start) <= now && new Date(b.end) >= now
  ).length;
  const upcomingBookings = bookings.filter((b) => new Date(b.start) > now).length;

  const isLoading = isLoadingSession || isLoadingBookings;
  const organization = session?.currentOrg;

  // Role badge colors
  const roleBadgeColor: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    member: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  // Can the current user remove a given member?
  const canRemoveMember = (member: OrgMember) => {
    if (member.cid === session?.cid) return false;
    if (isAdmin) return true;
    if (isManager && member.role === 'member') return true;
    return false;
  };

  // Roles that can be assigned by the current user when adding
  const assignableRoles = isAdmin
    ? ['member', 'manager', 'admin']
    : ['member'];

  if (isLoading || !session) {
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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{organization?.name}</h1>
            {session.organizations.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {session.organizations.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleSwitchOrg(org.id)}
                      className={org.id === organization?.id ? 'bg-muted' : ''}
                    >
                      {org.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({org.role})
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-muted-foreground">
            Welcome, {session.name} (CID: {session.cid}) &middot;{' '}
            <Badge variant="outline" className={roleBadgeColor[currentRole]}>
              {currentRole}
            </Badge>
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
            <p className="text-xs text-muted-foreground">
              {currentRole === 'member' ? 'Your bookings' : 'All time'}
            </p>
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

      {/* Tabs */}
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          {isAdminOrManager && (
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
          )}
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>
                  {currentRole === 'member' ? 'Your Bookings' : 'Organization Bookings'}
                </CardTitle>
                <CardDescription>
                  {currentRole === 'member'
                    ? 'Manage your ATC position bookings.'
                    : `Manage ATC position bookings for ${organization?.name}.`}
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
                      Book an ATC position{currentRole === 'member' ? '.' : ' for a controller in your organization.'}
                    </DialogDescription>
                  </DialogHeader>
                  <BookingForm
                    onSubmit={handleCreate}
                    isLoading={createMutation.isPending}
                    apiKeys={[]}
                    mode="create"
                    lockedCid={currentRole === 'member' ? session.cid : undefined}
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
        </TabsContent>

        {/* Members Tab (admin/manager only) */}
        {isAdminOrManager && (
          <TabsContent value="members">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    Manage organization members and their roles.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => syncRosterMutation.mutate()}
                      disabled={syncRosterMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncRosterMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync from VATSIM
                    </Button>
                  )}
                  <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Member</DialogTitle>
                        <DialogDescription>
                          Add a VATSIM member to this organization.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">VATSIM CID</label>
                          <Input
                            value={newMemberCid}
                            onChange={(e) => setNewMemberCid(e.target.value)}
                            placeholder="e.g., 1234567"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Role</label>
                          <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignableRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddMemberDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddMember}
                            disabled={!newMemberCid.trim() || addMemberMutation.isPending}
                          >
                            {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMembers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading members...</div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No members</h3>
                    <p className="text-muted-foreground">Add members or sync from VATSIM to get started.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>CID</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <span className="font-mono">{member.cid}</span>
                              {member.cid === session.cid && (
                                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={roleBadgeColor[member.role]}>
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {isAdmin && member.cid !== session.cid && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setEditMemberTarget(member);
                                      setEditMemberRole(member.role);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {canRemoveMember(member) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteMemberTarget(member)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

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
              lockedCid={currentRole === 'member' ? session.cid : undefined}
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

      {/* Delete Booking Confirmation Dialog */}
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

      {/* Edit Member Role Dialog */}
      <Dialog open={!!editMemberTarget} onOpenChange={(open) => !open && setEditMemberTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for CID {editMemberTarget?.cid}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editMemberRole} onValueChange={setEditMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMemberTarget(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMemberRole}
                disabled={updateMemberMutation.isPending}
              >
                {updateMemberMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteMemberTarget}
        onOpenChange={(open) => !open && setDeleteMemberTarget(null)}
        title="Remove Member"
        description={`Are you sure you want to remove CID "${deleteMemberTarget?.cid}" from this organization? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveMemberConfirm}
        loading={removeMemberMutation.isPending}
      />
    </div>
  );
}

export default OrgPortalPage;
