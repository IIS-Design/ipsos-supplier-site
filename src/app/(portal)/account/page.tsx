import { requireUser } from "@/lib/auth/session";
import { AccountSettings } from "@/features/account/account-settings";

export default async function AccountPage() {
  const user = await requireUser();
  return <AccountSettings user={user} />;
}
