// src/types/content.ts

export type ContentStats = {
  subscribers: { value: number; display: string; suffix: string };
  views:       { value: number; display: string; suffix: string };
  followers:   { value: number; display: string; suffix: string };
};

export type ContentStatus = {
  available:  boolean;
  text:       string;
  streamInfo: string;
};

export type ContentProfile = {
  name:      string;
  tagline:   string;
  preferred: string;
};

export type ContentLink = {
  id:      string;
  label:   string;
  sub:     string;
  url:     string;
  emoji:   string;
  color:   string;
  visible: boolean;
};

// ── NOWY TYP ──────────────────────────────────────────────
export type NotificationVariant =
  | "info" | "stream" | "alert" | "success" | "promo" | "top-donate"; // ← dodane

export type ContentNotification = {
  id:        string;
  variant:   NotificationVariant;
  emoji:     string;
  title:     string;
  message:   string;
  url?:      string;       // opcjonalny link (np. do streamu)
  urlLabel?: string;       // etykieta przycisku linku
  visible:   boolean;
  dismissible: boolean;    // czy użytkownik może zamknąć
  expiresAt?:  string;     // ISO date — auto-ukrywa się po czasie
};

export type ContentData = {
  stats:         ContentStats;
  status:        ContentStatus;
  profile:       ContentProfile;
  links:         ContentLink[];
  notifications: ContentNotification[];   // ← NOWE
};

