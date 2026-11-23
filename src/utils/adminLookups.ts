import { adminService } from '../services/adminService';
import { extractArray, asRecord, toStr } from '../services/admin/dashboardNormalizer';

export interface SimpleUserOption {
  id: string | number;
  label: string;
  email: string;
}

export interface SimpleSeriesOption {
  id: string | number;
  title: string;
  price: number;
  isFree: boolean;
}

export async function fetchUsersAndSeries(): Promise<{
  users: SimpleUserOption[];
  series: SimpleSeriesOption[];
}> {
  const usersRes = await adminService.getUsers().catch(() => []);
  const rawUsers = extractArray(usersRes, ['users', 'items', 'rows']);

  const users: SimpleUserOption[] = rawUsers.map((u) => {
    const r = asRecord(u);
    const name = toStr(r.name ?? r.username, `User #${r.id}`);
    const email = toStr(r.email);
    return {
      id: (r.id ?? '') as string | number,
      label: email ? `${name} (${email})` : name,
      email,
    };
  });

  return { users, series: [] };
}

