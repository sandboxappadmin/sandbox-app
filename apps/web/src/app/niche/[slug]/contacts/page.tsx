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

  const customFieldDefs = await prisma.customFieldDefinition.findMany({
    where: { nicheInstallId: install.id },
    orderBy: { createdAt: 'asc' },
  });

  const serialized = contacts.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    tags: c.tags.map((t) => ({ id: t.id, name: t.name })),
    customFields: (c.customFields as Record<string, unknown>) ?? {},
  }));

  return (
    <ContactsClient
      slug={slug}
      initialContacts={serialized}
      allTags={allTags.map((t) => ({ id: t.id, name: t.name }))}
      customFieldDefs={customFieldDefs.map((d) => ({
        id: d.id,
        key: d.key,
        label: d.label,
        type: d.type,
        options: (d.options as string[] | null) ?? null,
      }))}
    />
  );
}