import EditorClient from "./EditorClient";

// Editor is fully client-side — never prerender (needs browser APIs + env vars)
export const dynamic = "force-dynamic";
export const metadata = { title: "Everbook Editor" };

export default function EditorPage() {
  return <EditorClient />;
}
