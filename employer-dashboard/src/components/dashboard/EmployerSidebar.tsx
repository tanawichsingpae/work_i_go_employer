import {
  LayoutDashboard,
  Building2,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/i18n/LanguageContext";

interface EmployerSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const EMPLOYER_HOME_URL = "https://workigo-pan.vercel.app/employer_home.html";

const menuItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
];

const EmployerSidebar = ({ activeMenu, onMenuChange }: EmployerSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useLanguage();

  const handleBackToEmployerHome = () => {
    window.location.href = EMPLOYER_HOME_URL;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-sidebar-foreground" />
            <span className="font-display font-bold text-lg text-sidebar-foreground">JobPortal</span>
          </div>
        ) : (
          <Building2 className="h-6 w-6 text-sidebar-foreground mx-auto" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">{t("mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeMenu === item.id}
                    onClick={() => onMenuChange(item.id)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.id === "dashboard" ? t("dashboard") : item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleBackToEmployerHome}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              {!collapsed && <span>{t("backToEmployerHome")}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EmployerSidebar;