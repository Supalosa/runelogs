import { FightMetaData } from "../../../models/Fight";
import { formatHHmmss } from "../../../utils/utils";

interface RaidFightProps {
    fight: FightMetaData;
    index: number;
    raidIndex: number;
    fightName: string;
    onSelectFight: (index: number, raidIndex: number) => void;
    isShortest: boolean;
}

export const RaidFight: React.FC<RaidFightProps> = ({fight, index, raidIndex, fightName, onSelectFight}) => {
    const time = new Date(`2000-01-01T${fight.time}`);

    const formattedTime = time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    const nameColor = fight.success ? 'rgb(128, 230, 102)' : 'rgb(230, 128, 102)';

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectFight(index, raidIndex);

    };
    const formattedDuration = formatHHmmss(fight.fightLengthMs, false);

    return (
        <div className="raid-fight-container" onClick={handleClick}>
            <div className="fight-title">
                <div style={{color: nameColor}}>{`${fightName} (${formattedDuration})`}</div>
            </div>
            <div>{formattedTime}</div>
        </div>
    );
};