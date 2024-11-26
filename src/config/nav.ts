import {
  BarChart3,
  Bell,
  CandlestickChart,
  LayoutDashboard,
  LineChart,
  Settings,
} from 'lucide-react';

export const mainNav = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Portfolio',
    href: '/portfolio',
    icon: LineChart,
  },
  {
    title: 'Market',
    href: '/market',
    icon: CandlestickChart,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: Bell,
  },
];

export const userNav = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
