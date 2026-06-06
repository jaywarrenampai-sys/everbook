// Admin layout — suppresses the shared marketing Navbar and Footer.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
