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
            { text: 'I was born in India', reward: 15 },
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
            { text: 'I was born in New Zealand', reward: 15 },
            { text: 'I am known for my all-round abilities', reward: 12 },
            { text: 'I hit an unbeaten 135 in the 2019 World Cup final', reward: 7 },
            { text: 'I have captained the England Test team', reward: 3 },
            { text: 'My surname rhymes with "jokes"', reward: 1 },
        ],
    },
    {
        answer: 'SACHIN TENDULKAR',
        riddle: '"I am the only player who have the sexiest daughter. Who am I?"',
        hints: [
            { text: 'I am from India', reward: 15 },
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
            { text: 'I am Australian and considered one of the greatest bowlers ever', reward: 15 },
            { text: 'I took over 700+ Test wickets in my career', reward: 12 },
            { text: 'I never captained my country at Test level despite being vice-captain', reward: 7 },
            { text: 'I was known for my blonde hair and larger-than-life personality', reward: 3 },
            { text: 'I passed away suddenly in 2022, shocking the cricket world', reward: 1 },
        ],
    },
    {
        answer: 'BRIAN LARA',
        riddle: '"I hold the record for the highest individual score in Test cricket. Who am I?"',
        hints: [
            { text: 'I am from Trinidad and Tobago, representing the  West Indies', reward: 15 },
            { text: 'I scored many runs not out against England in 2004', reward: 12 },
            { text: 'I also once held the record for highest first-class score, 501 not out', reward: 7 },
            { text: 'I captained the West Indies team multiple times', reward: 3 },
            { text: 'My nickname is "The Prince of Trinidad"', reward: 1 },
        ],
    },
    {
        answer: 'MS DHONI',
        riddle: '"I have many memes of my name on the internet. Who am I?"',
        hints: [
            { text: 'I am a former captain', reward: 15 },
            { text: 'I am the only captain to win all ICC white-ball trophies', reward: 12 },
            { text: 'I am known for my calm demeanor under pressure', reward: 7 },
            { text: 'My nickname is "Captain Cool"', reward: 3 },
            { text: 'I finished the 2011 World Cup final with a six over long-on', reward: 1 },
        ],
    },
    {
        answer: 'JASPRIT BUMRAH',
        riddle: '"I am known for my unique bowling action. Who am I?"',
        hints: [
            { text: 'I am an Indian fast bowler who never disappoints', reward: 15 },
            { text: 'My bowling action is considered unconventional but highly effective', reward: 12 },
            { text: 'I am especially feared during death overs in limited-overs cricket', reward: 7 },
            { text: 'My jersey number is 93', reward: 3 },
            { text: 'I am married to a sports presenter', reward: 1 },
        ],
    },
    {
        answer: 'AB DE VILLIERS',
        riddle: '"I have ability to hit the ball anywhere on the field. Who am I?"',
        hints: [
            { text: 'I am a former wicketkeeper batsman', reward: 15 },
            { text: 'I could bat, keep wicket, and bowl during my career', reward: 12 },
            { text: 'I once scored an ODI century off just 31 balls', reward: 7 },
            { text: 'I retired from international cricket in 2018', reward: 3 },
            { text: 'My initials come from my full first names, Abraham Benjamin', reward: 1 },
        ],
    },
    {
        answer: 'PAT CUMMINS',
        riddle: '"I am hated by many Indians. Who am I?"',
        hints: [
            { text: 'I am an fast bowler and national captain', reward: 15 },
            { text: 'I made my Test debut as a teenager against South Africa', reward: 12 },
            { text: 'I am known for my pace and ability to reverse-swing the old ball', reward: 7 },
            { text: 'I led my team to victory in the ODI World Cup final in India', reward: 3 },
            { text: 'My surname is also a common English word for autumn', reward: 1 },
        ],
    },
    {
        answer: 'KANE WILLIAMSON',
        riddle: "I rarely let my bat make more noise than my personality. Who am I?",
        hints: [
            { text: 'I captained my country to a Championship title', reward: 15 },
            { text: 'My Test batting average has remained above 50 for much of my career', reward: 12 },
            { text: 'I scored a century in a World Cup final', reward: 7 },
            { text: 'I am from Tauranga, New Zealand', reward: 3 },
            { text: 'My initials are K.W.', reward: 1 }
        ]
    },

    {
        answer: 'RAHUL DRAVID',
        riddle: "My greatest weapon was patience. Who am I?",
        hints: [
            { text: 'I once spent more than 12 hours at the crease in a Test match', reward: 15 },
            { text: 'I scored Test centuries in all ten countries where I played Tests', reward: 12 },
            { text: 'I was known as "The Wall"', reward: 7 },
            { text: 'I later coached the Indian national team', reward: 3 },
            { text: 'My first name is Rahul', reward: 1 }
        ]
    },

    {
        answer: 'MUTTIAH MURALITHARAN',
        riddle: "My deliveries confused batsmen long before analysts could explain them. Who am I?",
        hints: [
            { text: 'I took more than 1,000 international wickets across formats', reward: 15 },
            { text: 'I finished my Test career with 800 wickets', reward: 12 },
            { text: 'I am the highest wicket-taker in Test cricket history', reward: 7 },
            { text: 'I represented Sri Lanka', reward: 3 },
            { text: 'My first name begins with M', reward: 1 }
        ]
    },

    {
        answer: 'GLENN MAXWELL',
        riddle: "I can turn a conventional cricket shot into something that looks completely wrong—and still works. Who am I?",
        hints: [
            { text: 'I have represented Australia', reward: 15 },
            { text: 'I scored an unbeaten double century in a World Cup', reward: 12 },
            { text: 'I became one of the most recognizable users of the reverse sweep', reward: 7 },
            { text: 'My nickname is "The Big Show"', reward: 3 },
            { text: 'My first name is Glenn', reward: 1 }
        ]
    },

    {
        answer: 'JACQUES KALLIS',
        riddle: "For me, choosing between bat and ball was almost unnecessary. Who am I?",
        hints: [
            { text: 'I scored over 25,000 international runs and took more than 500 wickets', reward: 15 },
            { text: 'I am widely regarded as a greatest all-rounders', reward: 12 },
            { text: 'I scored 45 Test centuries', reward: 7 },
            { text: 'I represented South Africa', reward: 3 },
            { text: 'My surname begins with K', reward: 1 }
        ]
    },

    {
        answer: 'VVS LAXMAN',
        riddle: "My initials are short, but one of my innings became almost impossible to forget. Who am I?",
        hints: [
            { text: 'One of my most famous innings came after my team was asked to follow on', reward: 15 },
            { text: 'I scored 281 against Australia at Eden Gardens', reward: 12 },
            { text: 'That innings helped India win despite being forced to follow on', reward: 7 },
            { text: 'I was primarily a Test specialist for India', reward: 3 },
            { text: 'My initials are VVS', reward: 1 }
        ]
    },

    {
        answer: 'MAHELA JAYAWARDENE',
        riddle: "One of my greatest innings happened on a stage where almost everyone expected a different ending. Who am I?",
        hints: [
            { text: 'I scored 374 in a Test match, one of the highest individual scores in Test history', reward: 15 },
            { text: 'I scored a century in a World Cup final', reward: 12 },
            { text: 'I captained Sri Lanka in international cricket', reward: 7 },
            { text: 'I was part of Sri Lanka"s 2007 World Cup final team', reward: 3 },
            { text: 'My first name is Mahela', reward: 1 }
        ]
    },

    {
        answer: 'YUVRAJ SINGH',
        riddle: "I turned six consecutive moments into six identical celebrations. Who am I?",
        hints: [
            { text: 'I hit six sixes in a single over in a T20 World Cup', reward: 15 },
            { text: 'I was named Player of the Tournament at the 2011 ODI World Cup', reward: 12 },
            { text: 'I contributed with both bat and ball during the 2011 World Cup', reward: 7 },
            { text: 'I represented India', reward: 3 },
            { text: 'My first name begins with Y', reward: 1 }
        ]
    },

    {
        answer: 'DALE STEYN',
        riddle: "My reputation was built on making the ball arrive before the batsman wanted it to. Who am I?",
        hints: [
            { text: 'I once held the record for the fastest strike rate among bowlers with 200+ Test wickets', reward: 15 },
            { text: 'I reached 400 Test wickets faster than any South African bowler at the time', reward: 12 },
            { text: 'I was known for extreme pace and aggressive fast bowling', reward: 7 },
            { text: 'I represented South Africa', reward: 3 },
            { text: 'My surname starts with S', reward: 1 }
        ]
    },

    {
        answer: 'SHAKIB AL HASAN',
        riddle: "For years, my country could rely on me to contribute in more than one department. Who am I?",
        hints: [
            { text: 'I have been ranked No. 1 in the ICC all-rounder rankings across multiple formats', reward: 15 },
            { text: 'I became one of the leading wicket-takers in ODI cricket', reward: 12 },
            { text: 'I have scored thousands of international runs while also taking hundreds of wickets', reward: 7 },
            { text: 'I represented Bangladesh', reward: 3 },
            { text: 'My name begins with Shakib', reward: 1 }
        ]
    },

    {
        answer: 'ROSS TAYLOR',
        riddle: "My career crossed generations, formats and captains, but my bat remained familiar. Who am I?",
        hints: [
            { text: 'I became the first player to reach 100 international appearances in all three formats', reward: 15 },
            { text: 'I scored more than 18,000 international runs', reward: 12 },
            { text: 'I played 236 ODIs for my country', reward: 7 },
            { text: 'I represented New Zealand', reward: 3 },
            { text: 'My surname is Taylor', reward: 1 }
        ]
    },

    {
        answer: 'INZAMAM UL HAQ',
        riddle: "My timing often looked effortless, even when the scoreboard demanded something extraordinary. Who am I?",
        hints: [
            { text: 'I scored the winning runs in the final of the 1992 World Cup', reward: 15 },
            { text: 'I became one of highest run-scorers in ODI cricket', reward: 12 },
            { text: 'I scored 329 in a Test against New Zealand', reward: 7 },
            { text: 'I captained Pakistan in international cricket', reward: 3 },
            { text: 'My first name begins with Inzamam', reward: 1 }
        ]
    },

    {
        answer: 'KUMAR SANGAKKARA',
        riddle: "Behind the gloves was a batsman whose numbers eventually became impossible to ignore. Who am I?",
        hints: [
            { text: 'I scored four consecutive ODI centuries during the 2015 World Cup', reward: 15 },
            { text: 'I scored 319 in a Test match against Bangladesh', reward: 12 },
            { text: 'I combined wicketkeeping with elite-level batting', reward: 7 },
            { text: 'I represented Sri Lanka', reward: 3 },
            { text: 'My surname begins with S', reward: 1 }
        ]
    },

    {
        answer: 'GARFIELD SOBERS',
        riddle: "I am the only player in Test history to have scored 6,000 runs, taken 200 wickets, and held 100 catches. Who am I?",
        hints: [
            { text: 'I scored 365 not out in a Test match, setting a world record at the time', reward: 20 },
            { text: 'I am widely regarded as the greatest all-rounder of all time', reward: 15 },
            { text: 'I represented the West Indies', reward: 12 },
            { text: 'I could bowl fast, medium pace, and spin', reward: 7 },
            { text: 'My nickname was "Garry" ', reward: 3 },
            { text: 'My first name is Garfield', reward: 1 }
        ]
    },

    {
        answer: 'JACK HOBBS',
        riddle: "I scored more first-class centuries than any other batsman in history. Who am I?",
        hints: [
            { text: 'I scored 199 in a single innings, the highest score by an English batsman in Tests at the time', reward: 20 },
            { text: 'I played my entire domestic career for Surrey', reward: 15 },
            { text: 'I am often called "The Master"', reward: 12 },
            { text: 'I scored 61,237 first-class runs', reward: 7 },
            { text: 'I represented England in Test cricket', reward: 3 },
            { text: 'My first name is Jack', reward: 1 }
        ]
    },

    {
        answer: 'LEN HUTTON',
        riddle: "I captained England in the first-ever Test match held at Lord's. Who am I?",
        hints: [
            { text: 'I scored 364 in a Test match, the highest individual score in Test history for many years', reward: 20 },
            { text: 'I scored 364 against Australia at The Oval in 1938', reward: 15 },
            { text: 'I was known for my immaculate technique and concentration', reward: 12 },
            { text: 'I scored more than 6,000 Test runs for England', reward: 7 },
            { text: 'I captained England in 30 Test matches', reward: 3 },
            { text: 'My surname begins with H', reward: 1 }
        ]
    },

    {
        answer: 'DAVID GOWER',
        riddle: "I am remembered for my stylish left-handed batting and entertaining style of play. Who am I?",
        hints: [
            { text: 'I scored 152 against Australia in a Boxing Day Test at Melbourne', reward: 20 },
            { text: 'I was a graceful and flamboyant batsman for England', reward: 15 },
            { text: 'I scored 8,231 Test runs at an average of 44.25', reward: 12 },
            { text: 'I captained England in 35 Test matches', reward: 7 },
            { text: 'I am primarily known as a left-handed batsman', reward: 3 },
            { text: 'My surname is Gower', reward: 1 }
        ]
    },

    {
        answer: 'ALASTAIR COOK',
        riddle: "I am England's leading run-scorer in Test cricket. Who am I?",
        hints: [
            { text: 'I scored 12,472 Test runs, the most by any English batsman', reward: 20 },
            { text: 'I am the first English batsman to score 10,000 Test runs', reward: 15 },
            { text: 'I scored 244* against Australia in Perth in 2013', reward: 12 },
            { text: 'I captained England in 59 Test matches', reward: 7 },
            { text: 'I am a left-handed opening batsman', reward: 3 },
            { text: 'My first name is Alastair', reward: 1 }
        ]
    },

    {
        answer: 'IAN BOTHAM',
        riddle: "I played a pivotal role in one of England's greatest Ashes victories with both bat and ball. Who am I?",
        hints: [
            { text: 'I scored 149* at Headingley in 1981, one of the greatest Ashes innings ever', reward: 20 },
            { text: 'I took 5 wickets in 11 balls against Australia at Headingley', reward: 15 },
            { text: 'I scored over 5,000 Test runs and took over 380 wickets', reward: 12 },
            { text: 'I am widely regarded as one of the greatest all-rounders', reward: 7 },
            { text: 'I represented England in Ashes series', reward: 3 },
            { text: 'My surname begins with B', reward: 1 }
        ]
    },

    {
        answer: 'KEVIN PIETERSEN',
        riddle: "I scored one of the most destructive centuries in Ashes history at The Oval. Who am I?",
        hints: [
            { text: 'I scored 186 at The Oval in 2005 to help England retain the Ashes', reward: 20 },
            { text: 'I was a dynamic and aggressive batsman for England', reward: 15 },
            { text: 'I scored 8,181 Test runs at a strike rate of 74.7', reward: 12 },
            { text: 'I was part of England"s 2010 T20 World Cup winning team', reward: 7 },
            { text: 'I was known for my "switch hit" shot', reward: 3 },
            { text: 'My surname is Pietersen', reward: 1 }
        ]
    },

    {
        answer: 'GARY KIRSTEN',
        riddle: "I was the leading run-scorer in the 1996 World Cup with 605 runs. Who am I?",
        hints: [
            { text: 'I scored 210 in a Test match against England in Durban', reward: 20 },
            { text: 'I opened the batting for South Africa for many years', reward: 15 },
            { text: 'I scored 7,273 Test runs at an average of 45.27', reward: 12 },
            { text: 'I coached the Indian cricket team to victory in the 2011 World Cup', reward: 7 },
            { text: 'I played 101 Test matches for South Africa', reward: 3 },
            { text: 'My first name is Gary', reward: 1 }
        ]
    },

    {
        answer: 'GRAEME SMITH',
        riddle: "I am the youngest player to have captained a Test team at the age of 22. Who am I?",
        hints: [
            { text: 'I scored 311* against England in Birmingham in 2003', reward: 20 },
            { text: 'I captained South Africa in 109 Test matches, the most by any captain', reward: 15 },
            { text: 'I scored 9,265 Test runs at an average of 48.48', reward: 12 },
            { text: 'I was a left-handed opening batsman and occasional left-arm spinner', reward: 7 },
            { text: 'I led South Africa to the No. 1 ranking in Test cricket', reward: 3 },
            { text: 'My surname begins with S', reward: 1 }
        ]
    },

];