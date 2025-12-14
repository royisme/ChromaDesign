import React, { useState, useMemo } from 'react';
import { ColorToken } from '../types';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, Users, Settings, Search, Bell, 
  TrendingUp, Activity, MoreHorizontal, Moon, Sun, 
  CreditCard, DollarSign, ArrowUpRight
} from 'lucide-react';

// --- 1. LOCAL SHADCN UI PRIMITIVES (Simulating components/ui/...) ---

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'secondary', size?: 'default' | 'sm' | 'lg' | 'icon' }>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };
  return (
    <button ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", sizes[size], variants[variant], className)} {...props} />
  );
});
Button.displayName = "Button";

const Switch = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }>(({ className, checked, onCheckedChange, ...props }, ref) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-primary" : "bg-input",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
));
Switch.displayName = "Switch";

// --- 2. MAIN DASHBOARD COMPONENT ---

interface PreviewDashboardProps {
  colors: ColorToken[];
}

export const PreviewDashboard: React.FC<PreviewDashboardProps> = ({ colors }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- 3. DYNAMIC THEME ENGINE ---
  const themeStyles = useMemo(() => {
    // Helper to extract color
    const get = (rolePart: string) => {
      const token = colors.find(c => c.role?.toLowerCase().includes(rolePart));
      // Fallback colors
      if (!token) return isDarkMode ? '#1e293b' : '#ffffff'; 
      return isDarkMode ? (token.darkHex || token.hex) : token.hex;
    };

    const primary = get('primary');
    const secondary = get('secondary');
    const background = get('background');
    const surface = get('surface');
    const text = get('text');
    const accent = get('accent');

    const destructive = '#ef4444';
    const border = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const input = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const muted = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    
    // Contrast Logic Helpers
    const primaryFg = isDarkMode ? background : '#ffffff';
    const secondaryFg = isDarkMode ? '#ffffff' : background;
    const accentFg = isDarkMode ? '#ffffff' : background;

    // We define BOTH the base variable (e.g. --background) AND the Tailwind mapping variable (e.g. --color-background).
    // This ensures that Tailwind v4's 'bg-background' utility picks up our value regardless of how it's resolving.
    return {
      // Background
      '--background': background,
      '--color-background': background,
      
      // Foreground (Text)
      '--foreground': text,
      '--color-foreground': text,
      
      // Card
      '--card': surface,
      '--color-card': surface,
      '--card-foreground': text,
      '--color-card-foreground': text,
      
      // Popover
      '--popover': surface,
      '--color-popover': surface,
      '--popover-foreground': text,
      '--color-popover-foreground': text,
      
      // Primary
      '--primary': primary,
      '--color-primary': primary,
      '--primary-foreground': primaryFg,
      '--color-primary-foreground': primaryFg,
      
      // Secondary
      '--secondary': secondary,
      '--color-secondary': secondary,
      '--secondary-foreground': secondaryFg,
      '--color-secondary-foreground': secondaryFg,
      
      // Muted
      '--muted': muted,
      '--color-muted': muted,
      '--muted-foreground': text,
      '--color-muted-foreground': text,
      
      // Accent
      '--accent': accent,
      '--color-accent': accent,
      '--accent-foreground': accentFg,
      '--color-accent-foreground': accentFg,
      
      // Destructive
      '--destructive': destructive,
      '--color-destructive': destructive,
      '--destructive-foreground': '#ffffff',
      '--color-destructive-foreground': '#ffffff',
      
      // Borders & Inputs
      '--border': border,
      '--color-border': border,
      '--input': input,
      '--color-input': input,
      '--ring': primary,
      '--color-ring': primary,
      
      // Radius
      '--radius': '0.75rem',
    } as React.CSSProperties;
  }, [colors, isDarkMode]);

  return (
    // Outer div: Theme Provider
    <div 
      className="w-full h-full rounded-lg overflow-hidden border border-border shadow-2xl"
      style={themeStyles}
    >
      {/* Inner div: Visual Container 
          We explicitly apply the background and color styles here as a failsafe 
          to ensure immediate visual feedback even if Tailwind classes lag or conflict. 
      */}
      <div 
        className="w-full h-full flex flex-col overflow-hidden transition-colors duration-300 font-sans"
        style={{ 
          backgroundColor: 'var(--background)', 
          color: 'var(--foreground)'
        }}
      >
        
        {/* Header */}
        <header 
            className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 justify-between"
            style={{ borderColor: 'var(--border)' }} // Explicit border color
        >
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span>Acme Inc</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            
            <div className="flex items-center gap-2 border-l border-r border-input px-4 mx-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="h-8 w-8 rounded-full bg-secondary border border-input"></div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="hidden w-60 flex-col gap-2 border-r bg-card/50 p-4 md:flex" style={{ borderColor: 'var(--border)' }}>
            {[
              { icon: LayoutDashboard, label: "Overview", active: true },
              { icon: Users, label: "Customers", active: false },
              { icon: CreditCard, label: "Billing", active: false },
              { icon: Activity, label: "Analytics", active: false },
              { icon: Settings, label: "Settings", active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-left",
                  item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            
            <Card className="mt-auto bg-primary text-primary-foreground border-none">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Pro Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs opacity-90">
                <p className="mb-2">You are using 80% of your plan.</p>
                <div className="h-1 w-full rounded-full bg-primary-foreground/30">
                  <div className="h-1 w-[80%] rounded-full bg-primary-foreground"></div>
                </div>
              </CardContent>
            </Card>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="hidden sm:flex">Download</Button>
                <Button>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { title: "Total Revenue", value: "$45,231.89", change: "+20.1%", icon: DollarSign },
                { title: "Subscriptions", value: "+2350", change: "+180.1%", icon: Users },
                { title: "Sales", value: "+12,234", change: "+19%", icon: CreditCard },
                { title: "Active Now", value: "+573", change: "+201", icon: Activity },
              ].map((stat, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground/80">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-primary font-medium">{stat.change}</span> from last month
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
                  <p className="text-sm text-muted-foreground">Monthly revenue breakdown.</p>
                </CardHeader>
                <CardContent className="pl-2">
                  {/* CSS Only Bar Chart Simulation */}
                  <div className="h-[240px] w-full flex items-end justify-between gap-2 px-4 pt-8">
                      {[35, 78, 45, 90, 65, 85, 40, 95, 50, 70, 80, 60].map((h, i) => (
                        <div key={i} className="group relative flex-1 flex flex-col justify-end items-center gap-2 h-full">
                          <div 
                            className="w-full bg-primary rounded-t-sm transition-all hover:bg-primary/80" 
                            style={{ height: `${h}%`, opacity: i % 2 === 0 ? 1 : 0.6 }}
                          ></div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <p className="text-sm text-muted-foreground">You made 265 sales this month.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="relative h-9 w-9 rounded-full bg-secondary flex items-center justify-center border">
                          <span className="text-xs font-bold text-secondary-foreground">U{i}</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">User Name {i}</p>
                          <p className="text-xs text-muted-foreground">user{i}@example.com</p>
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
  );
};