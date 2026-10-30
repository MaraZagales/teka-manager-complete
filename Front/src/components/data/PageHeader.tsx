import type { ReactNode } from 'react';
export function PageHeader({ kicker, title, description, action }: { kicker?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="page-kicker">{kicker}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>;
}
