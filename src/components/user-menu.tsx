import { Link } from "@tanstack/react-router";
import { Bookmark, GraduationCap, LayoutDashboard, LogOut, Shield, UserRound } from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { canAdmin, canTeach } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";
import { initialsFromName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthSlot({
  signInTo = "/login",
  onDark = false,
}: {
  signInTo?: string;
  onDark?: boolean;
}) {
  const { user, isPending, profile } = useProfile();
  if (isPending) {
    return <Skeleton className="size-9 rounded-full bg-on-header/20" />;
  }
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          className={
            onDark
              ? "border-on-header/40 bg-transparent text-on-header hover:bg-on-header/10"
              : undefined
          }
        >
          <Link to={signInTo}>Log in</Link>
        </Button>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to={signInTo} search={{ next: "/" }}>
            Sign up
          </Link>
        </Button>
      </div>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "Account";
  const initials = initialsFromName(label);
  const role = profile?.role ?? "student";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-9 place-items-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-fg ring-2 ring-on-header/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label="Account menu"
        >
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="size-full object-cover" />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-fg">{label}</span>
            <span className="text-xs font-normal text-muted capitalize">{role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="size-4 text-muted" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/progress">
            <LayoutDashboard className="size-4 text-muted" />
            Progress
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/library">
            <UserRound className="size-4 text-muted" />
            My learning
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/library" search={{ tab: "saved" }}>
            <Bookmark className="size-4 text-muted" />
            Wishlist
          </Link>
        </DropdownMenuItem>
        {canTeach(role) ? (
          <DropdownMenuItem asChild>
            <Link to="/teach">
              <GraduationCap className="size-4 text-muted" />
              Teacher studio
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/teach">
              <GraduationCap className="size-4 text-muted" />
              Become a teacher
            </Link>
          </DropdownMenuItem>
        )}
        {canAdmin(role) ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <Shield className="size-4 text-muted" />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="size-4 text-muted" />
            Switch role
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut("/")}>
          <LogOut className="size-4 text-muted" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
