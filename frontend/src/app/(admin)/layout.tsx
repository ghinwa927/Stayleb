import { AppShell } from '@/components/layout/Appshell';
export default function Layout({ children }: { children: React.ReactNode }) { return <AppShell area="admin">{children}</AppShell>; }
