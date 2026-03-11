type Filters = {
  org_register_no?: string;
  org_legal_name?: string;
  org_phone?: string;
  org_email?: string;
  org_address?: string;
  org_head_name?: string;
  org_head_phone?: string;
  org_head_email?: string;
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
  let whereClause = "WHERE ORG_STATUS = 'ACTIVE' ";
  const params: any[] = [];

  // global search (чинийх шиг)
  if (search) {
    params.push(`%${search}%`);
    whereClause += `
      AND (
        ORG_REGISTER_NO ILIKE $${params.length}
        OR ORG_LEGAL_NAME ILIKE $${params.length}
        OR ORG_PHONE ILIKE $${params.length}
        OR ORG_EMAIL ILIKE $${params.length}
        OR ORG_ADDRESS ILIKE $${params.length}
        OR ORG_HEAD_NAME ILIKE $${params.length}
        OR ORG_HEAD_PHONE ILIKE $${params.length}
        OR ORG_HEAD_EMAIL ILIKE $${params.length}
      )
    `;
  }

  // column filters (DataTable filter хийдэг бол энд нэмнэ)
  if (filters.org_register_no) {
    params.push(`%${filters.org_register_no}%`);
    whereClause += ` AND org_register_no ILIKE $${params.length}`;
  }
  if (filters.org_legal_name) {
    params.push(`%${filters.org_legal_name}%`);
    whereClause += ` AND org_legal_name ILIKE $${params.length}`;
  }
  if (filters.org_phone) {
    params.push(`%${filters.org_phone}%`);
    whereClause += ` AND org_phone ILIKE $${params.length}`;
  }
  if (filters.org_email) {
    params.push(`%${filters.org_email}%`);
    whereClause += ` AND org_email ILIKE $${params.length}`;
  }
  if (filters.org_address) {
    params.push(`%${filters.org_address}%`);
    whereClause += ` AND org_address ILIKE $${params.length}`;
  }
  if (filters.org_head_name) {
    params.push(`%${filters.org_head_name}%`);
    whereClause += ` AND org_head_name ILIKE $${params.length}`;
  }
  if (filters.org_head_phone) {
    params.push(`%${filters.org_head_phone}%`);
    whereClause += ` AND org_head_phone ILIKE $${params.length}`;
  }
  if (filters.org_head_email) {
    params.push(`%${filters.org_head_email}%`);
    whereClause += ` AND org_head_email ILIKE $${params.length}`;
  }

  return { whereClause, params };
}
