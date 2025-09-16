'use client'

/**
 * Main navigation component with sidebar and mobile menu
 */

import React, { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { useNavigation, useSidebar } from '@/contexts/NavigationContext'
import { NavigationItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

interface NavigationProps {
  className?: string
  showBrand?: boolean
  brandText?: string
  brandHref?: string
}

export function Navigation({
  className,
  showBrand = true,
  brandText = "Party-Time",
  brandHref = "/dashboard"
}: NavigationProps) {
  const { getFilteredNavigation, isItemActive } = useNavigation()
  const { collapsed, mobileOpen, closeMobile } = useSidebar()
  const navigation = getFilteredNavigation()

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-30",
          collapsed ? "lg:w-16" : "lg:w-64",
          className
        )}
      >
        <div className="flex flex-col bg-white border-r border-gray-200 flex-1 min-h-0">
          {/* Brand */}
          {showBrand && (
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Link
                href={brandHref}
                className={cn(
                  "flex items-center space-x-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <Home className="h-8 w-8 text-blue-600 flex-shrink-0" />
                {!collapsed && <span>{brandText}</span>}
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                collapsed={collapsed}
                isActive={isItemActive(item)}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={closeMobile}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={closeMobile}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  {/* Mobile Brand */}
                  {showBrand && (
                    <div className="flex h-16 shrink-0 items-center">
                      <Link
                        href={brandHref}
                        className="flex items-center space-x-3 text-xl font-bold text-gray-900"
                        onClick={closeMobile}
                      >
                        <Home className="h-8 w-8 text-blue-600" />
                        <span>{brandText}</span>
                      </Link>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex flex-1 flex-col space-y-1">
                    {navigation.map((item) => (
                      <NavigationItemComponent
                        key={item.id}
                        item={item}
                        collapsed={false}
                        isActive={isItemActive(item)}
                        isMobile
                        onNavigate={closeMobile}
                      />
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

interface NavigationItemComponentProps {
  item: NavigationItem
  collapsed: boolean
  isActive: boolean
  isMobile?: boolean
  onNavigate?: () => void
  depth?: number
}

function NavigationItemComponent({
  item,
  collapsed,
  isActive,
  isMobile = false,
  onNavigate,
  depth = 0
}: NavigationItemComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(isActive)
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0

  // Auto-expand if any child is active
  React.useEffect(() => {
    if (hasChildren && item.children) {
      const hasActiveChild = item.children.some(child =>
        pathname.startsWith(child.href)
      )
      if (hasActiveChild) {
        setIsExpanded(true)
      }
    }
  }, [pathname, hasChildren, item.children])

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      setIsExpanded(!isExpanded)
    } else if (onNavigate) {
      onNavigate()
    }
  }

  const itemClasses = cn(
    "group flex items-center rounded-md text-sm font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    depth === 0 ? "px-3 py-2" : "px-3 py-1.5 ml-6",
    isActive
      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
    collapsed && depth === 0 && "justify-center px-2"
  )

  const iconClasses = cn(
    "flex-shrink-0 transition-colors duration-200",
    depth === 0 ? "h-5 w-5" : "h-4 w-4",
    isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600",
    !collapsed && "mr-3"
  )

  if (hasChildren && !collapsed) {
    return (
      <div>
        {/* Parent Item */}
        <button
          onClick={handleClick}
          className={cn(itemClasses, "w-full justify-between")}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center">
            <item.icon className={iconClasses} />
            <span className="truncate">{item.label}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Children */}
        {isExpanded && item.children && (
          <div className="space-y-1 mt-1">
            {item.children.map((child) => (
              <NavigationItemComponent
                key={child.id}
                item={child}
                collapsed={false}
                isActive={pathname === child.href}
                isMobile={isMobile}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Leaf item or collapsed parent
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={itemClasses}
      title={collapsed ? item.label : item.description}
    >
      <item.icon className={iconClasses} />
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {item.badge && !collapsed && (
        <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

/**
 * Mobile navigation toggle button
 */
interface MobileNavToggleProps {
  className?: string
}

export function MobileNavToggle({ className }: MobileNavToggleProps) {
  const { toggleMobile } = useSidebar()

  return (
    <button
      type="button"
      className={cn(
        "-m-2.5 p-2.5 text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md",
        className
      )}
      onClick={toggleMobile}
    >
      <span className="sr-only">Open sidebar</span>
      <Menu className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}

/**
 * Desktop sidebar toggle button
 */
interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { toggle } = useSidebar()

  return (
    <button
      type="button"
      className={cn(
        "hidden lg:flex -m-2.5 p-2.5 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors",
        className
      )}
      onClick={toggle}
    >
      <span className="sr-only">Toggle sidebar</span>
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}