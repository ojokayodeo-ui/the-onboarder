export interface SalesflowDeal {
  id: string;
  name: string;
  email: string;
  company: string | null;
  stage: string;
  job_title: string | null;
  sentiment: string | null;
  created_at: string;
}

export async function getWonDeals(): Promise<SalesflowDeal[]> {
  const baseUrl = process.env.SALESFLOW_API_URL;
  if (!baseUrl) throw new Error("SALESFLOW_API_URL is not configured");

  const res = await fetch(`${baseUrl}/api/crm/deals`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`Salesflow API error: ${res.status}`);

  const data = await res.json();
  // API returns array directly or { deals: [...] }
  const deals: SalesflowDeal[] = Array.isArray(data) ? data : (data.deals ?? []);

  return deals.filter((d) => d.stage === "won");
}
