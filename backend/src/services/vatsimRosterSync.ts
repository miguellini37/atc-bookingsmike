import { prisma } from '../utils/database';

const VATSIM_API_BASE = 'https://api.vatsim.net';

/**
 * Map our subdivision codes to VATSIM's subdivision IDs
 * (for cases where we renamed them in our database)
 */
const SUBDIVISION_CODE_MAP: Record<string, string> = {
  CZE: 'CZCH',
  LVA: 'LATVIA',
};

interface VatsimMember {
  id: number;
  name_first: string;
  name_last: string;
  subdivision_id?: string;
}

interface VatsimRosterResponse {
  items: VatsimMember[];
  count: number;
}

/**
 * Fetch all pages from a VATSIM roster endpoint
 */
async function fetchAllPages(url: string, apiKey: string): Promise<VatsimMember[]> {
  const allMembers: VatsimMember[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const separator = url.includes('?') ? '&' : '?';
    const pageUrl = `${url}${separator}limit=${limit}&offset=${offset}`;

    const response = await fetch(pageUrl, {
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': 'ATC-BookingSystem/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const isHtml = body.startsWith('<!') || body.startsWith('<html');
      const logBody = isHtml ? `[HTML response - likely Cloudflare/server error]` : body;
      console.error(`VATSIM API error: ${response.status} ${response.statusText} URL: ${pageUrl} Body: ${logBody}`);
      throw new Error(`VATSIM API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as VatsimRosterResponse;
    allMembers.push(...data.items);

    if (allMembers.length >= data.count || data.items.length < limit) {
      break;
    }

    offset += limit;
  }

  return allMembers;
}

/**
 * Sync roster from VATSIM Core API
 * Tries subdivision endpoint first, falls back to division endpoint
 * with client-side filtering by subdivision_id.
 */
export async function syncRoster(
  apiKeyId: number,
  division: string,
  subdivision: string | null,
  vatsimApiKey: string
): Promise<{ added: number; existing: number; total: number }> {
  const vatsimSubdivision = subdivision
    ? SUBDIVISION_CODE_MAP[subdivision] || subdivision
    : null;

  let members: VatsimMember[];

  // Try subdivision endpoint first, fall back to division
  if (vatsimSubdivision) {
    const subEndpoint = `${VATSIM_API_BASE}/v2/orgs/subdivision/${vatsimSubdivision}`;
    console.log(`VATSIM roster sync: trying subdivision endpoint ${subEndpoint}`);
    try {
      members = await fetchAllPages(subEndpoint, vatsimApiKey);
    } catch (subError) {
      console.log(`Subdivision endpoint failed, falling back to division endpoint (${division}) with filter`);
      const divEndpoint = `${VATSIM_API_BASE}/v2/orgs/division/${division}`;
      const allDivMembers = await fetchAllPages(divEndpoint, vatsimApiKey);
      // Filter to only members in this subdivision
      members = allDivMembers.filter(m => m.subdivision_id === vatsimSubdivision);
      console.log(`Filtered ${allDivMembers.length} division members → ${members.length} in subdivision ${vatsimSubdivision}`);
    }
  } else {
    const divEndpoint = `${VATSIM_API_BASE}/v2/orgs/division/${division}`;
    console.log(`VATSIM roster sync: using division endpoint ${divEndpoint}`);
    members = await fetchAllPages(divEndpoint, vatsimApiKey);
  }

  // Batch: fetch all existing CIDs for this org in one query
  const existingMembers = await prisma.orgMember.findMany({
    where: { apiKeyId },
    select: { cid: true },
  });
  const existingCids = new Set(existingMembers.map((m) => m.cid));

  // Find new members not yet in the database
  const newMembers = members
    .map((m) => m.id.toString())
    .filter((cid) => !existingCids.has(cid));

  // Bulk insert new members
  if (newMembers.length > 0) {
    await prisma.orgMember.createMany({
      data: newMembers.map((cid) => ({
        cid,
        apiKeyId,
        role: 'member',
      })),
      skipDuplicates: true,
    });
  }

  const added = newMembers.length;
  const existing = members.length - added;

  return { added, existing, total: members.length };
}
