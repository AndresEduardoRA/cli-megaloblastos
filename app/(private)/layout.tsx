import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getProfile } from "@/services/profiles";
import PrivateLayoutClient from "./PrivateLayoutClient";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const profile = await getProfile(user.id);

  if (!profile || profile.is_blocked) {
    redirect("/");
  }

  return (
    <PrivateLayoutClient
      user={user}
      profile={profile}
    >
      {children}
    </PrivateLayoutClient>
  );
}