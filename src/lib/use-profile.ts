import { useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile, type Profile } from "@/lib/roles";

export function useProfile(): {
  user: ReturnType<typeof useCurrentUserState>["user"];
  isPending: boolean;
  profile: Profile | null;
  error: Error | null;
} {
  const { user, isPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
    retry: 1,
  });
  return {
    user,
    isPending: isPending || Boolean(user && query.isPending),
    profile: query.data ?? null,
    error: query.error instanceof Error ? query.error : null,
  };
}
