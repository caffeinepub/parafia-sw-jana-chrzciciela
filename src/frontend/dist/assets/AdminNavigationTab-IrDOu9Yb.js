import { x as useSiteSettings, y as useUpdateSiteSettings, r as reactExports, R as React, j as jsxRuntimeExports, B as Button, d as Save, I as Input, S as Switch, z as Eye, A as EyeOff, i as ue } from "./index-CJw8i4Cr.js";
const DEFAULT_NAV = [
  { name: "Aktualności", path: "/aktualnosci", visible: true },
  { name: "Liturgia", path: "/liturgia", visible: true },
  { name: "Wspólnoty", path: "/wspolnoty", visible: true },
  { name: "Galeria", path: "/galeria", visible: true },
  { name: "Kancelaria", path: "/kancelaria", visible: true },
  { name: "Kontakt", path: "/kontakt", visible: true },
  { name: "Modlitwa", path: "/modlitwa", visible: true },
  { name: "Życie", path: "/zycie", visible: true },
  { name: "Sklep", path: "/sklep", visible: true }
];
function AdminNavigationTab() {
  const { data: settings } = useSiteSettings();
  const update = useUpdateSiteSettings();
  const [items, setItems] = reactExports.useState(DEFAULT_NAV);
  React.useEffect(() => {
    if (settings == null ? void 0 : settings.navigation) {
      try {
        const saved = JSON.parse(settings.navigation);
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
  const updateName = (i, name) => {
    setItems(
      (prev) => prev.map((item, idx) => idx === i ? { ...item, name } : item)
    );
  };
  const toggleVisible = (i) => {
    setItems(
      (prev) => prev.map(
        (item, idx) => idx === i ? { ...item, visible: !item.visible } : item
      )
    );
  };
  const handleSave = async () => {
    const current = settings || {
      contactData: "{}",
      navigation: "",
      aestheticMode: "jordan",
      typography: "{}"
    };
    try {
      await update.mutateAsync({
        ...current,
        navigation: JSON.stringify(items)
      });
      ue.success("Nawigacja zaktualizowana");
    } catch {
      ue.error("Błąd zapisu");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light", children: "Nawigacja" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSave,
          disabled: update.isPending,
          size: "sm",
          className: "font-sans font-light",
          "data-ocid": "admin.nav.save.submit_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
            update.isPending ? "Zapisywanie..." : "Zapisz"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex items-center gap-3 bg-card rounded-lg p-3 border border-border ${!item.visible ? "opacity-50" : ""}`,
        "data-ocid": `admin.nav.item.${i + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: item.name,
                onChange: (e) => updateName(i, e.target.value),
                className: "font-sans font-light text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0",
                "data-ocid": `admin.nav.name.input.${i + 1}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-muted-foreground", children: item.path })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: item.visible,
                onCheckedChange: () => toggleVisible(i),
                "data-ocid": `admin.nav.visible.switch.${i + 1}`
              }
            ),
            item.visible ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4 text-muted-foreground" })
          ] })
        ]
      },
      item.path
    )) })
  ] });
}
export {
  AdminNavigationTab
};
