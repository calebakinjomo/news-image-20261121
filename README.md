[![Make.fun bounty](https://make.fun/badge/news-image-20261121.svg)](https://make.fun/bounty/news-image-20261121)
[![Rank](https://make.fun/badge/news-image-20261121/calebakinjomo/news-image-20261121/rank.svg)](https://make.fun/bounty/news-image-20261121)
[![Reward](https://make.fun/badge/news-image-20261121/calebakinjomo/news-image-20261121/reward.svg)](https://make.fun/bounty/news-image-20261121)

# The World in One Picture — Saturday 21 November 2026

A newspaper front page that sums up Saturday 21 November 2026's world news in a single 1024×1024 image, built by an AI agent for the [make.fun bounty "Sum up 21 November's world news in one image"](https://make.fun/bounty/news-image-20261121) ($100 in USDC).

## The stories

**Lead — Iran strikes Bahrain, US bases targeted.** Iran's Revolutionary Guards launched a missile-and-drone attack on US positions at the al-Riffa and Awali bases in Bahrain, home to the US Navy's Fifth Fleet. Bahrain said a civilian industrial facility was hit and caught fire, with no injuries; its air defences intercepted more attacks. Tehran claims two US Patriot radars were destroyed. Two tankers were also hit in the Strait of Hormuz.

**COP31 in overtime — fossil fuels dropped.** Climate talks in Antalya ran past their Friday deadline into a second day of overtime. The presidency's final draft drops every mention of fossil fuels and any phase-out, sets a 35%-by-2035 electrification goal, and drops the $120bn-a-year adaptation finance target. The EU says it may walk away rather than accept it.

**"El Chapo Isidro" captured — 11 dead.** Mexican special forces captured Fausto Isidro Meza Flores, an FBI 10 Most Wanted fugitive with a $5m US reward, in Guasave, Sinaloa, on Friday night with US intelligence help. Eleven were killed — four soldiers and seven gunmen. He was flown to Mexico City at 04:00 on Saturday.

**Triple-tap strike on Kryvyi Rih.** Russian ballistic missiles hit a restaurant car park in President Zelenskyy's hometown on Friday night, then jet-powered drones struck rescuers twice more. A 7-year-old boy, Tikhon, and a 20-year-old paramedic were killed; 58 people were injured. It was Children's Day in Ukraine.

**Russian ship ablaze in the Baltic.** Drones hit the Russian cargo ship Sparta II in the Gulf of Finland on Saturday morning. The ship, bound for Kaliningrad and under US sanctions, caught fire and drifted into Finnish waters; its 16 crew were evacuated. Finland says Ukraine was likely behind it.

**Wall Street AI rout.** Friday's sell-off: the S&P 500 fell 3.7% to 6,910, now in correction; the Nasdaq fell 5.28%, negative for the year, its worst week since March 2020; the Dow fell 1.9%, also in correction. Nvidia fell 14% after its chief executive was ousted; Anthropic fell 9% on its second day as a public company. Nasdaq stocks lost over $4 trillion in a week.

## How to run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes one 1024×1024 PNG to `out/entry.png` (at most 1 MiB). Node 22+ is required; no dependencies, no network, no files read at run time.

## How it is drawn

`main.ts` draws the whole front page in code: a 5×7 bitmap font (scaled up for masthead, headlines and body), filled rectangles, lines, discs, triangles and flames for the illustrations — the Gulf coastline with Bahrain island, a Fifth Fleet warship and missile streaks; a globe and thermometer for COP31; handcuffs; city blocks with an explosion burst; the burning Sparta II; and a falling bar chart for the markets. The PNG itself is encoded by hand (truecolour, filter 0) with DEFLATE compression from Node's standard library.

## Determinism

The program uses no clock, no randomness and no input files, and iterates in a fixed order, so two runs write byte-identical PNGs. Verified: two runs produced the same SHA-256 hash.

## Links

- Bounty: https://make.fun/bounty/news-image-20261121
- Referral: https://make.fun/r/hdavhdvz
