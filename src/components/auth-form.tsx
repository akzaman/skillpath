import { useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn, socialSignInEnabled } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.18v2.96h5.27c-.23 1.5-1.78 4.4-5.27 4.4-3.18 0-5.78-2.63-5.78-5.87s2.6-5.87 5.78-5.87c1.81 0 3.03.77 3.73 1.44l2.54-2.45C16.72 4.07 14.66 3.2 12.17 3.2 6.99 3.2 2.8 7.4 2.8 12.59s4.19 9.39 9.37 9.39c5.41 0 8.98-3.8 8.98-9.16 0-.62-.07-1.08-.16-1.72z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.7 10.3 21.4 2.6h-1.9l-5.7 6.6L9.2 2.6H2.6l7.1 10.3L2.6 21.4h1.9l6.2-7.2 5 7.2h6.6l-7.6-11.1zm-2.2 2.5-.7-1-5.7-8h2.5l4.6 6.6.7 1 6 8.5h-2.5l-4.9-7.1z"
      />
    </svg>
  );
}

export function AuthForm({ callbackURL = "/" }: { callbackURL?: string }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Member",
        });
        if (signUpError) throw new Error(signUpError.message ?? "Could not create account");
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) throw new Error(signInError.message ?? "Could not sign in");
      }
      await authClient.getSession();
      window.location.assign(callbackURL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        {mode === "signin" ? t("auth.loginTitle") : t("auth.signupTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "signin" ? t("auth.loginLede") : t("auth.signupLede")}
      </p>

      {authEnabled && socialSignInEnabled() ? (
        <>
          <div className="mt-8 flex flex-col gap-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="outline"
                onClick={() =>
                  void signIn(provider.providerId, {
                    callbackURL,
                    errorCallbackURL: "/login",
                  })
                }
              >
                {provider.providerId === "grok-google" ? <GoogleMark /> : <XMark />}
                {t("auth.continueWith", { label: provider.label })}
              </Button>
            ))}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs tracking-wide text-subtle uppercase">
            <span className="h-px flex-1 bg-line" />
            {t("auth.orEmail")}
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : !authEnabled ? (
        <p className="mt-8 text-sm text-muted">{t("auth.disabled")}</p>
      ) : (
        <div className="mt-8" />
      )}

      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        {mode === "signup" ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("auth.namePh")}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("auth.emailPh")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("auth.passwordPh")}
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={pending || !authEnabled}>
          {pending ? t("auth.wait") : mode === "signin" ? t("auth.submitLogin") : t("auth.submitSignup")}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {mode === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
        <button
          type="button"
          className="font-bold text-primary hover:underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
        >
          {mode === "signin" ? t("auth.submitSignup") : t("auth.submitLogin")}
        </button>
      </p>
    </div>
  );
}
