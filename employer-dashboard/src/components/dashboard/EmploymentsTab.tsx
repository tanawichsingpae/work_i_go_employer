import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { CalendarDays, Banknote, Users } from "lucide-react";
import { fetchJson } from "@/lib/api";
import EmploymentsQuartileChart, { type EmploymentsQuartileDatum } from "@/components/dashboard/EmploymentsQuartileChart";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/LanguageContext";

type TimelineRow = {
  jobpost_id: string;
  title: string;
  job_type: string;
  employment_count: number;
  earliest_start: string | null;
  latest_end: string | null;
  total_agreed_wage: number;
  employment_status: string;
};

type Summary = {
  overall_start: string | null;
  overall_end: string | null;
  grand_total_wage: number;
  total_employments: number;
};

type TimelineResponse = {
  timeline: TimelineRow[];
  summary: Summary;
};

const COLORS = [
  "hsl(355 92% 72%)",
  "hsl(276 72% 67%)",
  "hsl(239 84% 67%)",
  "hsl(199 89% 48%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(25 95% 53%)",
  "hsl(174 72% 40%)",
  "hsl(346 77% 50%)",
  "hsl(217 91% 60%)",
  "hsl(47 96% 53%)",
  "hsl(280 67% 50%)",
];

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDateValue = (value: string | null | undefined, language: Language) => {
  if (!value) return "-";

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const getDateSortValue = (value: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY;

  const parsedTime = parseISO(value).getTime();
  return Number.isNaN(parsedTime) ? Number.POSITIVE_INFINITY : parsedTime;
};

const pickEarlierDate = (current: string | null, candidate: string | null) => {
  if (!current) return candidate;
  if (!candidate) return current;
  return candidate < current ? candidate : current;
};

const pickLaterDate = (current: string | null, candidate: string | null) => {
  if (!current) return candidate;
  if (!candidate) return current;
  return candidate > current ? candidate : current;
};

const EmploymentsTab = () => {
  const [selectedJobpostId, setSelectedJobpostId] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const { data, isLoading, error } = useQuery<TimelineResponse>({
    queryKey: ["employment-timeline"],
    queryFn: () => fetchJson<TimelineResponse>("/api/employer/employment-timeline"),
  });

  const aggregated = useMemo(() => {
    if (!data?.timeline) return [];

    const map = new Map<string, {
      jobpost_id: string;
      title: string;
      job_type: string;
      total_agreed_wage: number;
      employment_count: number;
      earliest_start: string | null;
      latest_end: string | null;
    }>();

    for (const row of data.timeline) {
      const existing = map.get(row.jobpost_id);

      if (existing) {
        existing.total_agreed_wage += row.total_agreed_wage;
        existing.employment_count += row.employment_count;
        existing.earliest_start = pickEarlierDate(existing.earliest_start, row.earliest_start);
        existing.latest_end = pickLaterDate(existing.latest_end, row.latest_end);
      } else {
        map.set(row.jobpost_id, {
          jobpost_id: row.jobpost_id,
          title: row.title,
          job_type: row.job_type,
          total_agreed_wage: row.total_agreed_wage,
          employment_count: row.employment_count,
          earliest_start: row.earliest_start,
          latest_end: row.latest_end,
        });
      }
    }

    return Array.from(map.values()).sort((left, right) => {
      const leftDate = getDateSortValue(left.earliest_start);
      const rightDate = getDateSortValue(right.earliest_start);

      if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate) && leftDate !== rightDate) {
        return leftDate - rightDate;
      }

      return left.total_agreed_wage - right.total_agreed_wage;
    });
  }, [data?.timeline]);

  const chartData = useMemo<EmploymentsQuartileDatum[]>(
    () =>
      aggregated.map((row, index) => ({
        jobpostId: row.jobpost_id,
        label: row.title,
        jobType: row.job_type,
        start: row.earliest_start,
        end: row.latest_end,
        wage: row.total_agreed_wage,
        employmentCount: row.employment_count,
        color: COLORS[index % COLORS.length],
      })),
    [aggregated],
  );

  useEffect(() => {
    setSelectedJobpostId((current) => {
      if (!aggregated.length) return null;
      if (current && aggregated.some((row) => row.jobpost_id === current)) return current;
      return aggregated[0].jobpost_id;
    });
  }, [aggregated]);

  const summary = data?.summary;
  const selectedRow = aggregated.find((row) => row.jobpost_id === selectedJobpostId) ?? aggregated[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t("dateRange")}</p>
              <p className="break-words text-sm font-semibold text-card-foreground">
                {formatDateValue(summary.overall_start, language)} - {formatDateValue(summary.overall_end, language)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Banknote className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t("totalAgreedWage")}</p>
              <p className="break-words text-sm font-semibold text-card-foreground">
                {formatCurrency(summary.grand_total_wage)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t("totalEmployments")}</p>
              <p className="text-sm font-semibold text-card-foreground">
                {summary.total_employments}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display font-semibold text-card-foreground">
              {t("employmentQuartileTimeline")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("employmentQuartileDesc")}
            </p>
          </div>
          {selectedRow && (
            <div className="rounded-lg bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">
              {t("focus")}: <span className="font-medium text-card-foreground">{selectedRow.title}</span>
            </div>
          )}
        </div>

        {isLoading && <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>}
        {error && !isLoading && <p className="mt-4 text-sm text-destructive">{t("loadChartDataError")}</p>}
        {!isLoading && !error && chartData.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">{t("noEmploymentsData")}</p>
        )}
        {!isLoading && !error && chartData.length > 0 && (
          <div className="mt-4">
            <EmploymentsQuartileChart
              data={chartData}
              selectedJobpostId={selectedJobpostId}
              onSelectJobpost={setSelectedJobpostId}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display font-semibold text-card-foreground">{t("employmentDetails")}</h3>
          {selectedRow && (
            <p className="text-sm text-muted-foreground">
              {t("selectedRange")}: {formatDateValue(selectedRow.earliest_start, language)} - {formatDateValue(selectedRow.latest_end, language)}
            </p>
          )}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          {aggregated.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("noEmploymentsData")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium text-muted-foreground">{t("jobTitle")}</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">{t("type")}</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">{t("employmentsCount")}</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">{t("start")}</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">{t("end")}</th>
                  <th className="py-2 text-right font-medium text-muted-foreground">{t("agreedWage")}</th>
                </tr>
              </thead>
              <tbody>
                {aggregated.map((row) => {
                  const isSelected = row.jobpost_id === selectedJobpostId;

                  return (
                    <tr
                      key={row.jobpost_id}
                      onClick={() => setSelectedJobpostId(row.jobpost_id)}
                      className={`border-b border-border last:border-0 transition-colors ${
                        isSelected ? "bg-primary/5" : "hover:bg-accent/50"
                      } cursor-pointer`}
                    >
                      <td className="py-3 font-medium text-card-foreground">{row.title}</td>
                      <td className="py-3 text-muted-foreground">{row.job_type}</td>
                      <td className="py-3 text-right text-muted-foreground">{row.employment_count}</td>
                      <td className="py-3 text-muted-foreground">{formatDateValue(row.earliest_start, language)}</td>
                      <td className="py-3 text-muted-foreground">{formatDateValue(row.latest_end, language)}</td>
                      <td className="py-3 text-right font-medium text-card-foreground">{formatCurrency(row.total_agreed_wage)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-3 space-y-3 md:hidden">
          {!aggregated.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("noEmploymentsData")}</p>
          )}
          {aggregated.map((row) => {
            const isSelected = row.jobpost_id === selectedJobpostId;

            return (
              <button
                key={row.jobpost_id}
                type="button"
                onClick={() => setSelectedJobpostId(row.jobpost_id)}
                className={`w-full space-y-3 rounded-lg border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-card-foreground">{row.title}</p>
                    <p className="text-xs text-muted-foreground">{row.job_type}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                    {row.employment_count} {t("hires")}
                  </span>
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground">
                  <p>{t("start")}: {formatDateValue(row.earliest_start, language)}</p>
                  <p>{t("end")}: {formatDateValue(row.latest_end, language)}</p>
                </div>
                <div className="rounded-md bg-secondary/60 px-3 py-2 text-sm font-medium text-card-foreground">
                  {formatCurrency(row.total_agreed_wage)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmploymentsTab;