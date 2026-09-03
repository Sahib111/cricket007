/**
 * Cricket Trivia Data
 *
 * 35 non-trivial cricket facts covering history, records, laws, and stats.
 * Extend this array to grow the daily trivia pool.
 * Fact selection in DailyTriviaBar uses: dayOfYear % facts.length
 * so the same fact shows all day and rotates automatically at midnight.
 */

export type TriviaCategory = 'history' | 'records' | 'laws' | 'stats';

export interface TriviaFact {
  id: number;
  fact: string;
  category: TriviaCategory;
  yearOrContext: string;
}

export const triviaFacts: TriviaFact[] = [
  {
    id: 1,
    fact: "The Laws of Cricket allow a fielder to catch a ball that has rebounded off their own helmet, and the batting team is NOT awarded penalty runs — only helmet-to-ground contact by a fielder's helmet triggers 5 penalty runs.",
    category: 'laws',
    yearOrContext: 'MCC Law 28.3',
  },
  {
    id: 2,
    fact: "Sachin Tendulkar was once given out 'Handled the ball' in a Test match against South Africa in 2001 — one of the rarest dismissals in cricket, since replaced by 'Obstructing the field' under revised Laws.",
    category: 'history',
    yearOrContext: '2001 – Nagpur Test',
  },
  {
    id: 3,
    fact: "Jim Laker took 19 wickets in a single Test match at Old Trafford in 1956 — the only time in history a bowler has claimed 19 wickets in one Test. His figures of 9/37 and 10/53 remain unsurpassed.",
    category: 'records',
    yearOrContext: '1956 – England vs Australia, Old Trafford',
  },
  {
    id: 4,
    fact: "The Duckworth–Lewis–Stern method was first used officially in a One-Day International in 1997, but it replaced a system that simply used run-rate — which notoriously allowed the 1992 World Cup semi-final rain interruption to reduce South Africa's target from 22 off 13 balls to 21 off 1 ball.",
    category: 'history',
    yearOrContext: '1992–1997 D/L transition',
  },
  {
    id: 5,
    fact: "In 2001, VVS Laxman batted at No. 6, but after a partnership with Rahul Dravid (376 runs in under two days), India became only the third side ever to win a Test after following on — against Australia at Eden Gardens.",
    category: 'history',
    yearOrContext: '2001 – Kolkata Test, India vs Australia',
  },
  {
    id: 6,
    fact: "A cricket ball can be bowled legally with two different types of reverse swing depending on which side of the ball faces the batsman — a discovery largely attributed to Pakistan's Sarfraz Nawaz in the late 1970s, later popularised by Waqar Younis.",
    category: 'history',
    yearOrContext: '1978 onwards – Pakistan',
  },
  {
    id: 7,
    fact: "The Laws of Cricket permit the batting team to declare an innings closed even if only one batsman is present — provided the player is 'not out'. A declaration requires no minimum number of players.",
    category: 'laws',
    yearOrContext: 'MCC Law 15',
  },
  {
    id: 8,
    fact: "Brian Lara's world-record Test score of 400* in 2004 was achieved against the same opponent — England — as his previous record of 375 set in 1994. He scored both at the Antigua Recreation Ground.",
    category: 'records',
    yearOrContext: '1994 & 2004 – Antigua',
  },
  {
    id: 9,
    fact: "The first tied Test in history occurred between Australia and the West Indies in Brisbane in 1960. The match ended with the West Indies needing 6 runs off the last over, culminating in a run-out on the last ball.",
    category: 'history',
    yearOrContext: '1960 – Brisbane Test',
  },
  {
    id: 10,
    fact: "A batsman can be given out 'timed out' if they take more than 3 minutes to be ready to face a ball after the previous wicket falls. Angelo Mathews of Sri Lanka became the first player dismissed this way in an ICC World Cup match in 2023.",
    category: 'laws',
    yearOrContext: '2023 ODI World Cup – vs Bangladesh',
  },
  {
    id: 11,
    fact: "Muttiah Muralitharan's career strike rate of 67.0 balls per wicket makes him the most economical wicket-taker in Test history per delivery, beating Shane Warne (57.4 balls/wkt). Murali took 800 wickets vs Warne's 708.",
    category: 'stats',
    yearOrContext: 'Career stats – Murali & Warne',
  },
  {
    id: 12,
    fact: "The fielding circle used in ODIs (the 30-yard circle) was not part of the original Limited Overs format. Fielding restrictions were only introduced in 1980 at the Prudential Trophy — 12 years after the first ODI was played.",
    category: 'history',
    yearOrContext: '1980 – Fielding restriction introduction',
  },
  {
    id: 13,
    fact: "Pakistan's 1987 Test tour of England was the first in which ball-tampering was openly discussed. Pakistan bowlers used bottle-tops to roughen the ball — a method that wasn't yet explicitly banned, only covered vaguely under 'fair play'.",
    category: 'history',
    yearOrContext: '1987 – Pakistan tour of England',
  },
  {
    id: 14,
    fact: "The ICC Super Over rule in T20Is operates under Law 21.9 (Tie) — but if a Super Over itself ties, the side that hit more boundaries (including sixes) in the original match wins. This tie-breaking rule decided the 2019 ODI World Cup Final.",
    category: 'laws',
    yearOrContext: '2019 World Cup Final – England vs New Zealand',
  },
  {
    id: 15,
    fact: "Don Bradman's Test batting average of 99.94 is statistically the greatest outlier in any major team sport. The next best Test batting average (min 20 innings) belongs to Adam Voges at 61.87 — a gap of 38 runs per innings.",
    category: 'stats',
    yearOrContext: 'Career stats – 1928–1948',
  },
  {
    id: 16,
    fact: "The 2002 ICC Champions Trophy final between India and Sri Lanka was declared a shared title after rain prevented play on both the reserve day and the original match day — making it the only major ICC tournament to end without a winner.",
    category: 'history',
    yearOrContext: '2002 – ICC Champions Trophy, Colombo',
  },
  {
    id: 17,
    fact: "A bowler is allowed to switch from over-the-wicket to around-the-wicket mid-over but must inform the umpire each time. However, changing from right-arm to left-arm bowling (if genuinely ambidextrous) requires no notification.",
    category: 'laws',
    yearOrContext: 'MCC Law 21.1',
  },
  {
    id: 18,
    fact: "West Indies fast bowler Michael Holding once bowled an entire over of wides intentionally in a 1980 tour match against Otago — to avoid bowling at a local tailender, reportedly out of respect to avoid injuring him.",
    category: 'history',
    yearOrContext: '1980 – West Indies tour of New Zealand',
  },
  {
    id: 19,
    fact: "Virender Sehwag is the only batsman in history to score two Test triple centuries — 309 vs Pakistan (2004) and 319 vs South Africa (2008) — and he batted at the top of the order for both.",
    category: 'records',
    yearOrContext: '2004 & 2008 – Test cricket',
  },
  {
    id: 20,
    fact: "The first T20 International was played between Australia and New Zealand on February 17, 2005 — 3 years after the format debuted in English county cricket (2003 Twenty20 Cup). Australia won by 44 runs.",
    category: 'history',
    yearOrContext: '2005 – First T20I, Auckland',
  },
  {
    id: 21,
    fact: "Law 36 (LBW) states a ball cannot be given out LBW if it strikes the pad outside the off stump AND the batsman is playing a shot. But if the batsman plays no shot, the ball can be given out even if pitching outside leg stump was previously permitted before 1972.",
    category: 'laws',
    yearOrContext: '1972 LBW law amendment',
  },
  {
    id: 22,
    fact: "South Africa are the only Test-playing nation never to have won a men's 50-over World Cup. They have been eliminated in semi-finals or knock-out stages six times, giving rise to the term 'chokers' in cricket parlance.",
    category: 'stats',
    yearOrContext: '1992–2023 World Cups',
  },
  {
    id: 23,
    fact: "The 'Sandpaper Gate' scandal of 2018, in which Australia players used sandpaper to rough the ball in Cape Town, led to the largest bans in Cricket Australia history: 12 months for Steve Smith and David Warner, 9 months for Cameron Bancroft.",
    category: 'history',
    yearOrContext: '2018 – Newlands, Cape Town',
  },
  {
    id: 24,
    fact: "Rohit Sharma holds the record for the highest individual score in ODI history — 264 runs against Sri Lanka in Kolkata in 2014. He also holds the record for the most ODI centuries by an opener (29+).",
    category: 'records',
    yearOrContext: '2014 – Eden Gardens, Kolkata',
  },
  {
    id: 25,
    fact: "A batsman facing the last ball of an innings is allowed to take a run even if their partner is run out — the last wicket dismissal does not void any runs completed before the run-out. This was the subject of a famous 1993 Oval controversy.",
    category: 'laws',
    yearOrContext: 'MCC Law 38.2.1',
  },
  {
    id: 26,
    fact: "The fastest Test century in terms of balls faced is by Brendon McCullum — 54 balls vs Australia in Christchurch, 2016. He was also the first New Zealand player to score a Test triple century (302 in 2014).",
    category: 'records',
    yearOrContext: '2016 – Christchurch, New Zealand',
  },
  {
    id: 27,
    fact: "Australia famously refused to play a tour match in 1932–33 against Queensland, as the county team had just been routed in a Bodyline-bruised Sheffield Shield match. The 'Bodyline' controversy permanently changed laws on intimidatory bowling.",
    category: 'history',
    yearOrContext: '1932–33 – Bodyline series, England vs Australia',
  },
  {
    id: 28,
    fact: "In the ICC's Decision Review System (DRS), if a team incorrectly reviews and the ball-tracking shows it would miss the stumps, the team loses their review. But 'umpire's call' decisions (ball clipping stumps) do NOT consume a review — a distinction introduced in 2016.",
    category: 'laws',
    yearOrContext: "2016 \u2013 DRS umpire's call rule update",
  },
  {
    id: 29,
    fact: "Sri Lanka's Chaminda Vaas took a hat-trick off the very first three balls of a One-Day International — against Bangladesh in 2003 — the only time in ODI history that a bowler has taken a hat-trick with the first three deliveries of a match.",
    category: 'records',
    yearOrContext: '2003 – Sri Lanka vs Bangladesh, World Cup',
  },
  {
    id: 30,
    fact: "The concept of 'No Ball' for overstepping was introduced in 1864 — previously, bowlers were required to keep their rear foot behind the crease, not their front foot. The change fundamentally altered fast bowling run-ups worldwide.",
    category: 'history',
    yearOrContext: '1864 – Front foot no-ball law',
  },
  {
    id: 31,
    fact: "Scoring 1,000 Test runs in May — historically considered a sign of batting dominance before the modern calendar compressed overseas tours — was last achieved by Wally Hammond in 1927, who scored 1,042 runs across county and tour matches that month.",
    category: 'stats',
    yearOrContext: '1927 – Wally Hammond, England',
  },
  {
    id: 32,
    fact: "There is no rule preventing two batters from occupying the same crease simultaneously, but if only one crease is occupied and a fielding team breaks the other wicket, neither batter is out — the Laws only allow one dismissal per ball.",
    category: 'laws',
    yearOrContext: 'MCC Law 38 – Run Out',
  },
  {
    id: 33,
    fact: "The ICC Test Championship Mace — given to the world's top-ranked Test team — has been held by just five nations since its inception in 2003: Australia, South Africa, England, India, and New Zealand, with India holding it for the longest uninterrupted spell.",
    category: 'stats',
    yearOrContext: '2003 onwards – ICC rankings',
  },
  {
    id: 34,
    fact: "Pakistan's 1999 tour of India was the first bilateral cricket series between the two nations in 12 years — and was watched by an estimated 400 million viewers per match in India alone, making it one of the most-watched sporting events in history.",
    category: 'history',
    yearOrContext: '1999 – India vs Pakistan bilateral series',
  },
  {
    id: 35,
    fact: "Malcolm Marshall bowled with his left hand in plaster during the 1984 Headingley Test against England after breaking his thumb while fielding — and still managed to take 7 wickets in the match bowling with his right arm at full pace.",
    category: 'records',
    yearOrContext: '1984 – Headingley, England vs West Indies',
  },
];
