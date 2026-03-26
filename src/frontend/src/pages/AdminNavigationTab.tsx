import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Save } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSiteSettings } from "../hooks/useQueries";

const DEFAULT_NAV = [
  { name: "Aktualności", path: "/aktualnosci", visible: true },
  { name: "Liturgia", path: "/liturgia", visible: true },
  { name: "Wspólnoty", path: "/wspolnoty", visible: true },
  { name: "Galeria", path: "/galeria", visible: true },
  { name: "Kancelaria", path: "/kancelaria", visible: true },
  { name: "Kontakt", path: "/kontakt", visible: true },
  { name: "Modlitwa", path: "/modlitwa", visible: true },
  { name: "Życie", path: "/zycie", visible: true },
  { name: "Sklep", path: "/sklep", visible: true },
];

export function AdminNavigationTab() {
  const { data: settings } = useSiteSettings();
  const update = useUpdateSiteSettings();

  const [items, setItems] = useState(DEFAULT_NAV);

  React.useEffect(() => {
    if (settings?.navigation) {
      try {
        const saved = JSON.parse(settings.navigation) as {
          name: string;
          path: string;
          visible: boolean;
        }[];
        const merged = [...saved];
        for (const def of DEFAULT_NAV) {
          if (!merged.find((s) => s.path === def.path)) {
            merged.push(def);
          }
        }
        setItems(merged);
      } catch {
        setItems(DEFAULT_NAV);
      }
    } else {
      setItems(DEFAULT_NAV);
    }
  }, [settings]);

  const updateName = (i: number, name: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, name } : item)),
    );
  };

  const toggleVisible = (i: number) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, visible: !item.visible } : item,
      ),
    );
  };

  const handleSave = async () => {
    const current = settings || {
      contactData: "{}",
      navigation: "",
      aestheticMode: "jordan",
      typography: "{}",
    };
    try {
      await update.mutateAsync({
        ...current,
        navigation: JSON.stringify(items),
      });
      toast.success("Nawigacja zaktualizowana");
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light">Nawigacja</h2>
        <Button
          onClick={handleSave}
          disabled={update.isPending}
          size="sm"
          className="font-sans font-light"
          data-ocid="admin.nav.save.submit_button"
        >
          <Save className="w-4 h-4 mr-2" />
          {update.isPending ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.path}
            className={`flex items-center gap-3 bg-card rounded-lg p-3 border border-border ${!item.visible ? "opacity-50" : ""}`}
            data-ocid={`admin.nav.item.${i + 1}`}
          >
            <div className="flex-1">
              <Input
                value={item.name}
                onChange={(e) => updateName(i, e.target.value)}
                className="font-sans font-light text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                data-ocid={`admin.nav.name.input.${i + 1}`}
              />
              <p className="font-sans text-xs text-muted-foreground">
                {item.path}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={item.visible}
                onCheckedChange={() => toggleVisible(i)}
                data-ocid={`admin.nav.visible.switch.${i + 1}`}
              />
              {item.visible ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
