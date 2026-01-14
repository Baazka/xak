// config/menu.ts
import React from "react";
import {
  CalenderIcon,
  CartIcon,
  GridIcon,
  UserCircleIcon,
  TaskIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  ChatIcon,
  CallIcon,
  MailIcon,
  PieChartIcon,
  PlugInIcon,
  BoxCubeIcon,
} from "../../icons";
import { RoleCode } from "./roleHome";

export type MenuItem = {
  key: string;
  name: string;
  icon?: React.ReactNode;
  path?: string;
  permissions?: string[];
  section: "main" | "support" | "others";
  new?: boolean | undefined;
  subItems?: SubMenuItem[];
};
export type SubMenuItem = {
  key: string;
  name: string;
  path: string;
  new?: boolean | undefined;
  permissions?: string[];
  roles?: RoleCode[];
};

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "dashboard",
    name: "New Dashboard",
    icon: React.createElement(GridIcon),
    section: "main",
    subItems: [
      { key: "ecommerce", name: "Ecommerce", path: "/ecommerce" },
      {
        key: "dashboard1",
        name: "New Dashboard1",
        path: "/dashboard1",
        permissions: ["dashboard.read"],
        roles: ["SUPERADMIN"],
      },
      {
        key: "dashboard2",
        name: "New Dashboard2",
        path: "/dashboard2",
        permissions: ["dashboard.read"],
        roles: ["ADMIN"],
      },
      {
        key: "dashboard3",
        name: "New Dashboard3",
        path: "/dashboard3",
        permissions: ["dashboard.read"],
        roles: ["XAKADMIN"],
      },
      {
        key: "dashboard4",
        name: "New Dashboard4",
        path: "/dashboard4",
        permissions: ["dashboard.read"],
        roles: ["XAKUSER"],
      },
      {
        key: "xakorg",
        name: "Байгууллага",
        path: "/xakorg",
        permissions: ["xakorg.read"],
        roles: ["ADMIN"],
      },
      {
        key: "user",
        name: "User",
        path: "/user",
        permissions: ["user.read"],
      },
    ],
  },
  {
    key: "dashboard_old",
    icon: React.createElement(GridIcon),
    name: "Dashboard",
    section: "main",
    subItems: [
      { key: "ecommerce", name: "Ecommerce", path: "/" },
      { key: "analytics", name: "Analytics", path: "/analytics" },
      { key: "marketing", name: "Marketing", path: "/marketing" },
      { key: "crm", name: "CRM", path: "/crm" },
      { key: "stocks", name: "Stocks", path: "/stocks" },
      { key: "saas", name: "SaaS", path: "/saas" },
      { key: "logistics", name: "Logistics", path: "/logistics" },
      //{ key: "user", name: "User", path: "/user" },
    ],
  },
  {
    key: "ecommerce",
    name: "E-commerce",
    icon: React.createElement(CartIcon),
    section: "main",
    new: true,
    subItems: [
      { key: "products", name: "Products", path: "/products", new: true },
      { key: "add-product", name: "Add Product", path: "/add-product" },
      { key: "billing", name: "Billing", path: "/billing" },
      { key: "invoices", name: "Invoices", path: "/invoices" },
      { key: "single-invoice", name: "Single Invoice", path: "/single-invoice" },
      { key: "create-invoice", name: "Create Invoice", path: "/create-invoice" },
      { key: "transactions", name: "Transactions", path: "/transactions" },
      { key: "single-transaction", name: "Single Transaction", path: "/single-transaction" },
    ],
  },
  {
    key: "calendar",
    icon: React.createElement(CalenderIcon),
    name: "Calendar",
    section: "main",
    path: "/calendar",
  },
  {
    key: "profile",
    icon: React.createElement(UserCircleIcon),
    name: "User Profile",
    section: "main",
    path: "/profile",
  },
  {
    key: "tasks",
    name: "Task",
    icon: React.createElement(TaskIcon),
    section: "main",
    subItems: [
      { key: "list", name: "List", path: "/task-list" },
      { key: "kanban", name: "Kanban", path: "/task-kanban" },
    ],
  },
  {
    key: "forms",
    name: "Forms",
    icon: React.createElement(ListIcon),
    section: "main",
    subItems: [
      { key: "form-elements", name: "Form Elements", path: "/form-elements" },
      { key: "form-layout", name: "Form Layout", path: "/form-layout" },
    ],
  },
  {
    key: "tables",
    name: "Tables",
    icon: React.createElement(TableIcon),
    section: "main",
    subItems: [
      { key: "basic-tables", name: "Basic Tables", path: "/basic-tables" },
      { key: "data-tables", name: "Data Tables", path: "/data-tables" },
    ],
  },
  {
    key: "pages",
    name: "Pages",
    icon: React.createElement(PageIcon),
    section: "main",
    subItems: [
      { key: "file-manager", name: "File Manager", path: "/file-manager" },
      { key: "pricing-tables", name: "Pricing Tables", path: "/pricing-tables" },
      { key: "faq", name: "FAQ", path: "/faq" },
      { key: "api-keys", name: "API Keys", path: "/api-keys" },
      { key: "integrations", name: "Integrations", path: "/integrations" },
      { key: "blank-page", name: "Blank Page", path: "/blank" },
      { key: "error-404", name: "404 Error", path: "/error-404" },
      { key: "error-500", name: "500 Error", path: "/error-500" },
      { key: "error-503", name: "503 Error", path: "/error-503" },
      { key: "coming-soon", name: "Coming Soon", path: "/coming-soon" },
      { key: "maintenance", name: "Maintenance", path: "/maintenance" },
      { key: "success", name: "Success", path: "/success" },
    ],
  },
  {
    key: "chat",
    icon: React.createElement(ChatIcon),
    name: "Chat",
    path: "/chat",
    section: "support",
  },
  {
    key: "support",
    icon: React.createElement(CallIcon),
    name: "Support",
    section: "support",
    subItems: [
      { key: "support-list", name: "Support List", path: "/support-list" },
      { key: "support-reply", name: "Support Reply", path: "/support-reply" },
    ],
  },
  {
    key: "email",
    icon: React.createElement(MailIcon),
    name: "Email",
    section: "support",
    subItems: [
      { key: "inbox", name: "Inbox", path: "/inbox" },
      { key: "inbox-details", name: "Details", path: "/inbox-details" },
    ],
  },
  {
    key: "charts",
    icon: React.createElement(PieChartIcon),
    name: "Charts",
    section: "others",
    subItems: [
      { key: "line-chart", name: "Line Chart", path: "/line-chart" },
      { key: "bar-chart", name: "Bar Chart", path: "/bar-chart" },
      { key: "pie-chart", name: "Pie Chart", path: "/pie-chart" },
    ],
  },
  {
    key: "ui_elements",
    icon: React.createElement(BoxCubeIcon),
    name: "UI Elements",
    section: "others",
    subItems: [
      { key: "alerts", name: "Alerts", path: "/alerts" },
      { key: "avatars", name: "Avatar", path: "/avatars" },
      { key: "badge", name: "Badge", path: "/badge" },
      { key: "breadcrumb", name: "Breadcrumb", path: "/breadcrumb" },
      { key: "buttons", name: "Buttons", path: "/buttons" },
      { key: "buttons-group", name: "Buttons Group", path: "/buttons-group" },
      { key: "cards", name: "Cards", path: "/cards" },
      { key: "carousel", name: "Carousel", path: "/carousel" },
      { key: "dropdowns", name: "Dropdowns", path: "/dropdowns" },
      { key: "images", name: "Images", path: "/images" },
      { key: "links", name: "Links", path: "/links" },
      { key: "list", name: "List", path: "/list" },
      { key: "modals", name: "Modals", path: "/modals" },
      { key: "notification", name: "Notification", path: "/notifications" },
      { key: "pagination", name: "Pagination", path: "/pagination" },
      { key: "popovers", name: "Popovers", path: "/popovers" },
      { key: "progress-bar", name: "Progressbar", path: "/progress-bar" },
      { key: "ribbons", name: "Ribbons", path: "/ribbons" },
      { key: "spinners", name: "Spinners", path: "/spinners" },
      { key: "tabs", name: "Tabs", path: "/tabs" },
      { key: "tooltips", name: "Tooltips", path: "/tooltips" },
      { key: "videos", name: "Videos", path: "/videos" },
    ],
  },
  {
    key: "authentication",
    icon: React.createElement(PlugInIcon),
    name: "Authentication",
    section: "others",
    subItems: [
      { key: "signin", name: "Sign In", path: "/signin" },
      { key: "signup", name: "Sign Up", path: "/signup" },
      { key: "reset-password", name: "Reset Password", path: "/reset-password" },
      {
        key: "two-step-verification",
        name: "Two Step Verification",
        path: "/two-step-verification",
      },
    ],
  },
];
