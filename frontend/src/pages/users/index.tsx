import { Button } from "@/components/ui/button";
import type { user, UserRole } from "@/types";
import CustomAlert from "@/components/global/CustomAlert";
import Search from "@/components/global/Search";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { lmsUsers, type LmsUser } from "@/services/lmsApi";
import UserTable from "@/components/users/UserTable";
import UserDialog from "@/components/users/UserDialog";

interface Props {
  role: UserRole;
  title: string;
  description: string;
}

/** Map LmsUser → local user shape so existing UserTable works unchanged */
function toUser(u: LmsUser): user {
  return {
    _id:            u._id,
    name:           u.name,
    email:          u.email,
    role:           u.role as UserRole,
    className:      u.className,
    approvalStatus: u.approvalStatus as any,
  };
}

export default function UserManagementPage({ role, title, description }: Props) {
  const [users, setUsers] = useState<user[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<user | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await lmsUsers.list({ role });
      let fetched = (res.users ?? []).map(toUser);

      // Client-side search filter (backend doesn't support search param yet)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        fetched = fetched.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
      }

      const limit = 10;
      const total = fetched.length;
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
      setUsers(fetched.slice((page - 1) * limit, page * limit));
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to load ${role}s: ${error?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [role, page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lmsUsers.delete(deleteId);
      toast.success("User deleted");
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete user");
      console.log(error);
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Search search={search} setSearch={setSearch} title={`${role}s`} />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add{" "}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </div>
      </div>

      <UserTable
        role={role}
        loading={loading}
        setDeleteId={setDeleteId}
        setIsDeleteOpen={setIsDeleteOpen}
        setEditingUser={setEditingUser}
        setIsFormOpen={setIsFormOpen}
        users={users}
        setPageNum={setPage}
        pageNum={page}
        totalPages={totalPages}
      />

      <UserDialog
        editingUser={editingUser}
        role={role}
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={fetchUsers}
      />

      <CustomAlert
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleDelete}
        title="Delete User?"
        description="This will permanently delete this user from the system."
      />
    </div>
  );
}
