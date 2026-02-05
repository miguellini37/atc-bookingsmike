import { format } from 'date-fns';
import { Trash2, User, Shield, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrgMember } from '@/lib/api';

interface OrgMemberListProps {
  members: OrgMember[];
  onRemove?: (member: OrgMember) => void;
  isRemoving?: boolean;
}

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-3 w-3" />,
  manager: <UserCog className="h-3 w-3" />,
  member: <User className="h-3 w-3" />,
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  member: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

function OrgMemberList({ members, onRemove, isRemoving }: OrgMemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No members added yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CID</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <span className="font-mono font-medium">{member.cid}</span>
              </TableCell>
              <TableCell>
                {member.apiKey ? (
                  <div className="text-sm">
                    <div className="font-medium">{member.apiKey.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {member.apiKey.division}
                      {member.apiKey.subdivision ? `/${member.apiKey.subdivision}` : ''}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unknown</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`gap-1 ${roleColors[member.role] || ''}`}>
                  {roleIcons[member.role]}
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(member.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemove(member)}
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default OrgMemberList;
