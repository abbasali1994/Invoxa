import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export interface RevenueChartProps {
  data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium mb-4">Revenue vs Realized (6mo)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
            <RechartsTooltip cursor={{fill: '#262626'}} contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff'}} />
            <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
            <Bar dataKey="invoiced" name="Invoiced" fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="realized" name="Realized" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
