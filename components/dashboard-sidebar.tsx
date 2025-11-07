"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CheckSquare,
  DollarSign,
  Calendar,
  UserCog,
  FileText
} from "lucide-react";

const sidebarItems = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Alumnos",
    href: "/dashboard/alumnos",
    icon: Users,
  },
  {
    title: "Instructores",
    href: "/dashboard/instructores",
    icon: UserCog,
  },
  {
    title: "Cursos",
    href: "/dashboard/cursos",
    icon: GraduationCap,
  },
  {
    title: "Matrículas",
    href: "/dashboard/matriculas",
    icon: FileText,
  },
  {
    title: "Pagos",
    href: "/dashboard/pagos",
    icon: DollarSign,
  },
  {
    title: "Asistencia",
    href: "/dashboard/asistencia",
    icon: CheckSquare,
  },
  {
    title: "Eventos",
    href: "/dashboard/eventos",
    icon: Calendar,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="mb-2 px-3 py-2">
          <h2 className="text-lg font-semibold">Navegación</h2>
          <p className="text-xs text-muted-foreground">Gestión del sistema</p>
        </div>

        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
