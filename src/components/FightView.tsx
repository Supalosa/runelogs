import { useMemo, useState } from "react";
import { BoostsTab, DamageDoneTab, DamageTakenTab, EventsTab, ReplayTab, TabsEnum } from "./Tabs";
import { Fight, isFight } from "../models/Fight";
import TickActivity from "./performance/TickActivity";
import { BOSS_NAMES } from "../utils/constants";
import { Chip, Tab, Tabs } from "@mui/material";
import { isRaid, isRaidMetaData } from "../models/Raid";
import DropdownFightSelector from "./sections/DropdownFightSelector";
import { Icon } from "@iconify/react";
import { DamageLog, Encounter, EncounterMetaData, getLogLines, LoggedInPlayerLog, LogTypes } from "../models/LogLine";
import { isWaveMetaData, isWaves } from "../models/Waves";

import * as semver from "semver";

type FightViewProps = {
    fight: Encounter;
    encounterMetaData?: EncounterMetaData;
    selectedFightIndex?: number;
    onBack: () => void;
    onSelectFight: (index: number) => void;
};

const getFights = (encounter: Encounter): Fight[] => {
    return isFight(encounter) ? [encounter] : isRaid(encounter) ? encounter.fights : encounter.waves.flatMap((w) => w.fights);
}

const getPlayers = (fights: Fight[]): string[] => {
    const res = new Set<string>();
    fights.forEach((f) => res.add(f.loggedInPlayer));
    return Array.from(res.values());
};

export const FightView = ({fight, encounterMetaData, selectedFightIndex, onBack, onSelectFight}: FightViewProps) => {
    const [selectedTab, setSelectedTab] = useState<TabsEnum>(TabsEnum.DAMAGE_DONE);
    
    const fights = useMemo(() => getFights(fight), [fight]);
    const players = useMemo(() => getPlayers(fights), [fights]);
    
    const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
    
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: TabsEnum) => {
        setSelectedTab(newValue);
    };

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

    const fightCount = fights.length;
    const showTickActivity = isFight(fight) ? (BOSS_NAMES.includes(fight.metaData.name) || fight.metaData.fightLengthMs >= 15000) : isWaves(fight);

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
            isFight(fight) && fight.isNpc ? (
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
        
        {fightCount > 1 && <>{' '}<Chip color="secondary" size="small" label={`${fightCount} fights`} /></>}
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
    {showTickActivity && <TickActivity selectedLogs={fight}/>}
    {selectedTab === TabsEnum.DAMAGE_DONE && <DamageDoneTab selectedLogs={fight} loggedInPlayer={selectedPlayer} />}
    {/*
    {selectedTab === TabsEnum.DAMAGE_TAKEN && <DamageTakenTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.BOOSTS && <BoostsTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.EVENTS && <EventsTab selectedLogs={fight}/>}
    {selectedTab === TabsEnum.REPLAY && <ReplayTab selectedLogs={fight}/>}*/}
</div>
}