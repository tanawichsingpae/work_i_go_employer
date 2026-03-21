import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchJson } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

type Daily = { day: string; applications: number };

const ApplicantsChart = () => {
  const { data, isLoading, error } = useQuery<Daily[]>({
    queryKey: ["applications-trend"],
    queryFn: () => fetchJson<Daily[]>("/api/employer/applications/trend"),
  });
  const { t } = useLanguage();
  const chartData = data || [];

  return (
    <div className="rounded-lg bg-card p-5 shadow-sm border border-border">
      <h3 className="font-display font-semibold text-card-foreground mb-4">{t("applicationsTrend")}</h3>
      {isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
      {error && !isLoading && <p className="text-sm text-destructive">{t("loadError")}</p>}
      {!isLoading && !error && chartData.length === 0 && <p className="text-sm text-muted-foreground">{t("noData")}</p>}
      {!isLoading && !error && chartData.length > 0 && (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="applications" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} name={t("applications")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ApplicantsChart;