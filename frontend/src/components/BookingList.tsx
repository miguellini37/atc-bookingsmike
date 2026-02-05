import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, Radio, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookingType, type Booking } from '@/types';

interface BookingListProps {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
  isDeleting?: boolean;
}

const bookingTypeColors: Record<BookingType, string> = {
  [BookingType.BOOKING]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [BookingType.EVENT]: 'bg-red-500/10 text-red-500 border-red-500/20',
  [BookingType.EXAM]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [BookingType.TRAINING]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const positionTypeColors: Record<string, string> = {
  CTR: 'bg-indigo-500/10 text-indigo-500',
  APP: 'bg-green-500/10 text-green-500',
  DEP: 'bg-emerald-500/10 text-emerald-500',
  TWR: 'bg-red-500/10 text-red-500',
  GND: 'bg-amber-500/10 text-amber-500',
  DEL: 'bg-cyan-500/10 text-cyan-500',
  FSS: 'bg-violet-500/10 text-violet-500',
};

function getPositionType(callsign: string): string {
  const match = callsign.match(/_(DEL|GND|TWR|APP|DEP|CTR|FSS)$/i);
  return match ? match[1].toUpperCase() : 'UNK';
}

function getBookingStatus(booking: Booking): 'active' | 'upcoming' | 'completed' {
  const now = new Date();
  const start = new Date(booking.start);
  const end = new Date(booking.end);

  if (now >= start && now <= end) return 'active';
  if (now < start) return 'upcoming';
  return 'completed';
}

function BookingList({ bookings, onEdit, onDelete, isDeleting }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No bookings found</h3>
        <p className="text-muted-foreground">
          Create a booking to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Callsign</TableHead>
            <TableHead>Controller</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Time (UTC)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const positionType = getPositionType(booking.callsign);
            const status = getBookingStatus(booking);

            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-medium">{booking.callsign}</span>
                    <Badge variant="outline" className={positionTypeColors[positionType]}>
                      {positionType}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{booking.cid}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{booking.apiKey?.name || 'Unknown'}</div>
                    <div className="text-muted-foreground text-xs">
                      {booking.division}{booking.subdivision ? `/${booking.subdivision}` : ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={bookingTypeColors[booking.type]}>
                    {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(booking.start), 'MMM d, yyyy')}</div>
                    <div className="text-muted-foreground">
                      {format(new Date(booking.start), 'HH:mm')} - {format(new Date(booking.end), 'HH:mm')}z
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      status === 'active'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : status === 'upcoming'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(booking)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(booking)}
                          className="text-destructive focus:text-destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default BookingList;
