import { NextResponse } from 'next/server';
import { getClinicalCohortForProfile } from '@/lib/staging';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    
    // Dynamically calculate the matching cohort and survival metrics based on current profile and stage
    const matchedCohort = getClinicalCohortForProfile(profile);

    return NextResponse.json({ success: true, data: matchedCohort });
  } catch (error: any) {
    console.error('Error fetching similar cases:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

