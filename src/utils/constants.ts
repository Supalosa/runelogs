export const BOSS_NAMES = [
    "Scurrius",
    "Kree'arra",
    "Commander Zilyana",
    "General Graardor",
    "K'ril Tsutsaroth",
    "Nex",
    "Kalphite Queen",
    "Sarachnis",
    "Scorpia",
    "Abyssal Sire",
    "Kraken",
    "Dagannoth Rex",
    "Dagannoth Supreme",
    "Dagannoth Prime",
    "The Leviathan",
    "The Whisperer",
    "Vardorvis",
    "Duke Sucellus",
    "Tekton",
    "Ice demon",
    "Vanguard",
    "Vespula",
    "Vasa Nistirio",
    "Muttadile",
    "Great Olm",
    "The Maiden of Sugadinti",
    "Pestilent Bloat",
    "Nylocas Vasilias",
    "Sotetseg",
    "Xarpus",
    "Verzik Vitur",
    "Ba-Ba",
    "Akkha",
    "Akkha's Shadow",
    "Kephri",
    "Zebak",
    "Obelisk",
    "Tumeken's Warden",
    "Ahrim the Blighted",
    "Dharok the Wretched",
    "Guthan the Infested",
    "Karil the Tainted",
    "Torag the Corrupted",
    "Verac the Defiled",
    "Corporeal Beast",
    "King Black Dragon",
    "Vorkath",
    "Zulrah",
    "Fragment of Seren",
    "Alchemical Hydra",
    "Bryophyta",
    "Callisto",
    "Cerberus",
    "Chaos Elemental",
    "Chaos Fanatic",
    "Crazy Archaeologist",
    "Crystalline Hunllef",
    "Corrupted Hunllef",
    "Deranged Archaeologist",
    "Giant Mole",
    "Hespori",
    "The Mimic",
    "The Nightmare",
    "Obor",
    "Phantom Muspah",
    "Skotizo",
    "Thermonuclear Smoke Devil",
    "TzKal-Zuk",
    "TzTok-Jad",
    "Venenatis",
    "Vet'ion",
    "Blood Moon",
    "Blue Moon",
    "Eclipse Moon",
    "Sol Heredit",
];

export const BOSS_TO_MINIONS = {
    "Nylocas Vasilias": ["Nylocas Hagios", "Nylocas Ischyros", "Nylocas Toxobolos"],
};

export const MINION_TO_BOSS = Object.entries(BOSS_TO_MINIONS).reduce((acc, [boss, minions]) => {
    minions.forEach(minion => {
        acc[minion] = boss;
    });
    return acc;
}, {} as { [key: string]: string });

export const PLAYER_HOUSE_REGION_1 = 7769;
export const PLAYER_HOUSE_REGION_2 = 7770;

export const BLOOD_MOON_REGION = 5526;
export const BLUE_MOON_REGION = 5783;
export const ECLIPSE_MOON_REGION = 6038;
export const NEYPOTZLI_REGION_1 = 5525;
export const NEYPOTZLI_REGION_2 = 5527;
export const NEYPOTZLI_REGION_3 = 6039;