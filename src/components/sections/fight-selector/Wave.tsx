import { WaveMetaData } from "../../../models/Waves";
import { Fight } from "./Fight";

interface WaveProps {
    wave: WaveMetaData;
    index: number;
    waveIndex: number;
    onSelectFight: (index: number, waveIndex: number, fightIndex: number) => void;
}

export const Wave: React.FC<WaveProps> = ({wave, index, waveIndex, onSelectFight}) => {
    const nameColor = wave.success ? 'rgb(128, 230, 102)' : 'rgb(230, 128, 102)';
    const handleClick = (fightIndex: number) => {
        onSelectFight(index, waveIndex, fightIndex);
    };
    return (
        <div className="damage-done-container">
            <div className="fight-title">
                <p style={{color: nameColor}}>{wave.name}</p>
            </div>
            <div className="fight-list">
                {wave.fights.map((fight, index) => {
                    return <Fight fight={fight} index={index} title={fight.name} onSelectFight={handleClick} isShortest={false} />;
                })}
            </div>
        </div>
    );
};