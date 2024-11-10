import React from "react";
import DamageDone from "./sections/DamageDone";
import BoostsChart from "./charts/BoostsChart";
import EventsTable from "./EventsTable";
import {Fight} from "../models/Fight";
import MainReplayComponent from "./replay/MainReplayComponent";
import {Encounter, getLogLines} from "../models/LogLine";

export enum TabsEnum {
    DAMAGE_DONE = 'Damage Done',
    DAMAGE_TAKEN = 'Damage Taken',
    BOOSTS = 'Boosts',
    EVENTS = 'Events',
    REPLAY = 'Replay',
}

export const DamageDoneTab: React.FC<{ selectedLogs: Encounter, loggedInPlayer: string }> = ({selectedLogs, loggedInPlayer}) => {
    return <DamageDone encounter={selectedLogs}
                loggedInPlayer={loggedInPlayer}
                actor={"source"} />;
};

export const DamageTakenTab: React.FC<{ selectedLogs: Encounter, loggedInPlayer: string }> = ({selectedLogs, loggedInPlayer}) => {
    return <DamageDone encounter={selectedLogs}
                loggedInPlayer={loggedInPlayer}
                actor={"target"} />;
};

export const BoostsTab: React.FC<{ selectedLogs: Encounter, loggedInPlayer: string }> = ({selectedLogs, loggedInPlayer}) => {
    return (
        <div className="damage-done-container">
            <BoostsChart encounter={selectedLogs} loggedInPlayer={loggedInPlayer} />
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
