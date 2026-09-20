import { getCurrentNicheInstall } from '@/lib/niche-server';
import { prisma } from '@repo/database';
import ContactsClient from './ContactsClient';

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const contacts = await prisma.contact.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { createdAt: 'desc' },
    include: { tags: true },
  });

  const allTags = await prisma.tag.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { name: 'asc' },
  });

  const serialized = contacts.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    tags: c.tags.map((t) => ({ id: t.id, name: t.name })),
  }));

  return (
    <ContactsClient
      slug={slug}
      initialContacts={serialized}
      allTags={allTags.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}