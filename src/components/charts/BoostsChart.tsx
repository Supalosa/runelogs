import React, {useEffect, useMemo, useState} from 'react';
import {Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {pairs as d3Pairs} from 'd3-array';
import {Fight} from "../../models/Fight";
import {BoostedLevels} from "../../models/BoostedLevels";
import {BoostedLevelsLog, Encounter, filterByType, getLogLines, LogLine, LogTypes} from "../../models/LogLine";
import {formatHHmmss} from "../../utils/utils";
import {MAGE_ANIMATION, MELEE_ANIMATIONS, RANGED_ANIMATIONS, SECONDS_PER_TICK} from "../../models/Constants";
import {alpha, FormControlLabel, Switch} from '@mui/material';
import {styled} from "@mui/material/styles";

interface BoostsChartProps {
    encounter: Encounter;
    loggedInPlayer: string;
}

const CustomTooltip: React.FC<any> = ({active, payload, label, data}) => {
    if (active && payload && payload.length) {

        return (
            <div>
                {payload.map((entry: any, index: any) => (
                    <div key={`tooltip-entry-${index}`}
                         style={{marginTop: '0', marginBottom: '0', color: entry.color, lineHeight: '1'}}>
                        {entry.name}: {entry.value}
                    </div>
                ))}
                {formatHHmmss(label, true)}

                {payload[0].payload.animationId &&
                    <div>
                        Animation: {payload[0].payload.animationId}
                    </div>
                }
            </div>
        );
    }

    return null;
};

export function calculateWeightedAverages(logLines: BoostedLevelsLog[], startTick: number) {
    const weightedValues: Array<{ stat: keyof BoostedLevels, values: Array<{ weightedValue: number }> }> = [];
    const startTime = logLines[0].tick! * SECONDS_PER_TICK;
    const endTime = logLines[logLines.length - 1].tick! * SECONDS_PER_TICK;

    const getTimestamp = (tick: number) => (tick - startTick) * SECONDS_PER_TICK * 1000;

    // Calculate the time difference in seconds
    const totalTimeInSeconds = (endTime - startTime);

    const filteredLogs = filterByType(logLines, LogTypes.BOOSTED_LEVELS);
    const pairs: [LogLine, LogLine][] = d3Pairs(filteredLogs);

    if (pairs && pairs.length > 0) {
        // Create one more pair between the last and end of the fight
        // TODO pairs.push([fight.data[fight.data.length - 1], fight.lastLine!])

        pairs.forEach(pair => {
            const startTime = getTimestamp(pair[0].tick!);
            const endTime = getTimestamp(pair[1].tick!);
            const timeDiffInSeconds = (endTime - startTime) / 1000;

            for (const key in (pair[0] as BoostedLevelsLog).boostedLevels) {
                const value1 = (pair[0] as BoostedLevelsLog).boostedLevels[key as keyof BoostedLevels];
                const weightedValue = value1 * (timeDiffInSeconds / totalTimeInSeconds);

                const existingStat = weightedValues.find(item => item.stat === key as keyof BoostedLevels);
                if (existingStat) {
                    existingStat.values.push({weightedValue});
                } else {
                    weightedValues.push({stat: key as keyof BoostedLevels, values: [{weightedValue}]});
                }
            }
        })
    }

    const averages: Partial<BoostedLevels> = {};

    for (const stat of weightedValues) {
        let totalWeightedValue = 0;
        for (const value of stat.values) {
            totalWeightedValue += value.weightedValue;
        }
        const averageWeightedValue = totalWeightedValue;
        averages[stat.stat] = averageWeightedValue;
    }

    return averages as BoostedLevels;
}

const BoostsChart: React.FC<BoostsChartProps> = ({encounter, loggedInPlayer}) => {
    const [boostedLevelsData, setBoostedLevelsData] = useState<any[] | undefined>();
    const [attackAnimationData, setAttackAnimationData] = useState<any[] | undefined>();
    const [showAttackAnimations, setShowAttackAnimations] = useState<boolean>(true); // State variable to control visibility

    const logLines = useMemo(() => getLogLines(encounter), [encounter]);
    const startTick = useMemo(() => logLines.reduce((acc, l) => l.tick ? Math.min(acc, l.tick) : acc, Number.MAX_SAFE_INTEGER), [logLines]1);

    const getTimestamp = (tick: number) => {
        console.log(tick, startTick);
        return (tick - startTick) * SECONDS_PER_TICK * 1000;
    };

    useEffect(() => {
        let currentBoost: BoostedLevels;

        let tempBoost: any[] = [];
        let tempAttack: any[] = [];

        logLines.forEach(log => {
            if (log.type === LogTypes.BOOSTED_LEVELS) {
                tempBoost.push({
                    timestamp: getTimestamp(log.tick!),
                    formattedTimestamp: formatHHmmss(getTimestamp(log.tick!), true),
                    attack: log.boostedLevels?.attack || 0,
                    strength: log.boostedLevels?.strength || 0,
                    defence: log.boostedLevels?.defence || 0,
                    ranged: log.boostedLevels?.ranged || 0,
                    magic: log.boostedLevels?.magic || 0,
                    hitpoints: log.boostedLevels?.hitpoints || 0,
                    prayer: log.boostedLevels?.prayer || 0,
                });

                currentBoost = log.boostedLevels;
            }


            if (log.type === LogTypes.PLAYER_ATTACK_ANIMATION && (!log.source || log.source.name === loggedInPlayer)) {
                tempAttack.push({
                    timestamp: getTimestamp(log.tick!),
                    formattedTimestamp: formatHHmmss(getTimestamp(log.tick!), true),
                    animationId: log.animationId
                });

                // Add in a fake boost datapoint, only if it doesn't already exist
                if (!tempBoost.find(data => data.timestamp === log.fightTimeMs)) {
                    tempBoost.push({
                        timestamp: getTimestamp(log.tick!),
                        formattedTimestamp: formatHHmmss(getTimestamp(log.tick!), true),
                        attack: currentBoost.attack || 0,
                        strength: currentBoost.strength || 0,
                        defence: currentBoost.defence || 0,
                        ranged: currentBoost.ranged || 0,
                        magic: currentBoost.magic || 0,
                        hitpoints: currentBoost?.hitpoints || 0,
                        prayer: currentBoost?.prayer || 0,
                        animationId: log.animationId
                    });
                }
            }
        })

        const lastLine = logLines[logLines.length - 1];

        tempBoost.push({
            ...tempBoost[tempBoost.length - 1],
            timestamp: getTimestamp(lastLine.tick!),
            formattedTimestamp: formatHHmmss(getTimestamp(lastLine.tick!), true),
        });
        console.log(tempBoost);

        const verticalMelee = "rgb(153, 38, 58)";
        const verticalRanged = "rgb(72, 84, 55)";
        const verticalMagic = "rgb(28, 95, 115)";

        tempAttack.forEach(attack => {
            if (MELEE_ANIMATIONS.includes(attack.animationId)) {
                attack.color = verticalMelee;
            } else if (RANGED_ANIMATIONS.includes(attack.animationId)) {
                attack.color = verticalRanged;
            } else if (MAGE_ANIMATION.includes(attack.animationId)) {
                attack.color = verticalMagic;
            }
        })
        setBoostedLevelsData(tempBoost);
        setAttackAnimationData(tempAttack);
    }, [encounter]);


    const filteredLogs = filterByType(logLines, LogTypes.BOOSTED_LEVELS);
    const averages = calculateWeightedAverages(filteredLogs?.filter((log) => log.boostedLevels) as BoostedLevelsLog[], startTick);

    if (!boostedLevelsData || !attackAnimationData) {
        return <div>Loading...</div>;
    } else {
        /*        console.log(boostedLevelsData)
                attackAnimationData.map(data => {
                    console.log(data.formattedTimestamp);
                })*/
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={boostedLevelsData} margin={{top: 11, left: 60, bottom: 20}}>
                    <XAxis
                        dataKey="timestamp" // Use the actual timestamp as the dataKey
                        type="number" // Specify the type as "number" for numerical values
                        tickFormatter={(timestamp) => formatHHmmss(timestamp, true)}
                        domain={[0, boostedLevelsData[boostedLevelsData.length - 1].timestamp]}
                    />
                    <YAxis
                        dataKey="attack"
                        label={{
                            value: 'Level',
                            position: 'insideLeft',
                            angle: -90,
                            offset: -40,
                            style: {textAnchor: 'middle'},
                        }}
                        width={35}
                        tickFormatter={(tick) => (tick !== 0 ? tick : '')}
                        domain={[0, 125]}
                    />
                    <Legend
                        content={() => (
                            <div style={{marginTop: '20px', fontSize: '20px', color: 'white', textAlign: 'center'}}>
                                <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px'}}>
                                    <span style={{gridRow: 'span 2', alignSelf: 'end'}}>Averages</span>
                                    {Object.entries(averages)
                                        .filter(([stat]) => stat === 'attack' || stat === 'strength' || stat === 'defence' || stat === 'ranged' || stat === 'magic')
                                        .map(([stat, average]) => (
                                            <div key={stat} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    color: getStatColor(stat as keyof BoostedLevels),
                                                    marginBottom: '5px'
                                                }}>{stat}</span>
                                                <span>{average.toFixed(3)}</span>
                                            </div>
                                        ))}
                                </div>
                                <div style={{position: 'absolute', top: 0, right: 0}}>
                                    <FormControlLabel
                                        control={<TanToggle checked={showAttackAnimations}
                                                         onChange={() => setShowAttackAnimations(!showAttackAnimations)}
                                                         color="default"/>}
                                        label="Attacks"
                                    />
                                </div>
                            </div>
                        )}
                    />
                    {attackAnimationData.map((line, index) => (
                        showAttackAnimations && (
                            <ReferenceLine key={index} x={line.timestamp} stroke={line.color} strokeDasharray="10 2"
                                           ifOverflow="extendDomain"/>
                        )
                    ))}
                    <Line type="stepAfter" dataKey="attack" stroke="#C69B6D" dot={false} animationDuration={0}/>
                    <Line type="stepAfter" dataKey="strength" stroke="#C41E3A" dot={false} animationDuration={0}/>
                    <Line type="stepAfter" dataKey="defence" stroke="#0070DD" dot={false} animationDuration={0}/>
                    <Line type="stepAfter" dataKey="ranged" stroke="#AAD372" dot={false} animationDuration={0}/>
                    <Line type="stepAfter" dataKey="magic" stroke="#3FC7EB" dot={false} animationDuration={0}/>
                    <Tooltip content={(props) => <CustomTooltip {...props} data={boostedLevelsData}/>}
                             cursor={{fill: '#3c3226'}}/>
                </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={boostedLevelsData} margin={{top: 11, left: 60, bottom: 20}}>
                    <XAxis
                        dataKey="timestamp" // Use the actual timestamp as the dataKey
                        type="number" // Specify the type as "number" for numerical values
                        tickFormatter={(timestamp) => formatHHmmss(timestamp, true)}
                        domain={[0, boostedLevelsData[boostedLevelsData.length - 1].timestamp]}
                    />
                    <YAxis
                        dataKey="attack"
                        label={{
                            value: 'Level',
                            position: 'insideLeft',
                            angle: -90,
                            offset: -40,
                            style: {textAnchor: 'middle'},
                        }}
                        width={35}
                        tickFormatter={(tick) => (tick !== 0 ? tick : '')}
                        domain={[0, 125]}
                    />
                    <Legend
                        content={() => (
                            <div style={{marginTop: '20px', fontSize: '20px', color: 'white', textAlign: 'center'}}>
                                <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px'}}>
                                    <span style={{gridRow: 'span 2', alignSelf: 'end'}}>Averages</span>
                                    {Object.entries(averages)
                                        .filter(([stat]) => stat === 'hitpoints' || stat === 'prayer')
                                        .map(([stat, average]) => (
                                            <div key={stat} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    color: getStatColor(stat as keyof BoostedLevels),
                                                    marginBottom: '5px'
                                                }}>{stat}</span>
                                                <span>{average.toFixed(3)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    />
                    <Line type="stepAfter" dataKey="hitpoints" stroke="red" dot={false} animationDuration={0}/>
                    <Line type="stepAfter" dataKey="prayer" stroke="yellow" dot={false} animationDuration={0}/>
                    <Tooltip content={(props) => <CustomTooltip {...props} />} cursor={{fill: '#3c3226'}}/>
                </LineChart>
            </ResponsiveContainer>
        </div>

    );
};

function getStatColor(stat: keyof BoostedLevels) {
    switch (stat) {
        case 'attack':
            return '#C69B6D';
        case 'strength':
            return '#C41E3A';
        case 'defence':
            return '#0070DD';
        case 'ranged':
            return '#AAD372';
        case 'magic':
            return '#3FC7EB';
        case 'hitpoints':
            return 'red';
        case 'prayer':
            return 'yellow';
        default:
            return '#333'; // Default color
    }
}

export default BoostsChart;

const TanToggle = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: "#D2B48C",
        '&:hover': {
            backgroundColor: alpha("#D2B48C", theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: "#D2B48C",
    },
    '& .MuiSwitch-track': {
        backgroundColor: theme.palette.grey[400],
    },
}));