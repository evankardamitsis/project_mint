import { AdminUsersTable, type AdminUserRow } from "@/components/admin/admin-users-table";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/roles";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin/users] profiles", error.message);
  }

  const users: AdminUserRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string | null,
    full_name: row.full_name as string | null,
    role: row.role as UserRole,
    created_at: row.created_at as string,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Invite platform admins and manage roles. Only the owner account can change admin access."
      />
      <AdminUsersTable users={users} />
    </div>
  );
}
