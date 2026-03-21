import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, Banknote, Users } from "lucide-react";
import { fetchJson } from "@/lib/api";
import EmploymentsQuartileChart, { type EmploymentsQuartileDatum } from "@/components/dashboard/EmploymentsQuartileChart";
import { useLanguage } from "@/i18n/LanguageContext";

type TimelineRow = {
  jobpost_id: string;
  title: string;
  job_type: string;
  employment_count: number;
  earliest_start: string;
  latest_end: string;
  total_agreed_wage: number;
  employment_status: string;
};

type Summary = {
  overall_start: string;
  overall_end: string;
  grand_total_wage: number;
  total_employments: number;
};

type TimelineResponse = {
  timeline: TimelineRow[];
  summary: Summary;
};

const COLORS = [
  "hsl(355 92% 72%)", "hsl(276 72% 67%)", "hsl(239 84% 67%)",
  "hsl(199 89% 48%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)",
  "hsl(25 95% 53%)", "hsl(174 72% 40%)", "hsl(346 77% 50%)",
  "hsl(217 91% 60%)", "hsl(47 96% 53%)", "hsl(280 67% 50%)",
];

const currFmt = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCurr = (v: number) => currFmt.format(v);
const fmtDate = (v: string) => { const d = parseISO(v); return Number.isNaN(d.getTime()) ? v : format(d, "d MMM yyyy"); };

const EmploymentsTab = () => {
  const [selectedJobpostId, setSelectedJobpostId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { data, isLoading, error } = useQuery<TimelineResponse>({ queryKey: ["employment-timeline"], queryFn: () => fetchJson<TimelineResponse>("/api/employer/employment-timeline") });

  const aggregated = useMemo(() => {
    if (!data?.timeline) return [];
    const map = new Map<string, { jobpost_id: string; title: string; job_type: string; total_agreed_wage: number; employment_count: number; earliest_start: string; latest_end: string }>();
    for (const row of data.timeline) {
      const ex = map.get(row.jobpost_id);
      if (ex) { ex.total_agreed_wage += row.total_agreed_wage; ex.employment_count += row.employment_count; if (row.earliest_start < ex.earliest_start) ex.earliest_start = row.earliest_start; if (row.latest_end > ex.latest_end) ex.latest_end = row.latest_end; }
      else { map.set(row.jobpost_id, { jobpost_id: row.jobpost_id, title: row.title, job_type: row.job_type, total_agreed_wage: row.total_agreed_wage, employment_count: row.employment_count, earliest_start: row.earliest_start, latest_end: row.latest_end }); }
    }
    return Array.from(map.values()).sort((a, b) => { const ad = parseISO(a.earliest_start).getTime(), bd = parseISO(b.earliest_start).getTime(); if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) return ad - bd; return a.total_agreed_wage - b.total_agreed_wage; });
  }, [data?.timeline]);

  const chartData = useMemo<EmploymentsQuartileDatum[]>(() => aggregated.map((r, i) => ({ jobpostId: r.jobpost_id, label: r.title, jobType: r.job_type, start: r.earliest_start, end: r.latest_end, wage: r.total_agreed_wage, employmentCount: r.employment_count, color: COLORS[i % COLORS.length] })), [aggregated]);

  useEffect(() => { setSelectedJobpostId((c) => { if (!aggregated.length) return null; if (c && aggregated.some((r) => r.jobpost_id === c)) return c; return aggregated[0].jobpost_id; }); }, [aggregated]);

  const summary = data?.summary;
  const selectedRow = aggregated.find((r) => r.jobpost_id === selectedJobpostId) ?? aggregated[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><CalendarDays className="h-5 w-5 text-primary" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{t("dateRange")}</p><p className="break-words text-sm font-semibold text-card-foreground">{fmtDate(summary.overall_start)} - {fmtDate(summary.overall_end)}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><Banknote className="h-5 w-5 text-success" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{t("totalAgreedWage")}</p><p className="break-words text-sm font-semibold text-card-foreground">{fmtCurr(summary.grand_total_wage)}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{t("totalEmployments")}</p><p className="text-sm font-semibold text-card-foreground">{summary.total_employments}</p></div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display font-semibold text-card-foreground">{t("employmentQuartileTimeline")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("employmentQuartileDesc")}</p>
          </div>
          {selectedRow && (<div className="rounded-lg bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">{t("focus")}: <span className="font-medium text-card-foreground">{selectedRow.title}</span></div>)}
        </div>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>}
        {error && !isLoading && <p className="mt-4 text-sm text-destructive">{t("loadChartDataError")}</p>}
        {!isLoading && !error && chartData.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{t("noEmploymentsData")}</p>}
        {!isLoading && !error && chartData.length > 0 && (<div className="mt-4"><EmploymentsQuartileChart data={chartData} selectedJobpostId={selectedJobpostId} onSelectJobpost={setSelectedJobpostId} /></div>)}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display font-semibold text-card-foreground">{t("employmentDetails")}</h3>
          {selectedRow && <p className="text-sm text-muted-foreground">{t("selectedRange")}: {fmtDate(selectedRow.earliest_start)} - {fmtDate(selectedRow.latest_end)}</p>}
        </div>
        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="py-2 text-left font-medium text-muted-foreground">{t("jobTitle")}</th>
              <th className="py-2 text-left font-medium text-muted-foreground">{t("type")}</th>
              <th className="py-2 text-right font-medium text-muted-foreground">{t("employmentsCount")}</th>
              <th className="py-2 text-left font-medium text-muted-foreground">{t("start")}</th>
              <th className="py-2 text-left font-medium text-muted-foreground">{t("end")}</th>
              <th className="py-2 text-right font-medium text-muted-foreground">{t("agreedWage")}</th>
            </tr></thead>
            <tbody>
              {aggregated.map((row) => {
                const isSel = row.jobpost_id === selectedJobpostId;
                return (
                  <tr key={row.jobpost_id} onClick={() => setSelectedJobpostId(row.jobpost_id)} className={`border-b border-border last:border-0 transition-colors ${isSel ? "bg-primary/5" : "hover:bg-accent/50"} cursor-pointer`}>
                    <td className="py-3 font-medium text-card-foreground">{row.title}</td>
                    <td className="py-3 text-muted-foreground">{row.job_type}</td>
                    <td className="py-3 text-right text-muted-foreground">{row.employment_count}</td>
                    <td className="py-3 text-muted-foreground">{fmtDate(row.earliest_start)}</td>
                    <td className="py-3 text-muted-foreground">{fmtDate(row.latest_end)}</td>
                    <td className="py-3 text-right font-medium text-card-foreground">{fmtCurr(row.total_agreed_wage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-3 md:hidden">
          {aggregated.map((row) => {
            const isSel = row.jobpost_id === selectedJobpostId;
            return (
              <button key={row.jobpost_id} type="button" onClick={() => setSelectedJobpostId(row.jobpost_id)} className={`w-full space-y-3 rounded-lg border p-4 text-left transition-colors ${isSel ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="break-words font-medium text-card-foreground">{row.title}</p><p className="text-xs text-muted-foreground">{row.job_type}</p></div>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{row.employment_count} {t("hires")}</span>
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground"><p>{t("start")}: {fmtDate(row.earliest_start)}</p><p>{t("end")}: {fmtDate(row.latest_end)}</p></div>
                <div className="rounded-md bg-secondary/60 px-3 py-2 text-sm font-medium text-card-foreground">{fmtCurr(row.total_agreed_wage)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmploymentsTab;