import { prisma } from '@repo/database';

const SLOT_MINUTES = 60;
const DAYS_AHEAD = 14;
const MIN_LEAD_HOURS = 2;

export async function getAvailableSlots(nicheInstallId: string): Promise<Date[]> {
  const rules = await prisma.availabilityRule.findMany({ where: { nicheInstallId } });
  if (rules.length === 0) return [];

  const existingAppointments = await prisma.appointment.findMany({
    where: { nicheInstallId, status: 'CONFIRMED', startsAt: { gte: new Date() } },
    select: { startsAt: true },
  });
  const bookedTimes = new Set(existingAppointments.map((a) => a.startsAt.getTime()));

  const now = new Date();
  const earliestBookable = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);
  const slots: Date[] = [];

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    const dayOfWeek = day.getDay();

    const rulesForDay = rules.filter((r) => r.dayOfWeek === dayOfWeek);

    for (const rule of rulesForDay) {
      const [startHour, startMin] = rule.startTime.split(':').map(Number);
      const [endHour, endMin] = rule.endTime.split(':').map(Number);

      const slotStart = new Date(day);
      slotStart.setHours(startHour, startMin, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(endHour, endMin, 0, 0);

      const cursor = new Date(slotStart);
      while (cursor.getTime() + SLOT_MINUTES * 60 * 1000 <= dayEnd.getTime()) {
        if (cursor >= earliestBookable && !bookedTimes.has(cursor.getTime())) {
          slots.push(new Date(cursor));
        }
        cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}