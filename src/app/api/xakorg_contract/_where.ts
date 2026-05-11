type Filters = {
  contract_name?: string;
  contract_begin_date?: string;
  contract_end_date?: string;
  xakorg_id?: number | string;
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

export function buildWhereClause(search: string, filters: Filters, xakorg_id?: number | null) {
  let whereClause = "WHERE 1=1";
  const params: any[] = [];

  if (xakorg_id) {
    params.push(xakorg_id);
    whereClause += ` AND c.xakorg_id = $${params.length}`;
  }

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
  console.log(whereClause, "whereClause");

  return { whereClause, params };
}
