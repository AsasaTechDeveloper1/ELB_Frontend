import * as Icons from "../icons";
import { FaHome, FaFileAlt, FaChartBar, FaBell, FaHourglassHalf, FaClipboardList, FaPlane, FaPaperPlane, FaMobileAlt } from 'react-icons/fa';

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      // {
      //   title: "Dashboard",
      //   icon: Icons.HomeIcon,
      //   items: [
      //     {
      //       title: "eCommerce",
      //       url: "/",
      //     },
      //   ],
      // },
      {
        title: "Dashboard",
        url: "/",
        icon: FaHome,
        // icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FaFileAlt,
        items: [],
      },
      {
        title: "Charts",
        url: "/ChartsHandler",
        icon: FaChartBar,
        items: [],
      },
      {
        title: "Notices",
        url: "/notices",
        icon: FaBell,
        items: [],
      },
      {
        title: "Logs",
        url: "/logs",
        icon: FaClipboardList,
        items: [],
      },
      {
        title: "Deferral",
        url: "/deferral",
        icon: FaHourglassHalf,
        items: [],
      },
      // {
      //   title: "Calendar",
      //   url: "/calendar",
      //   icon: Icons.Calendar,
      //   items: [],
      // },
      // {
      //   title: "Profile",
      //   url: "/profile",
      //   icon: Icons.User,
      //   items: [],
      // },
      // {
      //   title: "Forms",
      //   icon: Icons.Alphabet,
      //   items: [
      //     {
      //       title: "Form Elements",
      //       url: "/forms/form-elements",
      //     },
      //     {
      //       title: "Form Layout",
      //       url: "/forms/form-layout",
      //     },
      //   ],
      // },
      // {
      //   title: "Tables",
      //   url: "/tables",
      //   icon: Icons.Table,
      //   items: [
      //     {
      //       title: "Tables",
      //       url: "/tables",
      //     },
      //   ],
      // },
      // {
      //   title: "Pages",
      //   icon: Icons.Alphabet,
      //   items: [
      //     {
      //       title: "Settings",
      //       url: "/pages/settings",
      //     },
      //   ],
      // },
    ],
  },
  {
    label: "Admin Access",
    items: [
       { 
        title: "AirCrafts",
        url: "/aircraft",
        icon: FaPlane,
        items: [],
      },
      {
        title: "Flights",
        url: "/flights",
        icon: FaPaperPlane,
        items: [],
      },
      {
        title: "Devices",
        url: "/devices",
        icon: FaMobileAlt,
        items: [],
      }
      // {
      //   title: "Charts",
      //   icon: Icons.PieChart,
      //   items: [
      //     {
      //       title: "Basic Chart",
      //       url: "/charts/basic-chart",
      //     },
      //   ],
      // },
      // {
      //   title: "UI Elements",
      //   icon: Icons.FourCircle,
      //   items: [
      //     {
      //       title: "Alerts",
      //       url: "/ui-elements/alerts",
      //     },
      //     {
      //       title: "Buttons",
      //       url: "/ui-elements/buttons",
      //     },
      //   ],
      // },
      // {
      //   title: "Authentication",
      //   icon: Icons.Authentication,
      //   items: [
      //     {
      //       title: "Sign In",
      //       url: "/auth/sign-in",
      //     },
      //   ],
      // },
    ],
  },
];
