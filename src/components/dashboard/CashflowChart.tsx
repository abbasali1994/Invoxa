import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export interface CashflowChartProps {
  data: any[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium mb-4">90-Day Cashflow Forecast</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
            <RechartsTooltip contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff'}} />
            <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
            <Line type="monotone" dataKey="projected" name="Projected Rev" stroke="#a78bfa" strokeWidth={2} dot={{r: 4}} />
            <Line type="monotone" dataKey="expenses" name="Proj Expenses" stroke="#f472b6" strokeWidth={2} dot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
