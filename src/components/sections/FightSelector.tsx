import React, {useEffect, useState} from 'react';
import {FightMetaData} from "../../models/Fight";
import {isRaidMetaData} from "../../models/Raid";
import { isWaveMetaData, WaveMetaData, WavesMetaData } from '../../models/Waves';
import { EncounterMetaData } from '../../models/LogLine';
import { Fight } from './fight-selector/Fight';
import { RaidFight } from './fight-selector/RaidFight';
import { Waves } from './fight-selector/Waves';


interface FightSelectorProps {
    fights: (EncounterMetaData)[];
    onSelectFight: (index: number, raidIndex?: number) => void;
}

interface BannerProps {
    name: string;
}

const Banner: React.FC<BannerProps> = ({name}) => {
    return (
        <div className="banner">
            <p>{name}</p>
        </div>
    );
};

export type FightGroup = {
    isRaid: boolean;
    wavesMetaData: WavesMetaData | null;
    index: number;
    fights: {
        fight: FightMetaData,
        index: number,
        raidIndex?: number
    }[];
    waves: {
        wave: WaveMetaData,
        index: number,
        waveIndex?: number
    }[];
};

export type FightGroups = {
    [name: string]: FightGroup;
};

const FightSelector: React.FC<FightSelectorProps> = ({fights, onSelectFight}) => {
    // Group fights by name and record shortest fight time for each group
    const [groupedFights, setGroupedFights] = useState<FightGroups>({});

    useEffect(() => {
        const tempGroupedFights: FightGroups = {};

        fights.forEach((fight, index) => {
            if (isRaidMetaData(fight)) {
                tempGroupedFights[fight.name] = {index, isRaid: true, wavesMetaData: null, fights: fight.fights.map((f, i) => ({fight: f, index: index, raidIndex: i})), waves: []};
            } else if (isWaveMetaData(fight)) {
                tempGroupedFights[fight.name] = {index, isRaid: false, wavesMetaData: fight, fights: [], waves: fight.waves.map((f, i) => ({wave: f, index: index, waveIndex: i}))};
            } else {
                if (!tempGroupedFights[fight.name]) {
                    tempGroupedFights[fight.name] = {index, isRaid: false, wavesMetaData: null, fights: [], waves: []};
                }
                tempGroupedFights[fight.name].fights.push({fight, index});
            }
        });

        setGroupedFights(tempGroupedFights);
    }, [fights]);

    return (
        <div style={{marginTop: '20px'}}>
            {Object.keys(groupedFights).map(name => {
                const fightGroup = groupedFights[name];

                if (fightGroup.isRaid) {
                    return (
                        <div className="damage-done-container" key={name}>
                            <Banner name={name}/>
                            <div className="fight-list">
                                {fightGroup.fights.map((fight, index) => (
                                    <RaidFight
                                        key={index}
                                        fight={fight.fight}
                                        index={fight.index}
                                        raidIndex={fight.raidIndex!}
                                        fightName={fight.fight.name}
                                        onSelectFight={onSelectFight}
                                        isShortest={false}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                } else if (fightGroup.wavesMetaData) {
                    return (
                        <Waves index={fightGroup.index} fightGroup={fightGroup} wavesMetaData={fightGroup.wavesMetaData} onSelectFight={onSelectFight} />
                    );
                } else {
                    let shortestTime: number;

                    fightGroup.fights.forEach(fight => {
                        if (fight.fight.success) {
                            if (!shortestTime || fight.fight.fightLengthMs < shortestTime) {
                                shortestTime = fight.fight.fightLengthMs;
                            }
                        }
                    })

                    return (
                        <div className="damage-done-container" key={name}>
                            <Banner name={name}/>
                            <div className="fight-list">
                                {fightGroup.fights.map((fight, index) => (
                                    <Fight
                                        key={index}
                                        fight={fight.fight}
                                        index={fight.index}
                                        title={(index + 1).toString()}
                                        onSelectFight={onSelectFight}
                                        isShortest={fight.fight.fightLengthMs === shortestTime}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                }

            })}
        </div>
    );
};

export default FightSelector;
