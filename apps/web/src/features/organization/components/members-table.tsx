import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus, Search } from "lucide-react";

import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import { Label } from "@open-learn/ui/components/label";
import { Badge } from "@open-learn/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@open-learn/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@open-learn/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { authClient } from "@/lib/auth-client";
import { trpc, queryClient as qc } from "@/utils/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgRole = "owner" | "admin" | "member";

interface Member {
  id: string;
  userId: string;
  role: OrgRole;
  user: { name: string; email: string; image?: string | null };
}

interface Invitation {
  id: string;
  email: string;
  role: OrgRole;
  status: string;
}

type Row = ({ kind: "member" } & Member) | ({ kind: "invitation" } & Invitation);

// ─── Column helper ────────────────────────────────────────────────────────────

const col = createColumnHelper<Row>();

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({
  open,
  orgId,
  onClose,
}: {
  open: boolean;
  orgId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<OrgRole>("member");
  const [loading, setLoading] = React.useState(false);

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const result = await authClient.organization.inviteMember({
        email: email.trim(),
        role,
        organizationId: orgId,
      });
      if (result.error) throw new Error(result.error.message);
      await qc.invalidateQueries({ queryKey: [["organization", "getActive"]] });
      toast.success(`Invitation sent to ${email.trim()}`);
      setEmail("");
      setRole("member");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email.trim() || loading}>
            {loading ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MembersTable({ orgId }: { orgId: string }) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const orgQuery = useQuery(trpc.organization.getActive.queryOptions());

  const org = orgQuery.data as
    | { members?: Member[]; invitations?: Invitation[] }
    | null
    | undefined;

  const members: Member[] = (org?.members ?? []) as Member[];
  const invitations: Invitation[] = ((org?.invitations ?? []) as Invitation[]).filter(
    (inv) => inv.status === "pending",
  );

  const rows: Row[] = [
    ...members.map((m): Row => ({ kind: "member", ...m })),
    ...invitations.map((inv): Row => ({ kind: "invitation", ...inv })),
  ];

  const filteredRows = rows.filter((row) => {
    // Name/email search
    const search = globalFilter.toLowerCase();
    if (search) {
      if (row.kind === "member") {
        const hit =
          row.user.name.toLowerCase().includes(search) ||
          row.user.email.toLowerCase().includes(search);
        if (!hit) return false;
      } else {
        if (!row.email.toLowerCase().includes(search)) return false;
      }
    }
    // Role filter
    if (roleFilter !== "all" && row.role !== roleFilter) return false;
    return true;
  });

  async function handleChangeRole(memberId: string, role: OrgRole) {
    try {
      const result = await authClient.organization.updateMemberRole({ memberId, role });
      if (result.error) throw new Error(result.error.message);
      await qc.invalidateQueries({ queryKey: [["organization", "getActive"]] });
      toast.success("Role updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      const result = await authClient.organization.removeMember({ memberIdOrEmail: memberId });
      if (result.error) throw new Error(result.error.message);
      await qc.invalidateQueries({ queryKey: [["organization", "getActive"]] });
      toast.success("Member removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function handleCancelInvitation(invitationId: string) {
    try {
      const result = await authClient.organization.cancelInvitation({ invitationId });
      if (result.error) throw new Error(result.error.message);
      await qc.invalidateQueries({ queryKey: [["organization", "getActive"]] });
      toast.success("Invitation cancelled");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel invitation");
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8 w-64"
              placeholder="Search members…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 size-4" />
          Invite
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.kind === "member" ? row.id : `inv-${row.id}`}>
                  <TableCell className="font-medium">
                    {row.kind === "member" ? row.user.name : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.kind === "member" ? row.user.email : row.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.role === "owner" ? "default" : "secondary"}>
                      {row.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.kind === "invitation" ? (
                      <Badge variant="outline">Pending invite</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {row.kind === "member" && (
                            <>
                              {row.role !== "admin" && (
                                <DropdownMenuItem onClick={() => handleChangeRole(row.id, "admin")}>
                                  Make admin
                                </DropdownMenuItem>
                              )}
                              {row.role !== "member" && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeRole(row.id, "member")}
                                >
                                  Make member
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveMember(row.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </>
                          )}
                          {row.kind === "invitation" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancelInvitation(row.id)}
                            >
                              Cancel invite
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InviteModal open={inviteOpen} orgId={orgId} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
