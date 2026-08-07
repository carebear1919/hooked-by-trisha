import { Suspense } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import FlashToast from "@/components/admin/FlashToast";
import InviteUserButton from "@/components/admin/InviteUserButton";
import { getPayloadClient } from "@/lib/payload";
import { createUser } from "./actions";

export default async function AdminUsersPage() {
  const payload = await getPayloadClient();
  const { docs: users } = await payload.find({ collection: "users", sort: "name", limit: 100 });

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar title="Users" actions={<InviteUserButton createAction={createUser} />} />
      <div className="p-6 md:p-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/30">
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Name
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Email
                </th>
                <th className="py-5 px-6 font-body text-outline uppercase tracking-wider text-[11px]">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 px-6 text-center font-body text-on-surface-variant">
                    No users yet.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-4 px-6 font-headline text-[16px] text-on-surface">
                    {user.name ?? "—"}
                  </td>
                  <td className="py-4 px-6 font-body text-on-surface-variant">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-container/10 text-primary capitalize">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
