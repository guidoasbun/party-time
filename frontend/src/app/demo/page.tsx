'use client'

import Link from 'next/link'
import {
  LayoutGrid,
  Filter,
  List,
  Grid3X3,
  Users,
  UserPlus,
  MapPin,
  Download,
  Smartphone,
  Palette,
  LayoutDashboard,
  BarChart3,
  Loader,
  Sparkles,
  Navigation,
  QrCode,
  ArrowRight
} from 'lucide-react'

interface DemoPage {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

interface DemoCategory {
  title: string
  description: string
  pages: DemoPage[]
}

const demoCategories: DemoCategory[] = [
  {
    title: 'Event Management',
    description: 'Components for managing and displaying events',
    pages: [
      {
        title: 'Event Cards',
        description: 'Event card component showcase with grid/list view switching',
        href: '/demo/event-cards',
        icon: <LayoutGrid className="h-5 w-5" />
      },
      {
        title: 'Event Filters',
        description: 'Advanced filtering with search, status, types, dates, and budget',
        href: '/demo/event-filters',
        icon: <Filter className="h-5 w-5" />
      },
      {
        title: 'Event List',
        description: 'Event list component demonstration',
        href: '/demo/event-list',
        icon: <List className="h-5 w-5" />
      }
    ]
  },
  {
    title: 'Seating & Layout',
    description: 'Interactive seating chart and venue layout tools',
    pages: [
      {
        title: 'Seating Canvas',
        description: 'Interactive Fabric.js canvas for seating arrangements',
        href: '/demo/seating-canvas',
        icon: <Grid3X3 className="h-5 w-5" />
      },
      {
        title: 'Table Management',
        description: 'Table and seating management interface',
        href: '/demo/table-management',
        icon: <Users className="h-5 w-5" />
      },
      {
        title: 'Guest Assignment',
        description: 'Assign guests to tables and seats',
        href: '/demo/guest-assignment',
        icon: <UserPlus className="h-5 w-5" />
      },
      {
        title: 'Venue Layout',
        description: 'Venue layout visualization and editing',
        href: '/demo/venue-layout',
        icon: <MapPin className="h-5 w-5" />
      },
      {
        title: 'Export Seating',
        description: 'Export seating charts to various formats',
        href: '/demo/export-seating',
        icon: <Download className="h-5 w-5" />
      },
      {
        title: 'Mobile Seating',
        description: 'Mobile-responsive seating interface',
        href: '/demo/mobile-seating',
        icon: <Smartphone className="h-5 w-5" />
      }
    ]
  },
  {
    title: 'UI Components',
    description: 'Core UI components and visual elements',
    pages: [
      {
        title: 'Theme Test',
        description: 'Theme switching between light, dark, and system modes',
        href: '/demo/theme-test',
        icon: <Palette className="h-5 w-5" />
      },
      {
        title: 'Dashboard Sections',
        description: 'Dashboard component sections and layouts',
        href: '/demo/dashboard-sections',
        icon: <LayoutDashboard className="h-5 w-5" />
      },
      {
        title: 'Stats Cards',
        description: 'Statistics and metrics card components',
        href: '/demo/stats-cards',
        icon: <BarChart3 className="h-5 w-5" />
      },
      {
        title: 'Loading & Error States',
        description: 'Loading spinners and error state components',
        href: '/demo/loading-error-states',
        icon: <Loader className="h-5 w-5" />
      },
      {
        title: 'Animations & Transitions',
        description: 'CSS animations and transition effects',
        href: '/demo/animations-transitions',
        icon: <Sparkles className="h-5 w-5" />
      }
    ]
  },
  {
    title: 'Other',
    description: 'Additional demo pages and utilities',
    pages: [
      {
        title: 'Navigation',
        description: 'Full navigation system with sidebar and breadcrumbs',
        href: '/demo/navigation',
        icon: <Navigation className="h-5 w-5" />
      },
      {
        title: 'QR Codes',
        description: 'QR code generation and display',
        href: '/demo/qr-codes',
        icon: <QrCode className="h-5 w-5" />
      }
    ]
  }
]

export default function DemoIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground">Demo Pages</h1>
          <p className="mt-2 text-muted-foreground">
            Explore component demos and UI patterns used in Party-Time
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-12">
          {demoCategories.map((category) => (
            <section key={category.title}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.pages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="group p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {page.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-card-foreground group-hover:text-accent-foreground">
                            {page.title}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
