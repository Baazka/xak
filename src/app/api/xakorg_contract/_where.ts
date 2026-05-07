type Filters = {
  contract_name?: string;
  contract_begin_date?: string;
  contract_end_date?: string;
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
  let whereClause = "";
  const params: any[] = [];

  // global search (чинийх шиг)
  if (search) {
    params.push(`%${search}%`);
    whereClause += `
      AND (
        contract_name ILIKE $${params.length}
        OR contract_begin_date ILIKE $${params.length}
        OR contract_end_date ILIKE $${params.length}
      )
    `;
  }

  // column filters (DataTable filter хийдэг бол энд нэмнэ)
  if (filters.contract_name) {
    params.push(`%${filters.contract_name}%`);
    whereClause += ` AND contract_name ILIKE $${params.length}`;
  }
  if (filters.contract_begin_date) {
    params.push(`%${filters.contract_begin_date}%`);
    whereClause += ` AND contract_begin_date ILIKE $${params.length}`;
  }
  if (filters.contract_end_date) {
    params.push(`%${filters.contract_end_date}%`);
    whereClause += ` AND contract_end_date ILIKE $${params.length}`;
  }

  return { whereClause, params };
}
