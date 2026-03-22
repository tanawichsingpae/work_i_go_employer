import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import EmployerSidebar from "@/components/dashboard/EmployerSidebar";
import SummaryCards from "@/components/dashboard/SummaryCards";
import JobpostTab from "@/components/dashboard/JobpostTab";
import EmploymentsTab from "@/components/dashboard/EmploymentsTab";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/i18n/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  // ย้าย state มาไว้ระดับบน
  const [tab, setTab] = useState("jobpost");

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">

        <EmployerSidebar activeMenu="dashboard" onMenuChange={() => {}} />

        <div className="flex min-w-0 flex-1 flex-col">

          <header className="flex min-h-14 items-center justify-between border-b border-border bg-card px-4">

            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />

              <h1 className="font-display text-lg font-semibold">
                {t("dashboard")}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white">
                TC
              </div>
            </div>

          </header>

          <main className="flex-1 p-6">

            <div className="mx-auto max-w-7xl space-y-6">

              <SummaryCards />

              <Tabs value={tab} onValueChange={setTab}>

                <TabsList className="grid w-full grid-cols-2">

                  <TabsTrigger value="jobpost">
                    {t("jobpost")}
                  </TabsTrigger>

                  <TabsTrigger value="employments">
                    {t("employments")}
                  </TabsTrigger>

                </TabsList>

                <TabsContent value="jobpost">
                  <JobpostTab />
                </TabsContent>

                <TabsContent value="employments">
                  <EmploymentsTab />
                </TabsContent>

              </Tabs>

            </div>

          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;