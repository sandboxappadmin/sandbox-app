import { getCurrentNicheInstall } from '@/lib/niche-server';
import NicheShell from './NicheShell';

export default async function NicheLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  return (
    <NicheShell slug={slug} label={install.label}>
      {children}
    </NicheShell>
  );
}