import React from 'react';
import HitDistributionChart from "../charts/HitDistributionChart";
import Results from "../Results";
import DPSChart from "../charts/DPSChart";
import EventsTable from "../EventsTable";
import DPSMeterTable from "../charts/DPSMeterTable";
import { LogLine } from '../../models/LogLine';

interface LogsSelectionProps {
    logLines: LogLine[];
    fightLengthMs: number;
    loggedInPlayer: string;
    actor: "source" | "target";
}

const DamageDone: React.FC<LogsSelectionProps> = ({logLines, fightLengthMs, loggedInPlayer, actor}) => {
    return (
        <div>
            <div>
                <div className="damage-done-container">
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400'}}>
                        {logLines.length > 1 && (
                            <DPSChart logLines={logLines} fightLengthMs={fightLengthMs} />
                        )}
                    </div>
                </div>
                <div className="damage-done-container" style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{flex: '30%', marginRight: '20px'}}>
                        <Results logLines={logLines} fightLengthMs={fightLengthMs} />
                    </div>
                    <div style={{flex: '70%'}}>
                        {logLines.length > 0 && (
                            <HitDistributionChart logLines={logLines} />
                        )}
                    </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                    <DPSMeterTable logLines={logLines} fightDurationMs={fightLengthMs} loggedInPlayer={loggedInPlayer} actor={actor}/>
                </div>
                <EventsTable logLines={logLines} loggedInPlayer={loggedInPlayer} />
            </div>
        </div>
    );
};

export default DamageDone;
