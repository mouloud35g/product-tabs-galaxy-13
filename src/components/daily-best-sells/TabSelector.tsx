import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabSelector = ({ tabs, activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-full transition-all duration-300",
            activeTab === tab.id
              ? "bg-primary text-white shadow-lg"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
};