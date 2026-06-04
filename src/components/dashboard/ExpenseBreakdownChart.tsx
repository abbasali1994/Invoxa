import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#818cf8', '#a78bfa', '#f472b6', '#38bdf8'];

export interface ExpenseBreakdownChartProps {
  data: any[];
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium mb-4">Expense Breakdown</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="total" nameKey="category">
              {data?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff'}} />
            <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
