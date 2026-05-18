export const APP_LINKS = {
  celebriday: "https://apps.apple.com/us/app/celebriday/id6760971240",
  blitztap: "https://apps.apple.com/us/app/blitztap/id6759490849",
  signsnap: "https://apps.apple.com/us/app/signsnap/id6759199184",
  drift: "https://apps.apple.com/us/app/drift/id6758258891",
} as const;

export const MORE_APPS = [
  {
    name: "BlitzTap",
    emoji: "⚡",
    subtitle: "Test your tap speed",
    url: APP_LINKS.blitztap,
  },
  {
    name: "SignSnap",
    emoji: "✍️",
    subtitle: "Sign documents in seconds",
    url: APP_LINKS.signsnap,
  },
  {
    name: "Drift",
    emoji: "🌙",
    subtitle: "Sleep sounds and white noise",
    url: APP_LINKS.drift,
  },
] as const;
