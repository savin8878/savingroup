// components/operator/launcher-copy.ts
//
// The Operator launcher's strings, per locale. Kept apart from
// operator-copy.ts on purpose: <OperatorRoot> (and so this module) is in the
// initial bundle of every page, while the panel's full copy table only
// downloads with the panel chunk on first intent.

import type { Locale } from "@/lib/i18n";

export interface LauncherCopy {
  /** Mono micro-label on the launcher; the panel's own "Operator" label is in operator-copy.ts. */
  launcherLabel: string;
  /** Short verb phrase next to it; hidden below ~420px. */
  launcherAction: string;
  /** Launcher state while the panel's code is still downloading. */
  launcherLoading: string;
  /** After the panel's code failed to load (a dropped connection): pressing again retries. */
  launcherRetry: string;
  /** Appended to the launcher's name when a reply finished while closed. */
  unread: string;
}

const LAUNCHER_COPY: Record<Locale, LauncherCopy> = {
  en: {
    launcherLabel: "Operator",
    launcherAction: "Map a process",
    launcherLoading: "Opening…",
    launcherRetry: "Couldn’t open. Retry",
    unread: "new reply",
  },
  es: {
    launcherLabel: "Operator",
    launcherAction: "Mapea un proceso",
    launcherLoading: "Abriendo…",
    launcherRetry: "No se pudo abrir. Reintentar",
    unread: "nueva respuesta",
  },
  fr: {
    launcherLabel: "Operator",
    launcherAction: "Cartographier un processus",
    launcherLoading: "Ouverture…",
    launcherRetry: "Ouverture impossible. Réessayer",
    unread: "nouvelle réponse",
  },
  de: {
    launcherLabel: "Operator",
    launcherAction: "Prozess abbilden",
    launcherLoading: "Wird geöffnet…",
    launcherRetry: "Öffnen fehlgeschlagen. Erneut versuchen",
    unread: "neue Antwort",
  },
  ar: {
    launcherLabel: "Operator",
    launcherAction: "ارسم خريطة عملية",
    launcherLoading: "جارٍ الفتح…",
    launcherRetry: "تعذّر الفتح. أعد المحاولة",
    unread: "رد جديد",
  },
  hi: {
    launcherLabel: "Operator",
    launcherAction: "प्रोसेस मैप करें",
    launcherLoading: "खुल रहा है…",
    launcherRetry: "खुल नहीं सका। फिर कोशिश करें",
    unread: "नया जवाब",
  },
  zh: {
    launcherLabel: "Operator",
    launcherAction: "梳理一个流程",
    launcherLoading: "正在打开…",
    launcherRetry: "无法打开，请重试",
    unread: "新回复",
  },
  gu: {
    launcherLabel: "Operator",
    launcherAction: "પ્રોસેસ મેપ કરો",
    launcherLoading: "ખુલી રહ્યું છે…",
    launcherRetry: "ખુલી શક્યું નહીં. ફરી પ્રયાસ કરો",
    unread: "નવો જવાબ",
  },
};

export function getLauncherCopy(locale: string): LauncherCopy {
  return LAUNCHER_COPY[locale as Locale] ?? LAUNCHER_COPY.en;
}
