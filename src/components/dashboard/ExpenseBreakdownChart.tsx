import React from 'react';
import { PieChart, Pie, Cell, Sector, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#818cf8', '#34d399', '#f472b6', '#fb923c', '#facc15',
  '#38bdf8', '#a78bfa', '#4ade80', '#f87171', '#e879f9'
];

export interface ExpenseBreakdownChartProps {
  data: any[];
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  const pieData = data.map((entry: any, index: number) => ({
    ...entry,
    pieValue: 1, // Equal angles for all slices
    fill: COLORS[index % COLORS.length]
  }));

  const maxTotal = Math.max(...data.map((d: any) => d.total), 1);

  const renderNightingaleShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    const ratio = payload.total / maxTotal;
    const sliceOuterRadius = innerRadius + (ratio * (outerRadius - innerRadius));
    
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={sliceOuterRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#171717"
        strokeWidth={3}
        cornerRadius={4}
      />
    );
  };

  const renderActiveNightingaleShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    const ratio = payload.total / maxTotal;
    const sliceOuterRadius = innerRadius + (ratio * (outerRadius - innerRadius));
    
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={sliceOuterRadius + 8} // Pop out on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#171717"
        strokeWidth={3}
        cornerRadius={4}
      />
    );
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Expense Breakdown</h3>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="pieValue"
              cx="50%"
              cy="50%"
              innerRadius="15%"
              outerRadius="100%"
              shape={renderNightingaleShape}
              activeShape={renderActiveNightingaleShape}
              isAnimationActive={true}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff', borderRadius: '8px'}}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any, name: any, props: any) => [`$${props.payload.total.toLocaleString()}`, props.payload.category]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-0 pb-2 flex items-start justify-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 px-4 py-2">
          {data.map((entry: any, index: number) => (
            <div key={entry.category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-sm text-neutral-400">{entry.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
