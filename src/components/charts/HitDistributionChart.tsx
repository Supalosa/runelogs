import React, { useContext } from 'react';
import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {filterByType, LogLine, LogTypes} from "../../models/LogLine";
import { FilterContext } from '../context/FilterContext';
import { applyFilter } from '../../models/Filter';

interface HitDistributionChartProps {
    logLines: LogLine[];
}

const CustomTooltip: React.FC<any> = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div>
                <p style={{margin: '0'}}>
                    <strong>{label}</strong>
                </p>
                {payload.map((entry: any, index: any) => (
                    <p key={`tooltip-entry-${index}`} style={{margin: '0'}}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }

    return null;
};

const HitDistributionChart: React.FC<HitDistributionChartProps> = ({ logLines }) => {
    const logFilter = useContext(FilterContext);
    const filteredLogs = filterByType(applyFilter(logLines, logFilter), LogTypes.DAMAGE);
    const hitsplatAmounts = filteredLogs.map((log) => log.damageAmount);

    const data = hitsplatAmounts.reduce((acc, amount) => {
        acc[amount] = (acc[amount] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const chartData = Object.keys(data).map((key) => ({
        hitsplatAmount: parseInt(key),
        frequency: data[parseInt(key)],
    }));

    return (
        <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{top: 11, left: 60, bottom: 30}}>
                <XAxis
                    dataKey="hitsplatAmount"
                    label={{value: 'Hitsplat', position: 'insideBottom', offset: -20}}
                />
                <YAxis
                    dataKey="frequency"
                    label={{
                        value: 'Frequency',
                        position: 'insideLeft',
                        angle: -90,
                        offset: -25,
                        style: {textAnchor: 'middle'},
                    }}
                    width={35}
                />
                <Tooltip
                    content={(props) => <CustomTooltip {...props} />}
                    cursor={{fill: '#3c3226'}}
                />

                <Bar dataKey="frequency" fill="tan" isAnimationActive={false}/>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default HitDistributionChart;
