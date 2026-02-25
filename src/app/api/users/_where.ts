type Filters = {
  username?: string;
  email?: string;
};

export function safeParseFilters(raw: string | null): Filters {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function buildWhereClause(search: string, filters: Filters) {
  let whereClause = "WHERE status IS DISTINCT FROM 2";
  const params: any[] = [];

  // global search
  if (search) {
    params.push(`%${search}%`);
    whereClause += `
      AND (
        username ILIKE $${params.length}
        OR email ILIKE $${params.length}
      )
    `;
  }

  // column filters (хэрэв table дээр filter ашигладаг бол)
  if (filters.username) {
    params.push(`%${filters.username}%`);
    whereClause += ` AND username ILIKE $${params.length}`;
  }
  if (filters.email) {
    params.push(`%${filters.email}%`);
    whereClause += ` AND email ILIKE $${params.length}`;
  }

  return { whereClause, params };
}
