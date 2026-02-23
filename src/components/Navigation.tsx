import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, GlassWater, Dumbbell, Settings, Calendar, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Início' },
  { path: '/recipes', icon: UtensilsCrossed, label: 'Receitas' },
  { path: '/detox', icon: GlassWater, label: 'Detox' },
  { path: '/exercises', icon: Dumbbell, label: 'Exercícios' },
  { path: '/store', icon: ShoppingBag, label: 'Loja' },
  
  { path: '/settings', icon: Settings, label: 'Config' },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40 safe-area-bottom">
      <div className="flex justify-around items-center py-2 px-1 sm:px-4 max-w-2xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 sm:px-3 py-1.5 rounded-xl transition-all duration-300 min-w-0",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive && "animate-scale-in")} />
              <span className="text-[9px] sm:text-[10px] font-medium truncate max-w-[48px] sm:max-w-none">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
