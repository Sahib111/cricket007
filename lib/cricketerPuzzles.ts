export interface Hint {
    text: string;
    reward: number;
}

export interface Puzzle {
    answer: string;
    riddle: string;
    hints: Hint[];
}

export const PUZZLES: Puzzle[] = [
    {
        answer: 'VIRENDER SEHWAG',
        riddle: '"I am the only player to score two test triple centuries and a double century in ODI. Who am I?"',
        hints: [
            { text: 'I am known as the Sultan of Multan', reward: 15 },
            { text: 'I made my international debut over two decades ago', reward: 12 },
            { text: 'I have represented my country in over 300 international matches', reward: 7 },
            { text: 'My jersey number is a single digit', reward: 3 },
            { text: 'My surname starts with the same letter as my nickname', reward: 1 },
        ],
    },
    {
        answer: 'VIRAT KOHLI',
        riddle: '"I have the most centuries in ODI cricket history. Who am I?"',
        hints: [
            { text: 'I was born in Delhi, India', reward: 15 },
            { text: 'I captained my national team for several years', reward: 12 },
            { text: 'I am often called the "Chase Master"', reward: 7 },
            { text: 'My jersey number is 18', reward: 3 },
            { text: 'My wife is a Bollywood actress', reward: 1 },
        ],
    },
    {
        answer: 'BEN STOKES',
        riddle: '"I led my team to a dramatic World Cup win in a Super Over. Who am I?"',
        hints: [
            { text: 'I was born in New Zealand but play for England', reward: 15 },
            { text: 'I am known for my all-round abilities', reward: 12 },
            { text: 'I hit an unbeaten 135 in the 2019 World Cup final', reward: 7 },
            { text: 'I have captained the England Test team', reward: 3 },
            { text: 'My surname rhymes with "jokes"', reward: 1 },
        ],
    },
    {
        answer: 'SACHIN TENDULKAR',
        riddle: '"I am the only player to score 100 international centuries. Who am I?"',
        hints: [
            { text: 'I am from India and started my international career as a teenager', reward: 15 },
            { text: 'I am often called the "God of Cricket" in my country', reward: 12 },
            { text: 'I played 200 Test matches, more than anyone else', reward: 7 },
            { text: 'My first name means "pure" in Sanskrit', reward: 3 },
            { text: 'I retired in 2013 at Wankhede Stadium, my home ground', reward: 1 },
        ],
    },
    {
        answer: 'SHANE WARNE',
        riddle: '"I bowled the \'Ball of the Century\' to Mike Gatting in 1993. Who am I?"',
        hints: [
            { text: 'I am Australian and considered one of the greatest spin bowlers ever', reward: 15 },
            { text: 'I took over 700 Test wickets in my career', reward: 12 },
            { text: 'I never captained my country at Test level despite being vice-captain', reward: 7 },
            { text: 'I was known for my blonde hair and larger-than-life personality', reward: 3 },
            { text: 'I passed away suddenly in 2022, shocking the cricket world', reward: 1 },
        ],
    },
    {
        answer: 'BRIAN LARA',
        riddle: '"I hold the record for the highest individual score in Test cricket. Who am I?"',
        hints: [
            { text: 'I am from Trinidad and Tobago, representing the West Indies', reward: 15 },
            { text: 'I scored 400 not out against England in 2004', reward: 12 },
            { text: 'I also once held the record for highest first-class score, 501 not out', reward: 7 },
            { text: 'I captained the West Indies team multiple times', reward: 3 },
            { text: 'My nickname is "The Prince of Trinidad"', reward: 1 },
        ],
    },
    {
        answer: 'MS DHONI',
        riddle: '"I led my country to victory in the 2011 World Cup with a six. Who am I?"',
        hints: [
            { text: 'I am a former Indian wicketkeeper-batsman and captain', reward: 15 },
            { text: 'I am the only captain to win all three ICC white-ball trophies', reward: 12 },
            { text: 'I am known for my calm demeanor under pressure', reward: 7 },
            { text: 'My nickname is "Captain Cool"', reward: 3 },
            { text: 'I finished the 2011 World Cup final with a six over long-on', reward: 1 },
        ],
    },
    {
        answer: 'JASPRIT BUMRAH',
        riddle: '"I am known for my unique bowling action and yorkers. Who am I?"',
        hints: [
            { text: 'I am an Indian fast bowler from Gujarat', reward: 15 },
            { text: 'My bowling action is considered unconventional but highly effective', reward: 12 },
            { text: 'I am especially feared during death overs in limited-overs cricket', reward: 7 },
            { text: 'My jersey number is 93', reward: 3 },
            { text: 'I am married to a sports presenter', reward: 1 },
        ],
    },
    {
        answer: 'AB DE VILLIERS',
        riddle: '"I am nicknamed \'Mr. 360\' for my ability to hit the ball anywhere on the field. Who am I?"',
        hints: [
            { text: 'I am a former South African batsman', reward: 15 },
            { text: 'I could bat, keep wicket, and bowl during my career', reward: 12 },
            { text: 'I once scored an ODI century off just 31 balls', reward: 7 },
            { text: 'I retired from international cricket in 2018', reward: 3 },
            { text: 'My initials come from my full first names, Abraham Benjamin', reward: 1 },
        ],
    },
    {
        answer: 'PAT CUMMINS',
        riddle: '"I captained my country to a World Test Championship and a 50-over World Cup win. Who am I?"',
        hints: [
            { text: 'I am an Australian fast bowler and current national captain', reward: 15 },
            { text: 'I made my Test debut as a teenager against South Africa', reward: 12 },
            { text: 'I am known for my pace and ability to reverse-swing the old ball', reward: 7 },
            { text: 'I led my team to victory in the 2023 ODI World Cup final in India', reward: 3 },
            { text: 'My surname is also a common English word for autumn', reward: 1 },
        ],
    },
];