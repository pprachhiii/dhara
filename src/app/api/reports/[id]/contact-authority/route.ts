import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { Context } from '@/lib/context';
import { ContactMode, ContactStatus, ReportStatus } from '@prisma/client';

export async function POST(request: NextRequest, context: Context) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.user) return auth.response!;

  try {
    const { id: reportId } = await context.params;
    const { authority, reportAuthority } = await request.json();

    /* ================= VALIDATION ================= */

    if (!authority?.name || !reportAuthority?.contactedAt) {
      return NextResponse.json(
        { error: 'Authority name and contacted date are required' },
        { status: 400 },
      );
    }

    if (!authority.contactMode || !Object.values(ContactMode).includes(authority.contactMode)) {
      return NextResponse.json({ error: 'Valid contact mode is required' }, { status: 400 });
    }

    /* ================= VOLUNTEER ================= */

    const volunteer = await prisma.volunteer.findUnique({
      where: { userId: auth.user.id },
      select: { id: true },
    });

    let authorityRecord = null;

    /* ================= EXISTING AUTHORITY ================= */

    if (authority.id) {
      authorityRecord = await prisma.authority.findUnique({
        where: { id: authority.id },
      });

      if (!authorityRecord) {
        return NextResponse.json({ error: 'Authority not found' }, { status: 404 });
      }
    }

    /* ================= NEW AUTHORITY ================= */

    if (!authorityRecord) {
      if (!authority.category || !authority.role || !authority.city) {
        return NextResponse.json(
          { error: 'New authority requires category, role, and city' },
          { status: 400 },
        );
      }

      const contactData = {
        email: authority.contactMode === ContactMode.EMAIL ? authority.email : null,
        phone: authority.contactMode === ContactMode.PHONE ? authority.phone : null,
        website: authority.contactMode === ContactMode.WEBSITE ? authority.website : null,
        other:
          authority.contactMode === ContactMode.SOCIAL_MEDIA ||
          authority.contactMode === ContactMode.IN_PERSON ||
          authority.contactMode === ContactMode.OTHER
            ? authority.other
            : null,
      };

      authorityRecord = await prisma.authority.create({
        data: {
          name: authority.name,
          category: authority.category,
          role: authority.role,
          city: authority.city,
          region: authority.region ?? null,
          contactMode: authority.contactMode,
          ...contactData,
          submittedById: auth.user.id,
        },
      });
    }

    /* ================= DUPLICATE GUARD ================= */

    const existingContact = await prisma.reportAuthority.findFirst({
      where: {
        reportId,
        authorityId: authorityRecord.id,
      },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: 'Authority already contacted for this report' },
        { status: 409 },
      );
    }

    /* ================= CREATE REPORT AUTHORITY ================= */

    await prisma.reportAuthority.create({
      data: {
        reportId,
        authorityId: authorityRecord.id,
        volunteerId: volunteer?.id ?? null,

        contactMode: reportAuthority.contactMode,
        platformDetail: reportAuthority.platformDetail,
        submittedMessage: reportAuthority.submittedMessage ?? null,
        referenceId: reportAuthority.referenceId ?? null,
        contactedAt: new Date(reportAuthority.contactedAt),

        status: ContactStatus.CONTACTED,
      },
    });

    /* ================= UPDATE REPORT ================= */

    await prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.AUTHORITY_CONTACTED },
    });

    await prisma.statusLog.create({
      data: {
        reportId,
        status: ReportStatus.AUTHORITY_CONTACTED,
        note: 'Authority contacted',
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to contact authority' }, { status: 500 });
  }
}
