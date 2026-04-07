import { x as useSiteSettings, y as useUpdateSiteSettings, r as reactExports, R as React, j as jsxRuntimeExports, B as Button, d as Save, L as Label, I as Input, T as Textarea, S as Switch, i as ue, h as Image } from "./index-D7IwDy7E.js";
import { u as useZycieImageUpload } from "./useZycieImageUpload-C-8nkg7m.js";
import { U as Upload } from "./upload-_LUTq9dM.js";
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
function QrImageField({
  value,
  onChange,
  label
}) {
  const ref = React.useRef(null);
  const { upload } = useZycieImageUpload();
  const [uploading, setUploading] = React.useState(false);
  const handleFile = async (file) => {
    setUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
    } catch {
      ue.error("Nie udało się wgrać kodu QR");
    } finally {
      setUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "relative w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden cursor-pointer text-left",
        onClick: () => {
          var _a;
          return (_a = ref.current) == null ? void 0 : _a.click();
        },
        children: [
          value ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: value,
              alt: "QR pogląd",
              className: "w-full h-full object-contain"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-6 h-6 text-muted-foreground/30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs text-muted-foreground/60 text-center px-2", children: "Kliknij, aby wgrać QR" })
          ] }),
          uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-background/70 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 animate-bounce text-primary" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: (e) => {
          var _a;
          const file = (_a = e.target.files) == null ? void 0 : _a[0];
          if (file) handleFile(file);
        }
      }
    )
  ] });
}
function AdminUstawieniaTab() {
  const { data: settings } = useSiteSettings();
  const update = useUpdateSiteSettings();
  const [contact, setContact] = reactExports.useState({
    address: "",
    phone: "",
    email: "",
    hours: "",
    bankAccount: "",
    facebook: "",
    youtube: "",
    twitter: "",
    cmentarzUrl: "",
    navLogoUrl: "",
    parishName: "",
    parishMotto: "",
    parishIconUrl: "",
    footerNavLinks: "[]",
    lightningAddress: "",
    lightningQrUrl: "",
    lightningDescription: "",
    lightningEnabled: false,
    usdcAddress: "",
    usdcQrUrl: "",
    usdcEnabled: false
  });
  const [lightningAddrInput, setLightningAddrInput] = React.useState("");
  const [lightningAddrConfirm, setLightningAddrConfirm] = React.useState("");
  const [usdcAddrInput, setUsdcAddrInput] = React.useState("");
  const [usdcAddrConfirm, setUsdcAddrConfirm] = React.useState("");
  const [aestheticMode, setAestheticMode] = reactExports.useState("jordan");
  const [footerNavItems, setFooterNavItems] = reactExports.useState([]);
  const [newFooterLink, setNewFooterLink] = reactExports.useState({ name: "", path: "" });
  React.useEffect(() => {
    if (settings) {
      try {
        const parsed = JSON.parse(settings.contactData || "{}");
        setContact({
          address: "",
          phone: "",
          email: "",
          hours: "",
          bankAccount: "",
          facebook: "",
          youtube: "",
          twitter: "",
          cmentarzUrl: "",
          navLogoUrl: "",
          parishName: "",
          parishMotto: "",
          parishIconUrl: "",
          footerNavLinks: "[]",
          lightningAddress: "",
          lightningQrUrl: "",
          lightningDescription: "",
          lightningEnabled: false,
          usdcAddress: "",
          usdcQrUrl: "",
          usdcEnabled: false,
          ...parsed
        });
        setLightningAddrInput(parsed.lightningAddress || "");
        setLightningAddrConfirm(parsed.lightningAddress || "");
        setUsdcAddrInput(parsed.usdcAddress || "");
        setUsdcAddrConfirm(parsed.usdcAddress || "");
        try {
          const navItems = JSON.parse(parsed.footerNavLinks || "[]");
          setFooterNavItems(navItems);
        } catch {
        }
      } catch {
      }
      setAestheticMode(settings.aestheticMode || "jordan");
    }
  }, [settings]);
  const handleSave = async () => {
    const base = settings || {
      navigation: JSON.stringify(DEFAULT_NAV),
      typography: "{}"
    };
    try {
      await update.mutateAsync({
        ...base,
        contactData: JSON.stringify({
          ...contact,
          footerNavLinks: JSON.stringify(footerNavItems)
        }),
        aestheticMode
      });
      ue.success("Ustawienia zapisane");
    } catch {
      ue.error("Błąd zapisu");
    }
  };
  const handleLogoUpload = (e, field) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setContact((p) => ({ ...p, [field]: reader.result }));
    reader.readAsDataURL(file);
  };
  const QUICK_NAV_LINKS = [
    { name: "Aktualności", path: "/aktualnosci" },
    { name: "Liturgia", path: "/liturgia" },
    { name: "Wspólnoty", path: "/wspolnoty" },
    { name: "Galeria", path: "/galeria" },
    { name: "Kancelaria", path: "/kancelaria" },
    { name: "Kontakt", path: "/kontakt" },
    { name: "Modlitwa", path: "/modlitwa" },
    { name: "Życie", path: "/zycie" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light", children: "Ustawienia" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSave,
          disabled: update.isPending,
          size: "sm",
          className: "font-sans font-light",
          "data-ocid": "admin.settings.save.submit_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
            update.isPending ? "Zapisywanie..." : "Zapisz"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Tryb estetyczny (domyślny)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["jordan", "pustynia", "ogien", "cisza", "noc"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setAestheticMode(m),
          className: `px-4 py-2 rounded-full font-sans text-sm capitalize transition-all ${aestheticMode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`,
          "data-ocid": `admin.settings.mode.${m}.button`,
          children: m
        },
        m
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Logo parafii (nawigacja)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Jeśli wgrasz logo, pojawi się obok nazwy parafii w górnym pasku nawigacji. Jeśli brak, wyświetla się sama nazwa tekstowa." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        contact.navLogoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: contact.navLogoUrl,
            alt: "Logo pogląd",
            className: "w-16 h-16 rounded-full object-cover border-2 border-border"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            className: "w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors",
            title: "Kliknij, aby wgrać logo",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-sans text-center leading-tight px-1", children: [
                "+",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "logo"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: (e) => handleLogoUpload(e, "navLogoUrl"),
                  "data-ocid": "admin.settings.navlogo.upload_button"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          contact.navLogoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors text-xs text-muted-foreground font-sans", children: [
              "Zmień logo",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: (e) => handleLogoUpload(e, "navLogoUrl"),
                  "data-ocid": "admin.settings.navlogo.change.upload_button"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setContact((p) => ({ ...p, navLogoUrl: "" })),
                className: "block text-xs text-destructive hover:underline font-sans",
                "data-ocid": "admin.settings.navlogo.delete_button",
                children: "Usuń logo"
              }
            )
          ] }),
          !contact.navLogoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors text-xs text-muted-foreground font-sans", children: [
            "Wgraj logo",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e) => handleLogoUpload(e, "navLogoUrl")
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Informacje w stopce (lewa kolumna)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Edytuj lewą kolumnę stopki – nazwa parafii, motto i mała ikona." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Nazwa parafii" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.parishName,
              onChange: (e) => setContact((p) => ({ ...p, parishName: e.target.value })),
              placeholder: "Parafia św. Jana Chrzciciela",
              className: "font-sans",
              "data-ocid": "admin.settings.parishname.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Motto / krótki opis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.parishMotto,
              onChange: (e) => setContact((p) => ({ ...p, parishMotto: e.target.value })),
              placeholder: "Strona parafialna",
              className: "font-sans",
              "data-ocid": "admin.settings.parishmotto.input"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Ikona / miniaturka parafii" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          contact.parishIconUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: contact.parishIconUrl,
              alt: "Ikona pogląd",
              className: "w-12 h-12 rounded-full object-cover border-2 border-border"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-sans", children: "+" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e) => handleLogoUpload(e, "parishIconUrl"),
                "data-ocid": "admin.settings.parishicon.upload_button"
              }
            )
          ] }),
          contact.parishIconUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors text-xs text-muted-foreground font-sans", children: [
              "Zmień ikonę",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: (e) => handleLogoUpload(e, "parishIconUrl")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setContact((p) => ({ ...p, parishIconUrl: "" })),
                className: "block text-xs text-destructive hover:underline font-sans",
                "data-ocid": "admin.settings.parishicon.delete_button",
                children: "Usuń ikonę"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Nawigacja w stopce (środkowa kolumna)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Ustaw niezależną listę linków wyświetlanych w środkowej kolumnie stopki." }),
      footerNavItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: footerNavItems.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40",
          "data-ocid": `admin.settings.footernav.item.${idx + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-sans text-foreground flex-1", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: item.path }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setFooterNavItems(
                  (prev) => prev.filter((_, i) => i !== idx)
                ),
                className: "text-xs text-destructive hover:underline font-sans shrink-0",
                "data-ocid": `admin.settings.footernav.delete_button.${idx + 1}`,
                children: "Usuń"
              }
            )
          ]
        },
        item.path
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: QUICK_NAV_LINKS.filter(
          (q) => !footerNavItems.find((f) => f.path === q.path)
        ).map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setFooterNavItems((prev) => [...prev, q]),
            className: "px-2.5 py-1 rounded-full text-xs font-sans bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border",
            "data-ocid": "admin.settings.footernav.quickadd.button",
            children: [
              "+ ",
              q.name
            ]
          },
          q.path
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light text-xs", children: "Własna nazwa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: newFooterLink.name,
                onChange: (e) => setNewFooterLink((p) => ({ ...p, name: e.target.value })),
                placeholder: "np. Rekolekcje",
                className: "font-sans text-sm",
                "data-ocid": "admin.settings.footernav.name.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light text-xs", children: "Cieżka" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: newFooterLink.path,
                onChange: (e) => setNewFooterLink((p) => ({ ...p, path: e.target.value })),
                placeholder: "/liturgia",
                className: "font-sans text-sm",
                "data-ocid": "admin.settings.footernav.path.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                if (!newFooterLink.name || !newFooterLink.path) return;
                setFooterNavItems((prev) => [...prev, newFooterLink]);
                setNewFooterLink({ name: "", path: "" });
              },
              className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-sans hover:bg-primary/90 transition-colors whitespace-nowrap",
              "data-ocid": "admin.settings.footernav.add.button",
              children: "Dodaj"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Dane kontaktowe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Adres" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: contact.address,
              onChange: (e) => setContact((p) => ({ ...p, address: e.target.value })),
              placeholder: "ul. Przykładowa 1, 00-000 Miasto",
              rows: 3,
              className: "font-sans resize-none",
              "data-ocid": "admin.settings.address.textarea"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Godziny kancelarii" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: contact.hours,
              onChange: (e) => setContact((p) => ({ ...p, hours: e.target.value })),
              placeholder: "Pn–Pt: 9:00–12:00",
              rows: 3,
              className: "font-sans resize-none",
              "data-ocid": "admin.settings.hours.textarea"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Telefon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.phone,
              onChange: (e) => setContact((p) => ({ ...p, phone: e.target.value })),
              placeholder: "+48 000 000 000",
              className: "font-sans",
              "data-ocid": "admin.settings.phone.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: contact.email,
              onChange: (e) => setContact((p) => ({ ...p, email: e.target.value })),
              placeholder: "parafia@example.pl",
              className: "font-sans",
              "data-ocid": "admin.settings.email.input"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Media społecznościowe i konto bankowe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Numer konta bankowego" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.bankAccount,
              onChange: (e) => setContact((p) => ({ ...p, bankAccount: e.target.value })),
              placeholder: "XX XXXX XXXX XXXX XXXX XXXX XXXX",
              className: "font-sans font-mono",
              "data-ocid": "admin.settings.bankaccount.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Facebook (URL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.facebook,
              onChange: (e) => setContact((p) => ({ ...p, facebook: e.target.value })),
              placeholder: "https://facebook.com/...",
              className: "font-sans",
              "data-ocid": "admin.settings.facebook.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "YouTube (URL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.youtube,
              onChange: (e) => setContact((p) => ({ ...p, youtube: e.target.value })),
              placeholder: "https://youtube.com/...",
              className: "font-sans",
              "data-ocid": "admin.settings.youtube.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "X / Twitter (URL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.twitter,
              onChange: (e) => setContact((p) => ({ ...p, twitter: e.target.value })),
              placeholder: "https://x.com/...",
              className: "font-sans",
              "data-ocid": "admin.settings.twitter.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Strona Cmentarza (URL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.cmentarzUrl,
              onChange: (e) => setContact((p) => ({ ...p, cmentarzUrl: e.target.value })),
              placeholder: "https://cmentarz.pl/...",
              className: "font-sans",
              "data-ocid": "admin.settings.cmentarz.input"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "Bitcoin Lightning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: contact.lightningEnabled,
            onCheckedChange: (v) => setContact((p) => ({ ...p, lightningEnabled: v })),
            "data-ocid": "admin.settings.lightning.switch"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Włącz metodę Bitcoin Lightning" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Lightning Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: lightningAddrInput,
              onChange: (e) => {
                setLightningAddrInput(e.target.value);
                if (!lightningAddrConfirm || e.target.value === lightningAddrConfirm) {
                  setContact((p) => ({
                    ...p,
                    lightningAddress: e.target.value
                  }));
                }
              },
              placeholder: "parafia@wallet.com lub lnbc...",
              className: "font-sans font-mono",
              "data-ocid": "admin.settings.lightning.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Powtórz Lightning Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: lightningAddrConfirm,
              onChange: (e) => {
                setLightningAddrConfirm(e.target.value);
                if (e.target.value === lightningAddrInput) {
                  setContact((p) => ({
                    ...p,
                    lightningAddress: lightningAddrInput
                  }));
                }
              },
              placeholder: "Powtórz adres",
              className: "font-sans font-mono",
              "data-ocid": "admin.settings.lightning_confirm.input"
            }
          )
        ] }),
        lightningAddrInput && lightningAddrConfirm && lightningAddrInput !== lightningAddrConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive sm:col-span-2", children: "Adresy nie są zgodne" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Opis (opcjonalny)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: contact.lightningDescription,
              onChange: (e) => setContact((p) => ({
                ...p,
                lightningDescription: e.target.value
              })),
              placeholder: "Możesz wesprzepał parafię przez sieć Bitcoin Lightning.",
              className: "font-sans",
              "data-ocid": "admin.settings.lightning_desc.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          QrImageField,
          {
            label: "Kod QR Bitcoin Lightning",
            value: contact.lightningQrUrl,
            onChange: (url) => setContact((p) => ({ ...p, lightningQrUrl: url }))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-light text-foreground/70", children: "USDC (Arbitrum)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: contact.usdcEnabled,
            onCheckedChange: (v) => setContact((p) => ({ ...p, usdcEnabled: v })),
            "data-ocid": "admin.settings.usdc.switch"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Włącz metodę USDC (Arbitrum)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Adres portfela USDC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: usdcAddrInput,
              onChange: (e) => {
                setUsdcAddrInput(e.target.value);
                if (!usdcAddrConfirm || e.target.value === usdcAddrConfirm) {
                  setContact((p) => ({ ...p, usdcAddress: e.target.value }));
                }
              },
              placeholder: "0x...",
              className: "font-sans font-mono",
              "data-ocid": "admin.settings.usdc.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Powtórz adres portfela USDC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: usdcAddrConfirm,
              onChange: (e) => {
                setUsdcAddrConfirm(e.target.value);
                if (e.target.value === usdcAddrInput) {
                  setContact((p) => ({ ...p, usdcAddress: usdcAddrInput }));
                }
              },
              placeholder: "Powtórz adres",
              className: "font-sans font-mono",
              "data-ocid": "admin.settings.usdc_confirm.input"
            }
          )
        ] }),
        usdcAddrInput && usdcAddrConfirm && usdcAddrInput !== usdcAddrConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive sm:col-span-2", children: "Adresy nie są zgodne" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          QrImageField,
          {
            label: "Kod QR USDC (Arbitrum)",
            value: contact.usdcQrUrl,
            onChange: (url) => setContact((p) => ({ ...p, usdcQrUrl: url }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-amber-600 font-medium sm:col-span-2", children: "Wysyłaj tylko USDC przez sieć Arbitrum." })
      ] })
    ] })
  ] });
}
export {
  AdminUstawieniaTab
};
