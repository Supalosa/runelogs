import React from 'react';
import {Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {DamageLog, filterByType, LogLine, LogTypes} from "../../models/LogLine";

interface DPSChartProps {
    logLines: LogLine[];
    fightLengthMs: number;
}

const CustomTooltip: React.FC<any> = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        const labelDate = new Date(label);
        if (isNaN(labelDate.getTime())) {
            return null;
        }

        const isoTimeString = labelDate.toISOString().substr(11, 12);

        return (
            <div>
                <p style={{margin: '0'}}>
                    <strong>{isoTimeString}</strong>
                </p>
                {payload.map((entry: any, index: any) => (
                    <p key={`tooltip-entry-${index}`} style={{margin: '0'}}>
                        {entry.name}: {entry.value.toFixed(2)} DPS
                    </p>
                ))}
            </div>
        );
    }

    return null;
};

export const calculateDPSByInterval = (data: DamageLog[], intervalMs: number, startTick: number) => {
    const damageSlices: {[slice: number]: number} = {};
    const maxTick = data.reduce((acc, l) => Math.max(acc, l.tick ?? 0), 0);
    const intervalTicks = Math.floor(intervalMs / 600);
    const tickToSlice = (tick: number): number => Math.floor((tick - startTick) / intervalTicks);
    const minSlice = tickToSlice(startTick);
    const maxSlice = tickToSlice(maxTick);

    for (let i = minSlice; i <= maxSlice; ++i) {
        damageSlices[i] = 0;
    }
    for (let i = 0; i < data.length; i++) {
        const log = data[i];
        const tick = log.tick!;
        const totalDamage = log.damageAmount !== undefined ? log.damageAmount : 0;
        const slice = tickToSlice(tick);
        damageSlices[slice] += totalDamage;
    }
    return Object.entries(damageSlices).map(([slice, damage]) => ({timestamp: parseInt(slice) * intervalMs, dps: damage / intervalTicks}));
};


const DPSChart: React.FC<DPSChartProps> = ({logLines, fightLengthMs}) => {
    const filteredLogs = filterByType(logLines, LogTypes.DAMAGE);

    const interval = Math.min(Math.max(fightLengthMs / 4, 600), 6000);
    const startTick = logLines.reduce((acc, l) => Math.min(acc, l.tick ?? 0), Number.MAX_SAFE_INTEGER);

    const dpsData = calculateDPSByInterval(filteredLogs, interval, startTick);

    const tickInterval = Math.ceil(dpsData.length / 5);

    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dpsData} margin={{top: 11, left: 40, bottom: 0}}>
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick, index) =>
                        index % tickInterval === 0 ? new Date(tick).toISOString().substr(11, 8) : ''
                    }
                />
                <YAxis
                    dataKey="dps"
                    label={{
                        value: 'DPS',
                        position: 'insideLeft',
                        angle: -90,
                        offset: -20,
                        style: {textAnchor: 'middle'},
                    }}
                    width={35}
                    tickFormatter={(tick) => (tick !== 0 ? tick : '')}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} />} cursor={{fill: '#3c3226'}}/>

                <Area type="monotone" dataKey="dps" stroke="black" fill="tan"/>
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default DPSChart;
