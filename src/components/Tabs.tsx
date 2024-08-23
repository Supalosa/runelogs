import React from "react";
import DamageDone from "./sections/DamageDone";
import BoostsChart from "./charts/BoostsChart";
import EventsTable from "./EventsTable";
import {Fight} from "../models/Fight";
import MainReplayComponent from "./replay/MainReplayComponent";
import {Encounter, filterByType, getLogLines, LogTypes} from "../models/LogLine";

export enum TabsEnum {
    DAMAGE_DONE = 'Damage Done',
    DAMAGE_TAKEN = 'Damage Taken',
    BOOSTS = 'Boosts',
    EVENTS = 'Events',
    REPLAY = 'Replay',
}

export const DamageDoneTab: React.FC<{ selectedLogs: Encounter, loggedInPlayer: string }> = ({selectedLogs, loggedInPlayer}) => {
    const logs = getLogLines(selectedLogs);
    const filteredLogs = filterByType(logs, LogTypes.DAMAGE);
    return <DamageDone logLines={filteredLogs.filter((log) => log.target.index)}
                fightLengthMs={selectedLogs.metaData.fightLengthMs}
                loggedInPlayer={loggedInPlayer}
                actor={"source"} />;
};

export const DamageTakenTab: React.FC<{ selectedLogs: Encounter, loggedInPlayer: string }> = ({selectedLogs, loggedInPlayer}) => {
    const logs = getLogLines(selectedLogs);
    const filteredLogs = filterByType(logs, LogTypes.DAMAGE);
    return <DamageDone logLines={filteredLogs.filter((log) => !log.target.index)}
                fightLengthMs={selectedLogs.metaData.fightLengthMs}
                loggedInPlayer={loggedInPlayer}
                actor={"target"} />;
};

export const BoostsTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    return (
        <div className="damage-done-container">
            <BoostsChart fight={selectedLogs}/>
        </div>
    );
};

export const EventsTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    const logs = getLogLines(selectedLogs);
    return <EventsTable logLines={logs} loggedInPlayer={selectedLogs.loggedInPlayer} height={'80vh'} showSource={true}/>;
};

export const ReplayTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    return <MainReplayComponent fight={selectedLogs}/>;
};
