import { useState } from "react";
import { Fight } from "../models/Fight";
import { BoostsTab, DamageDoneTab, DamageTakenTab, EventsTab, ReplayTab, TabsEnum } from "./Tabs";
import TickActivity from "./performance/TickActivity";
import { BOSS_NAMES } from "../utils/constants";
import { Tab, Tabs } from "@mui/material";
import { isRaidMetaData } from "../models/Raid";
import DropdownFightSelector from "./sections/DropdownFightSelector";
import { Icon } from "@iconify/react";
import { EncounterMetaData } from "../models/LogLine";

import * as semver from "semver";

type FightViewProps = {
    fight: Fight;
    encounterMetaData?: EncounterMetaData;
    selectedFightIndex?: number;
    onBack: () => void;
    onSelectFight: (index: number) => void;
};

export const FightView = ({fight, encounterMetaData, selectedFightIndex, onBack, onSelectFight}: FightViewProps) => {
    const [selectedTab, setSelectedTab] = useState<TabsEnum>(TabsEnum.DAMAGE_DONE);
    
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: TabsEnum) => {
        setSelectedTab(newValue);
    };

    const fightMetadata = fight.metaData;

    const renderDropdownFightSelector = () => {
        if (encounterMetaData && isRaidMetaData(encounterMetaData)) {
            return (
                <div>
                    <DropdownFightSelector fights={encounterMetaData.fights} onSelectFight={onSelectFight} selectedFightIndex={selectedFightIndex} />
                </div>
            );
        }
        return null;
    };
    const availableTabs = Object.values(TabsEnum).filter((tab) => {
        if (tab === TabsEnum.REPLAY) {
            return fight?.logVersion && semver.gte(fight?.logVersion, "1.2.0");
        }
        return true;
    });
    return <div className="App-main">
    <div style={{display: 'flex', alignItems: 'center'}}>
        <div
            className="back-icon-wrapper"
            onClick={onBack}
        >
            <Icon icon="ic:round-arrow-back"/>
        </div>
        {encounterMetaData && isRaidMetaData(encounterMetaData) ? (
            <label>{encounterMetaData.name}</label>
        ) : (
            fight.isNpc ? (
                <a href={`https://oldschool.runescape.wiki/w/${fight.mainEnemyName}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="link"
                >
                    {fight.name}
                </a>
            ) : (
                <label>{fight.name}</label>
            )
        )}
    </div>
    {renderDropdownFightSelector()}
    <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        style={{
            marginBottom: '20px',
        }}
    >
        {availableTabs.map((tab) => (
            <Tab
                key={tab}
                label={tab}
                value={tab}
                style={{
                    color: selectedTab === tab ? 'lightblue' : 'white',
                }}
            />
        ))}
    </Tabs>
    {(BOSS_NAMES.includes(fight.metaData.name) || fight.metaData.fightLengthMs >= 15000) &&
        <TickActivity selectedLogs={fight}/>}
    {selectedTab === TabsEnum.DAMAGE_DONE && <DamageDoneTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.DAMAGE_TAKEN && <DamageTakenTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.BOOSTS && <BoostsTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.EVENTS && <EventsTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.REPLAY && <ReplayTab selectedLogs={fight}/>}
</div>
}