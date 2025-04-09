import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChartIcon } from 'lucide-react';

interface TimelineData {
  month: string;
  count: number;
}

interface ProgressChartProps {
  data: TimelineData[];
  isLoading: boolean;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const date = new Date(label + '-01');
    const formattedMonth = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="text-sm font-medium">{formattedMonth}</p>
        <p className="text-sm text-primary">{`${payload[0].value} sessions`}</p>
      </div>
    );
  }

  return null;
};

// Format month labels on X-axis
const formatXAxis = (month: string) => {
  if (!month) return '';
  
  const date = new Date(month + '-01');
  return date.toLocaleDateString(undefined, { month: 'short' });
};

export default function ProgressChart({ data, isLoading }: ProgressChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            <span>Progress Timeline</span>
          </CardTitle>
          <CardDescription>Your practice sessions over time</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <div className="animate-pulse h-full w-full bg-gray-100 rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            <span>Progress Timeline</span>
          </CardTitle>
          <CardDescription>Your practice sessions over time</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex flex-col items-center justify-center text-center">
          <BarChartIcon className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-muted-foreground">No session data available yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete sessions to see your progress</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" />
          <span>Progress Timeline</span>
        </CardTitle>
        <CardDescription>Your practice sessions over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickFormatter={formatXAxis} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#2470ff" 
                radius={[4, 4, 0, 0]} 
                name="Sessions" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}