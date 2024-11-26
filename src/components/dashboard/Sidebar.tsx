'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Add Assets',
    href: '/dashboard/add-assets',
    icon: PlusIcon,
  },
  {
    name: 'Stocks',
    href: '/dashboard/stocks',
    icon: ArrowTrendingUpIcon,
  },
  {
    name: 'Crypto',
    href: '/dashboard/crypto',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 space-y-1 bg-white">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
