import { useState, useMemo } from 'react'
import type { ColorToken } from '~/types/chroma'
import { cn } from '~/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import {
  LayoutDashboard,
  Users,
  Settings,
  Search,
  Moon,
  Sun,
  CreditCard,
  Activity,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react'

interface PreviewDashboardProps {
  colors: ColorToken[]
}

export function PreviewDashboard({ colors }: PreviewDashboardProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Dynamic Theme Engine - generates CSS variables from color tokens
  const themeStyles = useMemo(() => {
    // Helper to extract color by role
    const get = (rolePart: string) => {
      const token = colors.find((c) => c.role?.toLowerCase().includes(rolePart))
      // Fallback colors
      if (!token) return isDarkMode ? '#1e293b' : '#ffffff'
      return isDarkMode ? token.darkHex || token.hex : token.hex
    }

    const primary = get('primary')
    const secondary = get('secondary')
    const background = get('background')
    const surface = get('surface')
    const text = get('text')
    const accent = get('accent')

    const destructive = '#ef4444'
    const border = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    const input = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    const muted = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

    // Contrast Logic Helpers
    const primaryFg = isDarkMode ? background : '#ffffff'
    const secondaryFg = isDarkMode ? '#ffffff' : background
    const accentFg = isDarkMode ? '#ffffff' : background

    return {
      '--background': background,
      '--foreground': text,
      '--card': surface,
      '--card-foreground': text,
      '--popover': surface,
      '--popover-foreground': text,
      '--primary': primary,
      '--primary-foreground': primaryFg,
      '--secondary': secondary,
      '--secondary-foreground': secondaryFg,
      '--muted': muted,
      '--muted-foreground': text,
      '--accent': accent,
      '--accent-foreground': accentFg,
      '--destructive': destructive,
      '--destructive-foreground': '#ffffff',
      '--border': border,
      '--input': input,
      '--ring': primary,
      '--radius': '0.75rem',
    } as React.CSSProperties
  }, [colors, isDarkMode])

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Users, label: 'Customers', active: false },
    { icon: CreditCard, label: 'Billing', active: false },
    { icon: Activity, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

  const stats = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign },
    { title: 'Subscriptions', value: '+2350', change: '+180.1%', icon: Users },
    { title: 'Sales', value: '+12,234', change: '+19%', icon: CreditCard },
    { title: 'Active Now', value: '+573', change: '+201', icon: Activity },
  ]

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden border shadow-2xl"
      style={{ ...themeStyles, borderColor: 'var(--border)' }}
    >
      <div
        className="w-full h-full flex flex-col overflow-hidden transition-colors duration-300 font-sans"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-6 justify-between backdrop-blur"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
        >
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span>Acme Inc</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 opacity-50" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-64 rounded-md border px-3 py-1 pl-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
                style={{
                  borderColor: 'var(--input)',
                  backgroundColor: 'transparent',
                }}
              />
            </div>

            <div
              className="flex items-center gap-2 border-l border-r px-4 mx-2"
              style={{ borderColor: 'var(--input)' }}
            >
              <Sun className="h-4 w-4 opacity-50" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Moon className="h-4 w-4 opacity-50" />
            </div>

            <div
              className="h-8 w-8 rounded-full border"
              style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--input)' }}
            />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav
            className="hidden w-60 flex-col gap-2 border-r p-4 md:flex"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', opacity: 0.5 }}
          >
            {navItems.map((item, i) => (
              <button
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                  item.active ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                )}
                style={
                  item.active
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }
                    : {}
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}

            <Card
              className="mt-auto border-none"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Pro Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs opacity-90">
                <p className="mb-2">You are using 80% of your plan.</p>
                <div
                  className="h-1 w-full rounded-full"
                  style={{ backgroundColor: 'var(--primary-foreground)', opacity: 0.3 }}
                >
                  <div
                    className="h-1 w-[80%] rounded-full"
                    style={{ backgroundColor: 'var(--primary-foreground)' }}
                  />
                </div>
              </CardContent>
            </Card>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="hidden sm:flex">
                  Download
                </Button>
                <Button>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium opacity-80">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 opacity-50" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs opacity-60 mt-1">
                      <span style={{ color: 'var(--primary)' }} className="font-medium">
                        {stat.change}
                      </span>{' '}
                      from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <p className="text-sm opacity-60">Monthly revenue breakdown.</p>
                </CardHeader>
                <CardContent className="pl-2">
                  {/* CSS Only Bar Chart Simulation */}
                  <div className="h-[240px] w-full flex items-end justify-between gap-2 px-4 pt-8">
                    {[35, 78, 45, 90, 65, 85, 40, 95, 50, 70, 80, 60].map((h, i) => (
                      <div
                        key={i}
                        className="group relative flex-1 flex flex-col justify-end items-center gap-2 h-full"
                      >
                        <div
                          className="w-full rounded-t-sm transition-all hover:opacity-80"
                          style={{
                            height: `${h}%`,
                            backgroundColor: 'var(--primary)',
                            opacity: i % 2 === 0 ? 1 : 0.6,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <p className="text-sm opacity-60">You made 265 sales this month.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div
                          className="relative h-9 w-9 rounded-full flex items-center justify-center border"
                          style={{ backgroundColor: 'var(--secondary)' }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: 'var(--secondary-foreground)' }}
                          >
                            U{i}
                          </span>
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">User Name {i}</p>
                          <p className="text-xs opacity-60">user{i}@example.com</p>
                        </div>
                        <div className="ml-auto font-medium text-sm">
                          +${(Math.random() * 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
