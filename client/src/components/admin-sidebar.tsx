import {
  LayoutDashboard,
  Users,
  Video,
  UtensilsCrossed,
  Calendar,
  BarChart3,
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin" },
  { title: "Clients", icon: Users, url: "/admin/clients" },
  { title: "Videos", icon: Video, url: "/admin/videos" },
  { title: "Diet Plans", icon: UtensilsCrossed, url: "/admin/diet" },
  { title: "Live Sessions", icon: Calendar, url: "/admin/sessions" },
  { title: "Analytics", icon: BarChart3, url: "/admin/analytics" },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-lg">
            FitPro Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
