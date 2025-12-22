import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useSidebarStore } from "@/store/useSidebarStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopNav />
      <motion.main
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">{children}</div>
      </motion.main>
    </div>
  );
}
