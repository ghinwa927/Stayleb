import { AppShell } from '@/components/layout/Appshell';
import { OwnerGuard } from '@/components/owner/OwnerGuard';
export default function Layout({ children }: { children: React.ReactNode }) { return <AppShell area="owner"><OwnerGuard>{children}</OwnerGuard></AppShell>; }
