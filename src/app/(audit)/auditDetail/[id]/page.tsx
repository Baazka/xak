import AuditDetailClient from "./AuditClient";

export default async function AuditDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ formId?: string }>;
}) {
  const { id } = await params;
  const { formId } = await searchParams;

  const auditId = Number(id);
  const formListId = formId ? Number(formId) : undefined;

  return <AuditDetailClient auditId={auditId} formListId={formListId} />;
}
