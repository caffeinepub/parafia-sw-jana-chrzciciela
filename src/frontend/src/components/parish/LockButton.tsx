import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Settings, Unlock } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveUserProfile,
} from "../../hooks/useQueries";
import { Link } from "../../router";

export function LockButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();

  const showProfileSetup = isAuthenticated && isFetched && userProfile === null;

  React.useEffect(() => {
    if (showProfileSetup) {
      setProfileModalOpen(true);
    }
  }, [showProfileSetup]);

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success("Wylogowano pomyślnie");
    } else {
      try {
        await login();
        setLoginOpen(false);
        toast.success("Zalogowano pomyślnie");
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error("Błąd logowania");
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: profileName.trim() });
      setProfileModalOpen(false);
      toast.success(`Witaj, ${profileName}!`);
    } catch {
      toast.error("Nie udało się zapisać profilu");
    }
  };

  return (
    <>
      {/* Lock button */}
      <button
        type="button"
        className="lock-btn"
        onClick={() => {
          if (isAuthenticated) {
            handleLogin();
          } else {
            setLoginOpen(true);
          }
        }}
        title={
          isAuthenticated
            ? `${userProfile?.name || "Zalogowany"} — kliknij aby wylogować`
            : "Zaloguj się"
        }
        aria-label={isAuthenticated ? "Wyloguj się" : "Zaloguj się"}
        data-ocid="auth.lock.button"
      >
        {isAuthenticated ? (
          <Unlock className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </button>

      {/* Admin link (shown for any authenticated user — access check happens in AdminPage) */}
      {isAuthenticated && (
        <Link
          to="/admin"
          className="fixed bottom-16 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full shadow-sm text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 font-sans"
          data-ocid="auth.admin.link"
        >
          <Settings className="w-3 h-3" />
          Admin
        </Link>
      )}

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm" data-ocid="auth.dialog">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Logowanie
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Zaloguj się przez Internet Identity, aby uzyskać dostęp do panelu
              administracyjnego.
            </p>

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full font-sans font-light"
              data-ocid="auth.login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Logowanie...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Zaloguj przez Internet Identity
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full font-sans font-light text-sm"
              onClick={() => setLoginOpen(false)}
              data-ocid="auth.cancel.button"
            >
              Anuluj
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Setup Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" data-ocid="profile.dialog">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Twój profil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground font-sans">
              Jak mamy się do Ciebie zwracać?
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="profile-name"
                className="font-sans font-light text-sm"
              >
                Imię lub nazwa
              </Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="np. ks. Jan Kowalski"
                className="font-sans"
                onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                data-ocid="profile.name.input"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={!profileName.trim() || saveProfile.isPending}
              className="w-full font-sans font-light"
              data-ocid="profile.save.submit_button"
            >
              {saveProfile.isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
