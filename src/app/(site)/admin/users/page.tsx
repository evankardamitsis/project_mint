import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Search profiles, adjust roles, and manage seller verification states."
      />
      <PlaceholderTable
        columns={["User", "Email", "Role", "Joined", "Actions"]}
        emptyLabel="User directory not connected — hook this table to `profiles` when admin search ships."
      />
    </div>
  );
}
