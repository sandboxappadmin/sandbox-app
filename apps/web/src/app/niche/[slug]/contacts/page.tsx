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
  });

  // Serialize Dates to strings before crossing into the Client Component
  const serialized = contacts.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
  }));

  return <ContactsClient slug={slug} initialContacts={serialized} />;
}