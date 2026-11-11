import { adminService } from '../services/adminService';
import { extractArray, asRecord, toNum, toStr } from '../services/admin/dashboardNormalizer';

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
  const [usersRes, seriesRes] = await Promise.all([
    adminService.getUsers().catch(() => []),
    adminService.getTestSeries().catch(() => []),
  ]);

  const rawUsers = extractArray(usersRes, ['users', 'items', 'rows']);
  const rawSeries = extractArray(seriesRes, ['testSeries', 'series', 'items', 'rows']);

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

  const series: SimpleSeriesOption[] = rawSeries.map((s) => {
    const r = asRecord(s);
    return {
      id: (r.id ?? '') as string | number,
      title: toStr(r.title ?? r.name, `Series #${r.id}`),
      price: toNum(r.price),
      isFree: Boolean(r.is_free ?? r.isFree),
    };
  });

  return { users, series };
}

