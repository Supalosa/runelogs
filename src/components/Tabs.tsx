import React from "react";
import DamageDone from "./sections/DamageDone";
import BoostsChart from "./charts/BoostsChart";
import EventsTable from "./EventsTable";
import {Fight} from "../models/Fight";
import {filterByType, LogTypes} from "../models/LogLine";

export enum TabsEnum {
    DAMAGE_DONE = 'Damage Done',
    DAMAGE_TAKEN = 'Damage Taken',
    BOOSTS = 'Boosts',
    EVENTS = 'Events',
}

export const DamageDoneTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    const filteredLogs = filterByType(selectedLogs.data, LogTypes.DAMAGE);
    return <DamageDone
        selectedLogs={{
            ...selectedLogs!,
            data: filteredLogs.filter(
                (log) =>
                    log.target.index
            )!,
        }}
        actor={"source"}
    />;
};

export const DamageTakenTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    const filteredLogs = filterByType(selectedLogs.data, LogTypes.DAMAGE);
    return <DamageDone
        selectedLogs={{
            ...selectedLogs!,
            data: filteredLogs.filter(
                (log) =>
                    !log.target.index
            )!,
        }}
        actor={"target"}
    />;
};

export const BoostsTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    return (
        <div className="damage-done-container">
            <BoostsChart fight={selectedLogs}/>
        </div>
    );
};

export const EventsTab: React.FC<{ selectedLogs: Fight }> = ({selectedLogs}) => {
    return <EventsTable fight={selectedLogs} height={'80vh'} showSource={true}/>;
};
