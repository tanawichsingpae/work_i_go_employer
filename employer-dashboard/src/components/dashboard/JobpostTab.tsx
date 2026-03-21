import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Search } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/LanguageContext";
import type { TranslationKeys } from "@/i18n/en";

type JobpostSummary = {
  jobpost_id: string;
  job_title: string;
  job_type: string;
  wage_amount: number;
  applicant_count: number;
  hired_application_count: number;
  total_agreed_wage: number;
};

type ApplicantRow = {
  job_application_id: number;
  job_seeker_id: string;
  applicant_name: string;
  jobpost_id: string;
  job_title: string;
  applied_at: string;
  province: string;
  is_hired: boolean | string | number | null | undefined;
  agreed_wage: number | string | null | undefined;
};

const COLORS = [
  "hsl(239 84% 67%)",
  "hsl(330 81% 60%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(199 89% 48%)",
  "hsl(262 83% 58%)",
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
const formatAppliedDate = (value: string, language: Language) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const normalizeApplicant = (applicant: ApplicantRow) => {
  const agreedWage =
    applicant.agreed_wage === null || applicant.agreed_wage === undefined
      ? null
      : Number(applicant.agreed_wage);
  const hasAgreedWage = agreedWage !== null && !Number.isNaN(agreedWage);
  const rawIsHired = applicant.is_hired;
  const isHired = rawIsHired === true
    || rawIsHired === 1
    || rawIsHired === "true"
    || rawIsHired === "t"
    || (typeof rawIsHired === "string" && rawIsHired.toLowerCase() === "true")
    || hasAgreedWage;

  return {
    ...applicant,
    is_hired: isHired,
    agreed_wage: hasAgreedWage ? agreedWage : null,
  };
};

const getApplicationStatusBadge = (
  applicant: ApplicantRow,
  t: (key: TranslationKeys) => string,
) => {
  if (applicant.is_hired) {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        {t("hiredStatus")} {formatCurrency(applicant.agreed_wage ?? 0)}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
      {t("notHiredStatus")}
    </Badge>
  );
};

type ChartView = "applicants" | "wage";

const JobpostTab = () => {
  const [selectedJobpost, setSelectedJobpost] = useState<string>("all");
  const [chartView, setChartView] = useState<ChartView>("wage");
  const [search, setSearch] = useState("");
  const [hoveredApplicantsJobpost, setHoveredApplicantsJobpost] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();

  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery<JobpostSummary[]>({
    queryKey: ["jobpost-summary"],
    queryFn: () => fetchJson<JobpostSummary[]>("/api/employer/jobpost-summary"),
  });

  const applicantPath = selectedJobpost === "all"
    ? "/api/employer/recent-applications"
    : `/api/employer/recent-applications?jobpost_id=${selectedJobpost}`;

  const { data: applicantsData, isLoading: appLoading, error: appError } = useQuery<ApplicantRow[]>({
    queryKey: ["employer-applicants", selectedJobpost],
    queryFn: () => fetchJson<ApplicantRow[]>(applicantPath),
  });

  const pieData = (summaryData || []).map((summary) => ({
    name: summary.job_title,
    value: summary.total_agreed_wage,
    jobpost_id: summary.jobpost_id,
    applicant_count: summary.applicant_count,
    hired_application_count: summary.hired_application_count,
  }));
  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);
  const totalApplicants = pieData.reduce((sum, item) => sum + item.applicant_count, 0);
  const totalHiredApplications = pieData.reduce((sum, item) => sum + item.hired_application_count, 0);

  const applicantsBarData = (summaryData || []).map((summary, index) => ({
    key: summary.jobpost_id,
    label: summary.job_title,
    applicants: summary.applicant_count,
    wageAmount: summary.wage_amount,
    fill: COLORS[index % COLORS.length],
  }));

  const selectedSummary = (summaryData || []).find((summary) => summary.jobpost_id === selectedJobpost);
  const selectedLabel = selectedSummary?.job_title ?? selectedJobpost;
  const activeApplicantsJobpostId = hoveredApplicantsJobpost ?? (selectedJobpost !== "all" ? selectedJobpost : null);
  const activeApplicantsBar = applicantsBarData.find((item) => item.key === activeApplicantsJobpostId) ?? null;

  const filtered = (applicantsData || []).filter((applicant) => {
    const normalizedApplicant = normalizeApplicant(applicant);
    const term = search.toLowerCase();
    return (
      (normalizedApplicant.job_title || "").toLowerCase().includes(term) ||
      (normalizedApplicant.applicant_name || "").toLowerCase().includes(term) ||
      String(normalizedApplicant.job_seeker_id).includes(term)
    );
  }).map(normalizeApplicant);

  const handlePieClick = (_: unknown, index: number) => {
    if (pieData[index]) {
      setSelectedJobpost(pieData[index].jobpost_id);
    }
  };

  const handleApplicantsBarClick = (_: unknown, index: number) => {
    if (applicantsBarData[index]) {
      setSelectedJobpost((current) => (
        current === applicantsBarData[index].key ? "all" : applicantsBarData[index].key
      ));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Tabs
          value={chartView}
          onValueChange={(value) => setChartView(value as ChartView)}
          className="w-full"
        >
          <div className="border-b border-border/70 bg-gradient-to-r from-primary/5 via-background to-success/5 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div>
                  <h3 className="font-display text-lg font-semibold text-card-foreground">
                    {t("jobpostInsights")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("jobpostInsightsDesc")}
                  </p>
                </div>

                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-secondary/80 p-1 sm:w-[420px]">
                  <TabsTrigger
                    value="applicants"
                    className="min-h-[2.75rem] rounded-lg px-4 py-2 text-xs font-semibold leading-tight sm:text-sm"
                  >
                    {t("applicantsByJobpost")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="wage"
                    className="min-h-[2.75rem] rounded-lg px-4 py-2 text-xs font-semibold leading-tight sm:text-sm"
                  >
                    {t("agreedWageByJobpost")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  {pieData.length} {t("jobposts")}
                </div>
                <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  {totalApplicants} {t("applicants")}
                </div>
                <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  {totalHiredApplications} {t("hiredApplications")}
                </div>
                <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  {formatCurrency(totalPieValue)} {t("totalWage")}
                </div>
                {selectedJobpost !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedJobpost("all")}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                  >
                    {t("resetFilter")}: {selectedLabel}
                  </button>
                )}
              </div>
            </div>
          </div>

          <TabsContent value="applicants" className="mt-0 p-4 sm:p-5">
            {summaryLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
            {summaryError && !summaryLoading && <p className="text-sm text-destructive">{t("loadApplicantsChartError")}</p>}
            {!summaryLoading && !summaryError && applicantsBarData.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
            {!summaryLoading && !summaryError && applicantsBarData.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-card-foreground">{t("applicantsByJobpost")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("tapToShowJobpostWage")}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedJobpost === "all" ? t("showingAllJobposts") : `${t("selected")}: ${selectedLabel}`}
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-secondary/35 px-3 py-2 text-sm text-muted-foreground">
                  {activeApplicantsBar
                    ? `${activeApplicantsBar.label}: ${t("wageAmountFromJobpost")} ${formatCurrency(activeApplicantsBar.wageAmount)}`
                    : t("tapToShowJobpostWage")}
                </div>

                <div className="rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4">
                  <div className="h-[260px] sm:h-[320px] lg:h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={applicantsBarData} margin={{ top: 8, left: 8, right: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "hsl(220 9% 46%)", fontSize: 11 }}
                          interval={0}
                          height={40}
                          tickFormatter={(value: string) => value}
                        />
                        <YAxis tick={{ fill: "hsl(220 9% 46%)", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(
                            value: number,
                            _name: string,
                            props: { payload?: { label?: string; wageAmount?: number } },
                          ) => [
                            `${value} ${t("applicants")} | ${t("wageAmountFromJobpost")} ${formatCurrency(props.payload?.wageAmount ?? 0)}`,
                            props.payload?.label ?? t("jobpost"),
                          ]}
                        />
                        <Bar
                          dataKey="applicants"
                          radius={[6, 6, 0, 0]}
                          onClick={handleApplicantsBarClick}
                          onMouseEnter={(_, index) => setHoveredApplicantsJobpost(applicantsBarData[index]?.key ?? null)}
                          onMouseLeave={() => setHoveredApplicantsJobpost(null)}
                          style={{ cursor: "pointer" }}
                        >
                          {applicantsBarData.map((item) => (
                            <Cell
                              key={item.key}
                              fill={item.fill}
                              opacity={selectedJobpost === "all" || selectedJobpost === item.key ? 1 : 0.35}
                              stroke={selectedJobpost === item.key ? "hsl(220 26% 14%)" : "transparent"}
                              strokeWidth={selectedJobpost === item.key ? 2 : 0}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wage" className="mt-0 p-4 sm:p-5">
            {summaryLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
            {summaryError && !summaryLoading && <p className="text-sm text-destructive">{t("loadChartDataError")}</p>}
            {!summaryLoading && !summaryError && pieData.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
            {!summaryLoading && !summaryError && pieData.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-card-foreground">{t("agreedWageByJobpost")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("wageSlicesFromHires")}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedJobpost === "all" ? t("showingAllJobposts") : `${t("selected")}: ${selectedLabel}`}
                  </div>
                </div>

                <div className="grid gap-4 rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-start">
                  <div className="h-[260px] sm:h-[320px] lg:h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={isMobile ? 84 : 120}
                          dataKey="value"
                          onClick={handlePieClick}
                          style={{ cursor: "pointer" }}
                          label={false}
                          labelLine={false}
                          paddingAngle={pieData.length > 1 ? 1 : 0}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={entry.jobpost_id}
                              fill={COLORS[index % COLORS.length]}
                              opacity={
                                selectedJobpost === "all" || selectedJobpost === entry.jobpost_id
                                  ? 1
                                  : 0.3
                              }
                              stroke={
                                selectedJobpost === entry.jobpost_id
                                  ? "hsl(220 26% 14%)"
                                  : "hsl(0 0% 100%)"
                              }
                              strokeWidth={selectedJobpost === entry.jobpost_id ? 3 : 1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(
                            value: number | string,
                            _name: string,
                            props: { payload?: { applicant_count?: number; hired_application_count?: number } },
                          ) => [
                            language === "th"
                              ? `${formatCurrency(Number(value))} จาก ${props.payload?.hired_application_count ?? 0} ${t("hiredApplications")}`
                              : `${formatCurrency(Number(value))} from ${props.payload?.hired_application_count ?? 0} ${t("hiredApplications")}`,
                            `${t("applicants")}: ${props.payload?.applicant_count ?? 0}`,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:max-h-[360px] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
                    {pieData.map((item, index) => {
                      const isSelected = selectedJobpost === item.jobpost_id;
                      const percentage = totalPieValue > 0 ? Math.round((item.value / totalPieValue) * 100) : 0;

                      return (
                        <button
                          key={item.jobpost_id}
                          type="button"
                          onClick={() => setSelectedJobpost((current) => (current === item.jobpost_id ? "all" : item.jobpost_id))}
                          className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <span className="break-words text-sm leading-snug text-card-foreground">
                                  {item.name}
                                </span>
                                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                                  {percentage}%
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span>{item.applicant_count} {t("applicants")}</span>
                                <span>{item.hired_application_count} {t("hiredApplications")}</span>
                                <span>{formatCurrency(item.value)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedJobpost}
            onChange={(e) => setSelectedJobpost(e.target.value)}
            className="h-10 w-full rounded-lg bg-secondary px-3 text-sm text-foreground outline-none ring-0 transition-shadow focus:ring-2 focus:ring-ring sm:w-72"
          >
            <option value="all">{t("allJobposts")}</option>
            {(summaryData || []).map((summary) => (
              <option key={summary.jobpost_id} value={summary.jobpost_id}>
                {summary.job_title} ({formatCurrency(summary.total_agreed_wage)})
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchApplicantOrJob")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <h3 className="mb-3 font-display font-semibold text-card-foreground">
          {t("applicantsAll")} {selectedJobpost !== "all" ? `- ${selectedLabel}` : `- ${t("all")}`}
        </h3>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[28%] py-2 pr-4 text-left font-medium text-muted-foreground">{t("applicantName")}</th>
                <th className="w-[24%] py-2 pr-4 text-left font-medium text-muted-foreground">{t("appliedFor")}</th>
                <th className="w-[22%] py-2 pr-4 text-left font-medium text-muted-foreground">{t("province")}</th>
                <th className="w-[26%] py-2 text-left font-medium text-muted-foreground">{t("applied")}</th>
              </tr>
            </thead>
            <tbody>
              {appLoading && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">{t("loading")}</td></tr>
              )}
              {appError && !appLoading && (
                <tr><td colSpan={4} className="py-6 text-center text-destructive">{t("loadApplicantsError")}</td></tr>
              )}
              {!appLoading && !appError && filtered.map((applicant) => (
                <tr key={applicant.job_application_id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/50">
                  <td className="py-3 pr-4 font-medium text-card-foreground">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{applicant.applicant_name}</span>
                      {getApplicationStatusBadge(applicant, t)}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{applicant.job_title}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{applicant.province}</td>
                  <td className="py-3 text-muted-foreground">{formatAppliedDate(applicant.applied_at, language)}</td>
                </tr>
              ))}
              {!appLoading && !appError && filtered.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">{t("noApplicantsFound")}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {appLoading && <p className="text-center text-muted-foreground">{t("loading")}</p>}
          {appError && !appLoading && <p className="text-center text-destructive">{t("loadApplicantsError")}</p>}
          {!appLoading && !appError && filtered.map((applicant) => (
            <div key={applicant.job_application_id} className="space-y-3 rounded-lg border border-border p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-card-foreground">{applicant.applicant_name}</p>
                  {getApplicationStatusBadge(applicant, t)}
                </div>
                <p className="break-words text-sm text-muted-foreground">{applicant.job_title}</p>
              </div>
              <div className="grid gap-1 text-xs text-muted-foreground">
                <p>{t("province")}: {applicant.province || "-"}</p>
                <p>{t("applied")}: {formatAppliedDate(applicant.applied_at, language)}</p>
              </div>
            </div>
          ))}
          {!appLoading && !appError && filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">{t("noApplicantsFound")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobpostTab;