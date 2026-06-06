"use client";

import { useLocale, Locale } from "./locale";

/** Shape shared by both language dictionaries. */
export interface LandingDict {
  currency: "usd" | "thb";
  brand: { name: string; tagline: string; email: string };
  announcements: string[];
  nav: { links: { label: string; href: string }[]; cta: string };
  hero: {
    eyebrow: string; heading: string; sub: string;
    ctaPrimary: string; ctaSecondary: string; rating: string;
  };
  marquee: string[];
  advantages: { eyebrow: string; heading: string; items: { icon: string; title: string; body: string }[] };
  howItWorks: { eyebrow: string; heading: string; steps: { n: string; title: string; body: string }[] };
  spotlight: {
    eyebrow: string; heading: string; body: string;
    stat1: { value: string; label: string }; stat2: { value: string; label: string };
  };
  product: {
    eyebrow: string; heading: string; sub: string; cta: string;
    options: { id: string; name: string; note: string; price: number; compareAt: number; save: string; accent: string; featured?: boolean }[];
  };
  testimonials: { eyebrow: string; heading: string; items: { title: string; body: string; name: string; meta: string }[] };
  faq: { eyebrow: string; heading: string; items: { q: string; a: string }[] };
  guarantees: { icon: string; title: string; body: string }[];
  footer: {
    blurb: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    socials: string[]; legal: string[];
  };
}

// ─── ENGLISH ──────────────────────────────────────────────────────────────────
const EN: LandingDict = {
  currency: "usd",
  brand: { name: "Everbook", tagline: "custom photo books", email: "hello@everbook.com" },
  announcements: [
    "✦ Free shipping on orders over ฿1,500",
    "✦ Over 12,000 five-star reviews",
    "✦ 30-day happiness guarantee",
  ],
  nav: {
    links: [
      { label: "Make a book", href: "#product" },
      { label: "Why Everbook", href: "#advantages" },
      { label: "How it works", href: "#how" },
      { label: "Reviews", href: "#reviews" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: "Start my book",
  },
  hero: {
    eyebrow: "#1 rated in photo books",
    heading: "Your memories,\nbeautifully bound.",
    sub: "Turn your camera roll into a stunning hardcover photo book in minutes. Pick a layout, drop in your photos, and we'll print a keepsake you'll treasure for years.",
    ctaPrimary: "Start my book",
    ctaSecondary: "Read the reviews",
    rating: "4.9/5 from 12,000+ reviews",
  },
  marquee: ["Premium hardcover", "Lay-flat pages", "Fade-resistant inks", "Easy online editor", "Ready in minutes", "Made to last", "Free design help", "Ships nationwide"],
  advantages: {
    eyebrow: "Why Everbook",
    heading: "Books made to be kept",
    items: [
      { icon: "drop", title: "Effortless editor", body: "Drag, drop, done. Our smart layouts arrange your photos beautifully — no design skills needed." },
      { icon: "leaf", title: "Gallery-grade printing", body: "Thick lay-flat pages, rich archival inks, and a linen hardcover built to last." },
      { icon: "star", title: "Loved & trusted", body: "Backed by 12,000+ five-star reviews and a 30-day happiness guarantee on every book." },
    ],
  },
  howItWorks: {
    eyebrow: "It's as easy as 1, 2, 3",
    heading: "From camera roll to keepsake",
    steps: [
      { n: "01", title: "Choose a template", body: "Start from a designer layout or a blank canvas — every template is fully customizable." },
      { n: "02", title: "Upload your photos", body: "Add photos from your phone or computer. Autofill arranges them in seconds." },
      { n: "03", title: "Customize & order", body: "Tweak pages, add captions, preview your book, and we'll print and ship it to your door." },
    ],
  },
  spotlight: {
    eyebrow: "The Everbook difference",
    heading: "Beautiful quality for beautiful moments",
    body: "Every Everbook book is printed on heavyweight lay-flat paper with archival, fade-resistant inks and bound in a premium hardcover — so your story looks as good in twenty years as it does today.",
    stat1: { value: "200+", label: "designer layouts and templates" },
    stat2: { value: "100%", label: "happiness guarantee on every book" },
  },
  product: {
    eyebrow: "Launch sale — up to 70% off",
    heading: "Pick your book",
    sub: "Same premium hardcover. Three ways to start. Discounts apply automatically at checkout.",
    cta: "Start designing",
    options: [
      { id: "single", name: "Single", note: "1 book · 24 pages", price: 690, compareAt: 1380, save: "save 50%", accent: "#F3D7CB" },
      { id: "duo", name: "Duo", note: "2 books · 24 pages each", price: 1190, compareAt: 2760, save: "save 57%", accent: "#EDE4D6", featured: true },
      { id: "trio", name: "Trio", note: "3 books · 24 pages each", price: 1590, compareAt: 4140, save: "save 62%", accent: "#E7D8C4" },
    ],
  },
  testimonials: {
    eyebrow: "Loved by thousands",
    heading: "The reviews say it best",
    items: [
      { title: "Absolutely stunning!", body: "The print quality blew me away. The pages lay completely flat and the colors are so rich. A perfect anniversary gift.", name: "Maya R.", meta: "Verified buyer" },
      { title: "So easy to make", body: "I had our whole trip turned into a book in under fifteen minutes. The autofill did all the hard work for me.", name: "Priya S.", meta: "Verified buyer" },
      { title: "Worth every penny", body: "Ordered three for the grandparents and they cried. The hardcover feels genuinely premium.", name: "Elena K.", meta: "Verified buyer" },
    ],
  },
  faq: {
    eyebrow: "Good to know",
    heading: "Frequently asked questions",
    items: [
      { q: "How do I make a photo book?", a: "Pick a template, upload your photos, and our editor arranges them for you. Rearrange pages, add captions, preview your book, then order — it takes just a few minutes." },
      { q: "How long does shipping take?", a: "Books are printed within 2–3 business days and delivered in 3–5 business days after that. Free shipping on orders over ฿1,500." },
      { q: "Do you deliver nationwide?", a: "Yes — we deliver across Thailand. Delivery times and rates are calculated at checkout based on your address." },
      { q: "Can I customize the layouts?", a: "Absolutely. Every template is fully editable — swap layouts, resize photos, change backgrounds, and add text on any page." },
      { q: "What sizes and page counts are available?", a: "Our hardcover starts at 24 pages, and you can add extra pages anytime in the editor." },
      { q: "What if my book arrives damaged?", a: "You're covered by our 30-day happiness guarantee. If anything's wrong, contact us and we'll reprint or refund it." },
    ],
  },
  guarantees: [
    { icon: "truck", title: "Fast, free shipping", body: "Free over ฿1,500 · printed in days" },
    { icon: "shield", title: "30-day guarantee", body: "Love your book or your money back" },
    { icon: "star", title: "12,000+ happy customers", body: "Rated 4.9/5 across the board" },
  ],
  footer: {
    blurb: "Premium hardcover photo books, designed by you in minutes and printed to last a lifetime.",
    columns: [
      { title: "Make a book", links: [{ label: "All templates", href: "#product" }, { label: "Bestsellers", href: "#product" }, { label: "Gift books", href: "#product" }] },
      { title: "Company", links: [{ label: "About", href: "#" }, { label: "Reviews", href: "#reviews" }, { label: "Contact", href: "#" }] },
      { title: "Help", links: [{ label: "FAQ", href: "#faq" }, { label: "Shipping", href: "#" }, { label: "Returns", href: "#" }] },
    ],
    socials: ["Instagram", "TikTok", "Facebook", "YouTube"],
    legal: ["Terms", "Privacy", "Refund Policy"],
  },
};

// ─── THAI (default) ─────────────────────────────────────────────────────────
const TH: LandingDict = {
  currency: "thb",
  brand: { name: "Everbook", tagline: "หนังสือภาพส่วนตัว", email: "hello@everbook.com" },
  announcements: [
    "✦ ส่งฟรีเมื่อสั่งซื้อครบ ฿1,500",
    "✦ รีวิว 5 ดาวกว่า 12,000 รายการ",
    "✦ รับประกันความพึงพอใจ 30 วัน",
  ],
  nav: {
    links: [
      { label: "ทำหนังสือ", href: "#product" },
      { label: "ทำไมต้อง Everbook", href: "#advantages" },
      { label: "วิธีใช้งาน", href: "#how" },
      { label: "รีวิว", href: "#reviews" },
      { label: "คำถามที่พบบ่อย", href: "#faq" },
    ],
    cta: "เริ่มทำหนังสือ",
  },
  hero: {
    eyebrow: "อันดับ 1 ด้านหนังสือภาพ",
    heading: "ความทรงจำของคุณ\nในเล่มที่งดงาม",
    sub: "เปลี่ยนรูปในมือถือให้เป็นหนังสือภาพปกแข็งสุดสวยภายในไม่กี่นาที เลือกเลย์เอาต์ วางรูป แล้วเราจะพิมพ์เป็นของที่ระลึกที่คุณเก็บไว้ได้ตลอดไป",
    ctaPrimary: "เริ่มทำหนังสือ",
    ctaSecondary: "อ่านรีวิว",
    rating: "4.9/5 จากรีวิวกว่า 12,000 รายการ",
  },
  marquee: ["ปกแข็งพรีเมียม", "หน้ากางราบ", "หมึกไม่ซีดจาง", "เครื่องมือใช้ง่าย", "เสร็จในไม่กี่นาที", "ทนทานยาวนาน", "ช่วยออกแบบฟรี", "ส่งทั่วประเทศ"],
  advantages: {
    eyebrow: "ทำไมต้อง Everbook",
    heading: "หนังสือที่สร้างมาเพื่อเก็บรักษา",
    items: [
      { icon: "drop", title: "แก้ไขง่ายดาย", body: "ลาก วาง เสร็จ เลย์เอาต์อัจฉริยะจัดวางรูปให้สวยงามโดยไม่ต้องมีพื้นฐานการออกแบบ" },
      { icon: "leaf", title: "งานพิมพ์คุณภาพแกลเลอรี", body: "หน้ากระดาษหนากางราบ หมึกคุณภาพสูง และปกแข็งที่ทนทานยาวนาน" },
      { icon: "star", title: "ได้รับความไว้วางใจ", body: "การันตีด้วยรีวิว 5 ดาวกว่า 12,000 รายการ พร้อมรับประกันความพึงพอใจ 30 วันทุกเล่ม" },
    ],
  },
  howItWorks: {
    eyebrow: "ง่ายเพียง 1 2 3",
    heading: "จากรูปในมือถือสู่หนังสือที่ระลึก",
    steps: [
      { n: "01", title: "เลือกเทมเพลต", body: "เริ่มจากเลย์เอาต์สำเร็จรูปหรือหน้าว่าง ทุกเทมเพลตปรับแต่งได้เต็มที่" },
      { n: "02", title: "อัปโหลดรูปภาพ", body: "เพิ่มรูปจากมือถือหรือคอมพิวเตอร์ ระบบเติมรูปอัตโนมัติจัดให้ในไม่กี่วินาที" },
      { n: "03", title: "ปรับแต่งและสั่งซื้อ", body: "ปรับหน้า เพิ่มข้อความ ดูตัวอย่าง แล้วเราจะพิมพ์และจัดส่งถึงบ้านคุณ" },
    ],
  },
  spotlight: {
    eyebrow: "ความแตกต่างของ Everbook",
    heading: "คุณภาพงดงามสำหรับช่วงเวลางดงาม",
    body: "หนังสือ Everbook ทุกเล่มพิมพ์บนกระดาษหนากางราบด้วยหมึกคุณภาพสูงที่ไม่ซีดจาง เข้าเล่มปกแข็งพรีเมียม เพื่อให้เรื่องราวของคุณสวยงามเหมือนวันแรกแม้ผ่านไปยี่สิบปี",
    stat1: { value: "200+", label: "เลย์เอาต์และเทมเพลตให้เลือก" },
    stat2: { value: "100%", label: "รับประกันความพึงพอใจทุกเล่ม" },
  },
  product: {
    eyebrow: "โปรเปิดตัว ลดสูงสุด 70%",
    heading: "เลือกหนังสือของคุณ",
    sub: "ปกแข็งพรีเมียมเหมือนกันทุกแบบ เริ่มได้ 3 รูปแบบ ส่วนลดจะคำนวณอัตโนมัติตอนชำระเงิน",
    cta: "เริ่มออกแบบ",
    options: [
      { id: "single", name: "เดี่ยว", note: "1 เล่ม · 24 หน้า", price: 690, compareAt: 1380, save: "ลด 50%", accent: "#F3D7CB" },
      { id: "duo", name: "คู่", note: "2 เล่ม · เล่มละ 24 หน้า", price: 1190, compareAt: 2760, save: "ลด 57%", accent: "#EDE4D6", featured: true },
      { id: "trio", name: "สามเล่ม", note: "3 เล่ม · เล่มละ 24 หน้า", price: 1590, compareAt: 4140, save: "ลด 62%", accent: "#E7D8C4" },
    ],
  },
  testimonials: {
    eyebrow: "ลูกค้าหลายพันคนหลงรัก",
    heading: "ให้รีวิวเป็นผู้เล่าเรื่อง",
    items: [
      { title: "สวยเกินคาด!", body: "คุณภาพงานพิมพ์เกินคาดมาก หน้ากางราบสนิทและสีสันสดสวย เป็นของขวัญครบรอบที่สมบูรณ์แบบ", name: "มายา", meta: "ผู้ซื้อที่ยืนยันแล้ว" },
      { title: "ทำง่ายมาก", body: "เปลี่ยนทริปทั้งทริปเป็นหนังสือได้ในไม่ถึงสิบห้านาที ระบบเติมรูปอัตโนมัติช่วยได้เยอะมาก", name: "พิยะ", meta: "ผู้ซื้อที่ยืนยันแล้ว" },
      { title: "คุ้มทุกบาท", body: "สั่งให้คุณตายายสามเล่ม ท่านน้ำตาคลอเลย ปกแข็งให้สัมผัสพรีเมียมจริง", name: "เอเลน่า", meta: "ผู้ซื้อที่ยืนยันแล้ว" },
    ],
  },
  faq: {
    eyebrow: "เรื่องน่ารู้",
    heading: "คำถามที่พบบ่อย",
    items: [
      { q: "ทำหนังสือภาพอย่างไร?", a: "เลือกเทมเพลต อัปโหลดรูป แล้วระบบจะจัดวางให้ คุณสามารถสลับหน้า เพิ่มข้อความ ดูตัวอย่าง แล้วสั่งซื้อ ใช้เวลาเพียงไม่กี่นาที" },
      { q: "จัดส่งใช้เวลานานไหม?", a: "เราพิมพ์ภายใน 2–3 วันทำการ และจัดส่งภายใน 3–5 วันทำการหลังจากนั้น ส่งฟรีเมื่อสั่งซื้อครบ ฿1,500" },
      { q: "จัดส่งทั่วประเทศหรือไม่?", a: "ใช่ เราจัดส่งทั่วประเทศไทย ค่าจัดส่งและระยะเวลาคำนวณตอนชำระเงินตามที่อยู่ของคุณ" },
      { q: "ปรับแต่งเลย์เอาต์ได้ไหม?", a: "ได้แน่นอน ทุกเทมเพลตแก้ไขได้เต็มที่ ทั้งสลับเลย์เอาต์ ปรับขนาดรูป เปลี่ยนพื้นหลัง และเพิ่มข้อความในทุกหน้า" },
      { q: "มีขนาดและจำนวนหน้าแบบไหนบ้าง?", a: "ปกแข็งเริ่มต้นที่ 24 หน้า และเพิ่มหน้าได้ตลอดในเครื่องมือแก้ไข" },
      { q: "ถ้าหนังสือมาถึงแล้วชำรุดทำอย่างไร?", a: "คุณได้รับความคุ้มครองด้วยการรับประกันความพึงพอใจ 30 วัน หากมีปัญหาติดต่อเราเพื่อพิมพ์ใหม่หรือคืนเงิน" },
    ],
  },
  guarantees: [
    { icon: "truck", title: "จัดส่งฟรีและรวดเร็ว", body: "ส่งฟรีเมื่อครบ ฿1,500 · พิมพ์ภายในไม่กี่วัน" },
    { icon: "shield", title: "รับประกัน 30 วัน", body: "พอใจหรือยินดีคืนเงิน" },
    { icon: "star", title: "ลูกค้าพึงพอใจกว่า 12,000 คน", body: "คะแนน 4.9/5 ทุกช่องทาง" },
  ],
  footer: {
    blurb: "หนังสือภาพปกแข็งพรีเมียม ออกแบบเองได้ในไม่กี่นาที พิมพ์มาเพื่อเก็บไว้ตลอดชีวิต",
    columns: [
      { title: "ทำหนังสือ", links: [{ label: "เทมเพลตทั้งหมด", href: "#product" }, { label: "ขายดี", href: "#product" }, { label: "หนังสือของขวัญ", href: "#product" }] },
      { title: "บริษัท", links: [{ label: "เกี่ยวกับเรา", href: "#" }, { label: "รีวิว", href: "#reviews" }, { label: "ติดต่อ", href: "#" }] },
      { title: "ช่วยเหลือ", links: [{ label: "คำถามที่พบบ่อย", href: "#faq" }, { label: "การจัดส่ง", href: "#" }, { label: "การคืนสินค้า", href: "#" }] },
    ],
    socials: ["Instagram", "TikTok", "Facebook", "YouTube"],
    legal: ["ข้อกำหนด", "ความเป็นส่วนตัว", "นโยบายคืนเงิน"],
  },
};

export const DICTS: Record<Locale, LandingDict> = { th: TH, en: EN };

/** Hook: returns the dictionary for the active locale plus a price formatter. */
export function useLanding() {
  const locale = useLocale((s) => s.locale);
  const dict = DICTS[locale];
  const formatPrice = (n: number) =>
    dict.currency === "thb"
      ? `฿${n.toLocaleString("th-TH")}`
      : `$${n.toFixed(2)}`;
  return { ...dict, locale, formatPrice };
}
