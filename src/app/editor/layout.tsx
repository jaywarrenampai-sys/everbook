// The editor is full-screen — it has its own toolbar, so we suppress
// the shared Navbar and Footer that wrap the rest of the site.
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
