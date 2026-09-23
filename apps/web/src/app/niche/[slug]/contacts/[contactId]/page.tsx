import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { getCurrentNicheInstall } from '@/lib/niche-server';
import ContactTimelineClient from './ContactTimelineClient';

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ slug: string; contactId: string }>;
}) {
  const { slug, contactId } = await params;
  const { install } = await getCurrentNicheInstall(slug);

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      tags: true,
      conversation: {
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      },
    },
  });

  if (!contact || contact.nicheInstallId !== install.id) {
    notFound();
  }

  const serialized = {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    tags: contact.tags.map((t) => ({ id: t.id, name: t.name })),
    messages: (contact.conversation?.messages ?? []).map((m) => ({
      id: m.id,
      channel: m.channel,
      direction: m.direction,
      subject: m.subject,
      body: m.body,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
  };

  return <ContactTimelineClient slug={slug} contact={serialized} />;
}