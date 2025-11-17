import { Home, Users, Video, UtensilsCrossed, Calendar, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/trainer/dashboard" },
  { title: "My Clients", icon: Users, url: "/trainer/clients" },
  { title: "Live Sessions", icon: Calendar, url: "/trainer/sessions" },
  { title: "Workout Plans", icon: UtensilsCrossed, url: "/trainer/workouts" },
  { title: "Diet Plans", icon: UtensilsCrossed, url: "/trainer/diet" },
  { title: "Video Library", icon: Video, url: "/trainer/videos" },
  { title: "My Analytics", icon: BarChart3, url: "/trainer/analytics" },
];

export function TrainerSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-lg">
            FitPro Trainer
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-home">
                  <Link href="/admin">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
