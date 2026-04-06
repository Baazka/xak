import AuditDetailClient from "./AuditClient";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auditId = Number(id);

  return <AuditDetailClient auditId={auditId} />;
}
