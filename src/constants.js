export const STAGES = [
  { code: "01", label: "Brief & découverte" },
  { code: "02", label: "Design & maquettes" },
  { code: "03", label: "Développement" },
  { code: "04", label: "Contenu & intégration" },
  { code: "05", label: "Tests & retours" },
  { code: "06", label: "Mise en ligne" },
];

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');`;

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export const fmtAmount = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
