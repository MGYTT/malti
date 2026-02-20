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

export type ContentData = {
  stats:   ContentStats;
  status:  ContentStatus;
  profile: ContentProfile;
  links:   ContentLink[];
};
