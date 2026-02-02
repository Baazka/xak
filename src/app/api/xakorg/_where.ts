type Filters = {
  name?: string;
  reg_no?: string;
  email?: string;
  phone?: string;
  address?: string;
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
  let whereClause = "WHERE status IS NULL";
  const params: any[] = [];

  // global search (чинийх шиг)
  if (search) {
    params.push(`%${search}%`);
    whereClause += `
      AND (
        name ILIKE $${params.length}
        OR reg_no ILIKE $${params.length}
        OR email ILIKE $${params.length}
      )
    `;
  }

  // column filters (DataTable filter хийдэг бол энд нэмнэ)
  if (filters.name) {
    params.push(`%${filters.name}%`);
    whereClause += ` AND name ILIKE $${params.length}`;
  }
  if (filters.reg_no) {
    params.push(`%${filters.reg_no}%`);
    whereClause += ` AND reg_no ILIKE $${params.length}`;
  }
  if (filters.email) {
    params.push(`%${filters.email}%`);
    whereClause += ` AND email ILIKE $${params.length}`;
  }
  if (filters.phone) {
    params.push(`%${filters.phone}%`);
    whereClause += ` AND phone ILIKE $${params.length}`;
  }
  if (filters.address) {
    params.push(`%${filters.address}%`);
    whereClause += ` AND address ILIKE $${params.length}`;
  }

  return { whereClause, params };
}
