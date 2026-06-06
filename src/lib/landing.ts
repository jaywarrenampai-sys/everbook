/**
 * Single source of truth for all Everbook site copy.
 * Everbook = a custom photobook company (upload photos → printed keepsake book).
 * Edit text here — never hardcode strings in components.
 */

export const brand = {
  name: "Everbook",
  tagline: "custom photo books",
  email: "hello@everbook.com",
};

export const announcements = [
  "✦ Free shipping on orders over $40",
  "✦ Over 12,000 five-star reviews",
  "✦ 30-day happiness guarantee",
];

export const nav = {
  links: [
    { label: "Make a book", href: "#product" },
    { label: "Why Everbook", href: "#advantages" },
    { label: "How it works", href: "#how" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ],
  cta: "Start my book",
};

export const hero = {
  eyebrow: "#1 rated in photo books",
  heading: "Your memories,\nbeautifully bound.",
  sub: "Turn your camera roll into a stunning hardcover photo book in minutes. Pick a layout, drop in your photos, and we'll print a keepsake you'll treasure for years.",
  ctaPrimary: "Start my book",
  ctaSecondary: "Read the reviews",
  rating: "4.9/5 from 12,000+ reviews",
};

export const marquee = [
  "Premium hardcover",
  "Lay-flat pages",
  "Fade-resistant inks",
  "Easy online editor",
  "Ready in minutes",
  "Made to last",
  "Free design help",
  "Ships worldwide",
];

export const advantages = {
  eyebrow: "Why Everbook",
  heading: "Books made to be kept",
  items: [
    {
      icon: "drop",
      title: "Effortless editor",
      body: "Drag, drop, done. Our smart layouts arrange your photos beautifully — no design skills needed.",
    },
    {
      icon: "leaf",
      title: "Gallery-grade printing",
      body: "Thick lay-flat pages, rich archival inks, and a linen hardcover built to survive every coffee table.",
    },
    {
      icon: "star",
      title: "Loved & trusted",
      body: "Backed by 12,000+ five-star reviews and a 30-day happiness guarantee on every book.",
    },
  ],
};

export const howItWorks = {
  eyebrow: "It's as easy as 1, 2, 3",
  heading: "From camera roll to keepsake",
  steps: [
    {
      n: "01",
      title: "Choose a template",
      body: "Start from a designer layout or a blank canvas — every template is fully customizable.",
    },
    {
      n: "02",
      title: "Upload your photos",
      body: "Add photos from your phone or computer. Autofill arranges them in seconds.",
    },
    {
      n: "03",
      title: "Customize & order",
      body: "Tweak pages, add captions, preview your book, and we'll print and ship it to your door.",
    },
  ],
};

export const spotlight = {
  eyebrow: "The Everbook difference",
  heading: "Beautiful quality for beautiful moments",
  body: "Every Everbook book is printed on heavyweight lay-flat paper with archival, fade-resistant inks and bound in a premium linen hardcover — so your story looks as good in twenty years as it does today.",
  stat1: { value: "200+", label: "designer layouts and templates" },
  stat2: { value: "100%", label: "happiness guarantee on every book" },
};

export const product = {
  eyebrow: "Spring sale — up to 70% off",
  heading: "Pick your book",
  sub: "Same premium hardcover. Three ways to start. Discounts apply automatically at checkout.",
  options: [
    {
      id: "single",
      name: "Single",
      note: "1 book · 24 pages",
      price: 32.99,
      compareAt: 65.98,
      save: "save 50%",
      accent: "#F3D7CB",
    },
    {
      id: "duo",
      name: "Duo",
      note: "2 books · 24 pages each",
      price: 52.79,
      compareAt: 131.96,
      save: "save 60%",
      accent: "#EDE4D6",
      featured: true,
    },
    {
      id: "trio",
      name: "Trio",
      note: "3 books · 24 pages each",
      price: 59.38,
      compareAt: 197.94,
      save: "save 70%",
      accent: "#E7D8C4",
    },
  ],
  cta: "Start designing",
};

export const testimonials = {
  eyebrow: "Loved by thousands",
  heading: "The reviews say it best",
  items: [
    {
      title: "Absolutely stunning!",
      body: "The print quality blew me away. The pages lay completely flat and the colors are so rich. A perfect anniversary gift.",
      name: "Maya R.",
      meta: "Verified buyer",
    },
    {
      title: "So easy to make",
      body: "I had our whole trip turned into a book in under fifteen minutes. The autofill did all the hard work for me.",
      name: "Priya S.",
      meta: "Verified buyer",
    },
    {
      title: "Worth every penny",
      body: "Ordered three for the grandparents and they cried. The hardcover feels genuinely premium — better than I expected.",
      name: "Elena K.",
      meta: "Verified buyer",
    },
  ],
};

export const faq = {
  eyebrow: "Good to know",
  heading: "Frequently asked questions",
  items: [
    {
      q: "How do I make a photo book?",
      a: "Pick a template, upload your photos, and our editor arranges them for you. Rearrange pages, add captions, preview your book, then order — the whole thing takes just a few minutes.",
    },
    {
      q: "How long does shipping take?",
      a: "Books are printed within 2–3 business days and delivered in 3–5 business days after that. Free shipping applies to orders over $40.",
    },
    {
      q: "Do you ship internationally?",
      a: "Yes — we ship worldwide. Delivery times and rates are calculated at checkout based on your destination.",
    },
    {
      q: "Can I customize the layouts?",
      a: "Absolutely. Every template is fully editable — swap layouts, resize photos, change backgrounds, and add text on any page.",
    },
    {
      q: "What sizes and page counts are available?",
      a: "Our hardcover starts at 24 pages in an 11.5\" × 8.5\" landscape format, and you can add extra pages anytime in the editor.",
    },
    {
      q: "What if my book arrives damaged?",
      a: "You're covered by our 30-day happiness guarantee. If anything's wrong with your book, contact us and we'll reprint or refund it.",
    },
  ],
};

export const guarantees = [
  {
    icon: "truck",
    title: "Fast, free shipping",
    body: "Free over $40 · printed in days",
  },
  {
    icon: "shield",
    title: "30-day guarantee",
    body: "Love your book or your money back",
  },
  {
    icon: "star",
    title: "12,000+ happy customers",
    body: "Rated 4.9/5 across the board",
  },
];

export const footer = {
  blurb: "Premium hardcover photo books, designed by you in minutes and printed to last a lifetime.",
  columns: [
    {
      title: "Make a book",
      links: [
        { label: "All templates", href: "#product" },
        { label: "Bestsellers", href: "#product" },
        { label: "Gift books", href: "#product" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Reviews", href: "#reviews" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "FAQ", href: "#faq" },
        { label: "Shipping", href: "#" },
        { label: "Returns", href: "#" },
      ],
    },
  ],
  socials: ["Instagram", "TikTok", "Facebook", "YouTube"],
  legal: ["Terms", "Privacy", "Refund Policy"],
};

export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}
