import React, { useContext, useMemo } from 'react';
import HitDistributionChart from "../charts/HitDistributionChart";
import Results from "../Results";
import DPSChart from "../charts/DPSChart";
import EventsTable from "../EventsTable";
import DPSMeterTable from "../charts/DPSMeterTable";
import { Encounter, filterByType, getFights, getLogLines, LogLine, LogTypes } from '../../models/LogLine';
import { FilterContext } from '../context/FilterContext';
import { applyFightFilter } from '../../models/Filter';

interface LogsSelectionProps {
    encounter: Encounter;
    loggedInPlayer: string;
    actor: "source" | "target";
}

const DamageDone: React.FC<LogsSelectionProps> = ({encounter, loggedInPlayer, actor}) => {
    const logFilter = useContext(FilterContext);
    const logLines = useMemo(() => filterByType(getLogLines(encounter), LogTypes.DAMAGE).filter((l) => actor === "source" ? l.target.index : !l.target.index), [encounter, actor]);

    // time spent actively fighting the filtered npc
    const activeFightLengthMs = applyFightFilter(getFights(encounter), logFilter).reduce((acc, f) => acc + f.metaData.fightLengthMs, 0);

    return (
        <div>
            <div>
                <div className="damage-done-container">
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400'}}>
                        {logLines.length > 1 && (
                            <DPSChart logLines={logLines} fightLengthMs={activeFightLengthMs} />
                        )}
                    </div>
                </div>
                <div className="damage-done-container" style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{flex: '30%', marginRight: '20px'}}>
                        <Results logLines={logLines} fightLengthMs={activeFightLengthMs} />
                    </div>
                    <div style={{flex: '70%'}}>
                        {logLines.length > 0 && (
                            <HitDistributionChart logLines={logLines} />
                        )}
                    </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                    <DPSMeterTable logLines={logLines} fightDurationMs={activeFightLengthMs} loggedInPlayer={loggedInPlayer} actor={actor}/>
                </div>
                <EventsTable logLines={logLines} loggedInPlayer={loggedInPlayer} />
            </div>
        </div>
    );
};

export default DamageDone;
