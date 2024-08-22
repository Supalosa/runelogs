import { useState } from "react";
import { WavesMetaData } from "../../../models/Waves";
import { FightGroup } from "../FightSelector";
import { Wave } from "./Wave";
import { Button } from "@mui/base";

interface WavesProps {
    wavesMetaData: WavesMetaData;
    fightGroup: FightGroup;
    index: number;
    onSelectFight: (index: number, waveIndex?: number, fightIndex?: number) => void;
}

export const Waves: React.FC<WavesProps> = ({ wavesMetaData, fightGroup, index, onSelectFight }) => {
    const [expanded, setExpanded] = useState(false);
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectFight(index);
    };

    const onToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    return (
        <div className="waves-fight-container" key={wavesMetaData.name} onClick={handleClick}>
            <div className="banner">
                <p>{wavesMetaData.name}</p>
            </div>
            <div className="fight-list">
                {expanded ? <>
                    <Button color="primary" onClick={onToggleExpand}>Hide all waves</Button>
                    {fightGroup.waves.map((wave, index) => (
                        <Wave
                            key={index}
                            wave={wave.wave}
                            index={wave.index}
                            waveIndex={wave.waveIndex!}
                            onSelectFight={onSelectFight}
                        />))}
                </>
                    : <Button color="primary" onClick={onToggleExpand}>Show all waves</Button>}
            </div>
        </div>
    );
};