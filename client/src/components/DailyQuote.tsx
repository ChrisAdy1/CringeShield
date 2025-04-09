import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QuoteIcon } from 'lucide-react';
import { getDailyQuote } from '@/lib/motivationalQuotes';

export default function DailyQuote() {
  // Use state to handle client-side rendering
  const [quote, setQuote] = useState<string | null>(null);
  
  useEffect(() => {
    // Get quote on client-side to ensure localStorage works
    setQuote(getDailyQuote());
  }, []);
  
  if (!quote) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="mt-4 p-4 bg-muted/50 rounded-xl shadow-sm text-center italic relative"
    >
      <div className="absolute -top-2 -left-2 text-primary opacity-20">
        <QuoteIcon size={24} />
      </div>
      <p className="text-sm md:text-base text-muted-foreground">"{quote}"</p>
    </motion.div>
  );
}