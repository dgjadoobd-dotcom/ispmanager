import { cn } from "@/lib/utils";
import { NavLink, NavLinkProps } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  expandedGroup: string | null;
  setExpandedGroup: React.Dispatch<React.SetStateAction<string | null>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return safe defaults when used outside SidebarProvider
    return {
      open: true,
      setOpen: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
      expandedGroup: null,
      setExpandedGroup: (() => {}) as React.Dispatch<React.SetStateAction<string | null>>,
    };
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openState, setOpenState] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, expandedGroup, setExpandedGroup }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarBody = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <>
      <DesktopSidebar className={className}>{children}</DesktopSidebar>
      <MobileSidebar className={className}>{children}</MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen sticky top-0 px-2 py-4 hidden md:flex md:flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden relative",
        className
      )}
      animate={{
        width: open ? "240px" : "60px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-14 right-0 translate-x-1/2 z-30 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-accent transition-colors shadow-md"
      >
        {open ? (
          <ChevronLeft className="h-3.5 w-3.5 text-sidebar-foreground/70" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/70" />
        )}
      </button>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div className={cn("flex md:hidden")} {...props}>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-sidebar border-r border-sidebar-border p-4 flex flex-col",
                className
              )}
            >
              <div className="flex justify-end mb-4">
                <button onClick={() => setOpen(false)} className="text-sidebar-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  active,
  ...props
}: {
  link: Links;
  className?: string;
  active?: boolean;
  props?: NavLinkProps;
}) => {
  const { open } = useSidebar();
  return (
    <NavLink
      to={link.href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 group",
        "hover:bg-sidebar-accent/80",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
        className
      )}
      {...props}
    >
      <span className="shrink-0">{link.icon}</span>
      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="truncate whitespace-nowrap text-[13px]"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};

export const SidebarGroupLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open } = useSidebar();
  return (
    <motion.div
      animate={{
        display: open ? "block" : "none",
        opacity: open ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        "px-2 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const SidebarGroup = ({
  label,
  icon,
  children,
  defaultOpen = false,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) => {
  const { open: sidebarOpen, expandedGroup, setExpandedGroup } = useSidebar();

  // Accordion: only this group is expanded if its label matches
  const isExpanded = sidebarOpen ? expandedGroup === label : false;

  // If defaultOpen and no group is expanded yet, auto-expand this one
  React.useEffect(() => {
    if (defaultOpen && expandedGroup === null) {
      setExpandedGroup(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = () => {
    if (!sidebarOpen) return;
    setExpandedGroup(isExpanded ? null : label);
  };

  return (
    <div className={cn("", className)}>
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
          "hover:bg-sidebar-accent/80",
          isExpanded
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
        )}
      >
        <span className="shrink-0">{icon}</span>
        <motion.span
          animate={{
            display: sidebarOpen ? "inline-block" : "none",
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="truncate whitespace-nowrap text-[13px] flex-1 text-left"
        >
          {label}
        </motion.span>
        <motion.span
          animate={{
            display: sidebarOpen ? "inline-block" : "none",
            opacity: sidebarOpen ? 1 : 0,
            rotate: isExpanded ? 180 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden pl-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
