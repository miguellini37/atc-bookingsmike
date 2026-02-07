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
      console.error(`VATSIM API error: ${response.status} ${response.statusText} URL: ${pageUrl} Body: ${body}`);
      throw new Error(`VATSIM API error: ${response.status} ${response.statusText} - ${body}`);
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
 * Fetches members from a division or subdivision and upserts them as 'member' role
 */
export async function syncRoster(
  apiKeyId: number,
  division: string,
  subdivision: string | null,
  vatsimApiKey: string
): Promise<{ added: number; existing: number; total: number }> {
  // Map our subdivision code to VATSIM's code if needed
  const vatsimSubdivision = subdivision
    ? SUBDIVISION_CODE_MAP[subdivision] || subdivision
    : null;

  // Use subdivision endpoint if available, otherwise division
  const endpoint = vatsimSubdivision
    ? `${VATSIM_API_BASE}/v2/orgs/subdivision/${vatsimSubdivision}`
    : `${VATSIM_API_BASE}/v2/orgs/division/${division}`;

  console.log(`VATSIM roster sync: subdivision=${subdivision} → vatsimCode=${vatsimSubdivision} endpoint=${endpoint}`);
  const members = await fetchAllPages(endpoint, vatsimApiKey);

  let added = 0;
  let existing = 0;

  for (const member of members) {
    const cid = member.id.toString();

    const existingMember = await prisma.orgMember.findUnique({
      where: { cid_apiKeyId: { cid, apiKeyId } },
    });

    if (existingMember) {
      existing++;
    } else {
      await prisma.orgMember.create({
        data: {
          cid,
          apiKeyId,
          role: 'member',
        },
      });
      added++;
    }
  }

  return { added, existing, total: members.length };
}
