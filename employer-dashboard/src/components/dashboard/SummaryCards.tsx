import { FileText, Users, Briefcase, CheckCircle, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKeys } from "@/i18n/en";

type Kpis = {
  active_jobs: number;
  total_applications: number;
  workers_hired: number;
  completed_jobs: number;
  open_positions: number;
};

const SummaryCards = () => {
  const { data, isLoading, error } = useQuery<Kpis>({
    queryKey: ["employer-kpis"],
    queryFn: () => fetchJson<Kpis>("/api/employer/kpis"),
  });
  const { t } = useLanguage();

  const cards: Array<{ titleKey: TranslationKeys; value: number | string; icon: typeof FileText; descKey: TranslationKeys }> = [
    { titleKey: "activeJobs", value: data?.active_jobs ?? "--", icon: FileText, descKey: "liveJobPosts" },
    { titleKey: "totalApplications", value: data?.total_applications ?? "--", icon: Users, descKey: "allRecentApplications" },
    { titleKey: "workersHired", value: data?.workers_hired ?? "--", icon: Briefcase, descKey: "confirmedHires" },
    { titleKey: "completedJobs", value: data?.completed_jobs ?? "--", icon: CheckCircle, descKey: "finishedPlacements" },
    { titleKey: "openPositions", value: data?.open_positions ?? "--", icon: Target, descKey: "rolesStillAvailable" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.titleKey} className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{t(card.titleKey)}</p>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 break-words text-xl font-display font-semibold text-card-foreground sm:text-2xl">
            {isLoading ? "..." : card.value}
          </p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
            {error ? t("loadError") : t(card.descKey)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;