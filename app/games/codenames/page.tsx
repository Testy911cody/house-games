"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, RotateCcw, Crown, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

const CODEWORDS = [
  "APPLE", "ARROW", "BALL", "BANK", "BEAR", "BED", "BEE", "BIRD", "BLOCK", "BOARD",
  "BOLT", "BOMB", "BOOK", "BOW", "BOX", "BRIDGE", "BRUSH", "BUCKET", "BUG", "BULL",
  "CAKE", "CAMEL", "CAP", "CAR", "CARD", "CARROT", "CASTLE", "CAT", "CHAIN", "CHEST",
  "CHICK", "CHINA", "CHURCH", "CIRCLE", "CLIFF", "CLOAK", "CLOCK", "CLOUD", "CLOWN", "COACH",
  "COAST", "COIN", "COMIC", "COMPOUND", "CONCERT", "CONDUCTOR", "CONTRACT", "COOK", "COPPER", "COTTON",
  "COURT", "COVER", "CRANE", "CRASH", "CRICKET", "CROSS", "CROWN", "CYCLE", "DANCE", "DATE",
  "DAY", "DEATH", "DECK", "DEGREE", "DESIGN", "DESK", "DIAMOND", "DICE", "DINOSAUR", "DISEASE",
  "DOCTOR", "DOG", "DOLL", "DOOR", "DRAFT", "DRAGON", "DRESS", "DRILL", "DRINK", "DRIVE",
  "DROWN", "DRUM", "DUCK", "DUMB", "DUTY", "EARTH", "EAST", "EAT", "EDGE", "EGG",
  "ELBOW", "ELEPHANT", "EMPIRE", "ENGINE", "ENGLAND", "EUROPE", "EYE", "FACE", "FAIR", "FALL",
  "FAN", "FENCE", "FIELD", "FIGHTER", "FIGURE", "FILE", "FILM", "FIRE", "FISH", "FLUTE",
  "FLY", "FOOT", "FORCE", "FOREST", "FORK", "FRAME", "FRANCE", "FREEDOM", "FROG", "FUEL",
  "GAME", "GAS", "GENIUS", "GERMANY", "GHOST", "GIANT", "GLASS", "GLOVE", "GOLD", "GRACE",
  "GRASS", "GREEK", "GREEN", "GROUND", "HAM", "HAND", "HAPPY", "HARP", "HAT", "HEAD",
  "HEART", "HELICOPTER", "HIMALAYAS", "HOLE", "HOLLYWOOD", "HONEY", "HOOD", "HOOK", "HORN", "HORSE",
  "HOSE", "HOTEL", "HOUR", "HOUSE", "ICE", "ICELAND", "INK", "IRON", "ISLAND", "IVORY",
  "JACK", "JAM", "JET", "JEW", "JOB", "JOCKEY", "JOIN", "JOKE", "JUDGE", "JUICE",
  "JUMP", "JUNGLE", "KANGAROO", "KETCHUP", "KEY", "KICK", "KING", "KIWI", "KNIFE", "KNIGHT",
  "KNOCK", "KNOT", "LAB", "LADDER", "LADY", "LAKE", "LAMB", "LAMP", "LAND", "LAP",
  "LASER", "LAW", "LEAD", "LEAF", "LEAGUE", "LEAK", "LEAN", "LEAP", "LEG", "LETTER",
  "LEVEL", "LIBRARY", "LIE", "LIFE", "LIFT", "LIGHT", "LIMB", "LINE", "LINK", "LION",
  "LIP", "LIST", "LOCK", "LOG", "LONDON", "LOOK", "LOOP", "LORD", "LOSS", "LOVE",
  "MACHINE", "MAGIC", "MAID", "MAIL", "MALL", "MAN", "MAP", "MARBLE", "MARCH", "MARK",
  "MARKET", "MASK", "MASS", "MATCH", "MATE", "MATH", "MATTER", "MAY", "MAZE", "MEAL",
  "MEAN", "MEASURE", "MEAT", "MEDAL", "MEDIA", "MELON", "MEMORY", "MENU", "MERCURY", "MESS",
  "METAL", "METER", "METHOD", "MIDDLE", "MILK", "MIND", "MINE", "MINUTE", "MIRROR", "MISS",
  "MODEL", "MOLE", "MOON", "MORNING", "MOSQUITO", "MOTHER", "MOTION", "MOUNTAIN", "MOUSE", "MOUTH",
  "MOVE", "MOVIE", "MUFFIN", "MULE", "MUSIC", "NAIL", "NAME", "NAP", "NARROW", "NATION",
  "NATURE", "NECK", "NEED", "NEEDLE", "NEGATIVE", "NERVE", "NET", "NETWORK", "NEWS", "NIGHT",
  "NOISE", "NONE", "NOON", "NORTH", "NOSE", "NOTE", "NOTHING", "NOTICE", "NOVEL", "NUMBER",
  "NURSE", "NUT", "OBJECT", "OCEAN", "OCTOPUS", "OFFICE", "OIL", "OLIVE", "ONION", "OPEN",
  "OPERA", "ORANGE", "ORBIT", "ORDER", "ORGAN", "ORGANIC", "ORIGIN", "OTHER", "OUT", "OUTPUT",
  "OVAL", "OVEN", "OVER", "OWN", "OWNER", "PACE", "PACK", "PAGE", "PAIN", "PAINT",
  "PAIR", "PALACE", "PALE", "PALM", "PAN", "PANEL", "PANIC", "PANT", "PAPER", "PARADE",
  "PARENT", "PARK", "PART", "PARTY", "PASS", "PASTE", "PATCH", "PATH", "PATTERN", "PAUSE",
  "PAY", "PEACE", "PEAK", "PEAR", "PEN", "PENCIL", "PENNY", "PEOPLE", "PEPPER", "PERIOD",
  "PERMIT", "PERSON", "PHONE", "PHOTO", "PHYSICS", "PIANO", "PICK", "PICTURE", "PIE", "PIECE",
  "PIG", "PILE", "PILOT", "PIN", "PINE", "PINK", "PIPE", "PIRATE", "PISTOL", "PIT",
  "PITCH", "PIZZA", "PLACE", "PLAIN", "PLAN", "PLANE", "PLANET", "PLANT", "PLASTIC", "PLATE",
  "PLAY", "PLAYER", "PLOT", "PLUG", "PLUM", "PLUNGE", "POCKET", "POEM", "POET", "POINT",
  "POISON", "POLE", "POLICE", "POLICY", "POLISH", "POLITICS", "POOL", "POOR", "POP", "POPCORN",
  "PORT", "POSE", "POSITION", "POSITIVE", "POSSESS", "POST", "POT", "POTATO", "POTTERY", "POUND",
  "POUR", "POWDER", "POWER", "PRACTICE", "PRAISE", "PRAY", "PRESENT", "PRESS", "PRETTY", "PRICE",
  "PRIDE", "PRIMARY", "PRIME", "PRINCE", "PRINT", "PRIOR", "PRIZE", "PROBLEM", "PROCESS", "PRODUCE",
  "PRODUCT", "PROFIT", "PROGRAM", "PROJECT", "PROMISE", "PROMOTE", "PROOF", "PROPERTY", "PROPOSE", "PROTECT",
  "PROUD", "PROVE", "PROVIDE", "PUBLIC", "PUDDING", "PULL", "PUMP", "PUNCH", "PUPIL", "PURPLE",
  "PURPOSE", "PURSE", "PUSH", "PUT", "PUZZLE", "QUACK", "QUALITY", "QUANTITY", "QUARTER", "QUEEN",
  "QUESTION", "QUICK", "QUIET", "QUILT", "QUIT", "QUIZ", "QUOTE", "RABBIT", "RACE", "RACK",
  "RADAR", "RADIO", "RAIL", "RAIN", "RAINBOW", "RAISE", "RALLY", "RANGE", "RANK", "RAPID",
  "RARE", "RATE", "RATHER", "RATIO", "RAW", "RAY", "RAZOR", "REACH", "REACT", "READ",
  "REAL", "REALITY", "REALIZE", "REALLY", "REASON", "REBEL", "RECALL", "RECEIVE", "RECENT", "RECIPE",
  "RECORD", "RECOVER", "RECRUIT", "RED", "REDUCE", "REFER", "REFLECT", "REFORM", "REFUSE", "REGARD",
  "REGION", "REGULAR", "REJECT", "RELATE", "RELAX", "RELEASE", "RELEVANT", "RELIABLE", "RELIEF", "RELIGION",
  "RELY", "REMAIN", "REMEMBER", "REMIND", "REMOVE", "RENDER", "RENEW", "RENT", "REPAIR", "REPEAT",
  "REPLACE", "REPLY", "REPORT", "REPRESENT", "REPUBLIC", "REPUTATION", "REQUEST", "REQUIRE", "RESCUE", "RESEARCH",
  "RESERVE", "RESIDENT", "RESIGN", "RESIST", "RESOLVE", "RESORT", "RESOURCE", "RESPECT", "RESPOND", "REST",
  "RESTAURANT", "RESTORE", "RESTRICT", "RESULT", "RETAIN", "RETIRE", "RETURN", "REVEAL", "REVENGE", "REVENUE",
  "REVIEW", "REVOLUTION", "REWARD", "RHYME", "RICE", "RICH", "RIDE", "RIDGE", "RIFLE", "RIGHT",
  "RIGID", "RING", "RINSE", "RIOT", "RIP", "RIPE", "RISE", "RISK", "RIVAL", "RIVER",
  "ROAD", "ROAR", "ROAST", "ROB", "ROBOT", "ROCK", "ROCKET", "ROD", "ROLE", "ROLL",
  "ROMANCE", "ROOF", "ROOM", "ROOT", "ROPE", "ROSE", "ROT", "ROTATE", "ROUGH", "ROUND",
  "ROUTE", "ROW", "ROYAL", "RUB", "RUBBER", "RUBBISH", "RUBY", "RUDE", "RUIN", "RULE",
  "RUN", "RUSH", "RUST", "SACK", "SAD", "SAFE", "SAIL", "SAILOR", "SAKE", "SALAD",
  "SALARY", "SALE", "SALT", "SAME", "SAMPLE", "SAND", "SANDWICH", "SATISFY", "SAUCE", "SAUSAGE",
  "SAVE", "SAW", "SAY", "SCALE", "SCAN", "SCAR", "SCARCE", "SCARE", "SCARF", "SCATTER",
  "SCENE", "SCENT", "SCHEDULE", "SCHEME", "SCHOOL", "SCIENCE", "SCISSORS", "SCORE", "SCRAPE", "SCRATCH",
  "SCREAM", "SCREEN", "SCREW", "SCRIPT", "SCULPTURE", "SEA", "SEAL", "SEAM", "SEARCH", "SEASON",
  "SEAT", "SECOND", "SECRET", "SECTION", "SECTOR", "SECURE", "SEE", "SEED", "SEEK", "SEEM",
  "SEIZE", "SELECT", "SELL", "SEND", "SENIOR", "SENSE", "SENTENCE", "SERIES", "SERIOUS", "SERVE",
  "SERVICE", "SESSION", "SET", "SETTLE", "SETUP", "SEVEN", "SEVERAL", "SEVERE", "SEW", "SEX",
  "SHADE", "SHADOW", "SHAKE", "SHALL", "SHALLOW", "SHAME", "SHAPE", "SHARE", "SHARK", "SHARP",
  "SHE", "SHEEP", "SHEET", "SHELF", "SHELL", "SHELTER", "SHIELD", "SHIFT", "SHINE", "SHIP",
  "SHIRT", "SHOCK", "SHOE", "SHOOT", "SHOP", "SHORE", "SHORT", "SHOT", "SHOULD", "SHOULDER",
  "SHOUT", "SHOVE", "SHOW", "SHOWER", "SHRED", "SHRIEK", "SHRINK", "SHRUG", "SHUT", "SHY",
  "SICK", "SIDE", "SIDEWALK", "SIGHT", "SIGN", "SIGNAL", "SILENCE", "SILENT", "SILK", "SILLY",
  "SILVER", "SIMILAR", "SIMPLE", "SINCE", "SING", "SINGLE", "SINK", "SIP", "SIR", "SISTER",
  "SIT", "SITE", "SITUATION", "SIX", "SIZE", "SKATE", "SKELETON", "SKETCH", "SKI", "SKILL",
  "SKIN", "SKIP", "SKIRT", "SKULL", "SKY", "SLAB", "SLACK", "SLAVE", "SLEEP", "SLEEVE",
  "SLICE", "SLIDE", "SLIGHT", "SLIM", "SLIP", "SLIT", "SLOPE", "SLOT", "SLOW", "SLUG",
  "SLUM", "SLUMP", "SMALL", "SMART", "SMASH", "SMELL", "SMILE", "SMOKE", "SMOOTH", "SNAKE",
  "SNAP", "SNATCH", "SNEAK", "SNEEZE", "SNIFF", "SNOW", "SNUG", "SO", "SOAK", "SOAP",
  "SOAR", "SOCCER", "SOCIAL", "SOCIETY", "SOCK", "SODA", "SOFA", "SOFT", "SOIL", "SOLAR",
  "SOLD", "SOLDIER", "SOLE", "SOLID", "SOLO", "SOLUTION", "SOLVE", "SOME", "SON", "SONG",
  "SOON", "SORE", "SORRY", "SORT", "SOUL", "SOUND", "SOUP", "SOUR", "SOURCE", "SOUTH",
  "SPACE", "SPARE", "SPARK", "SPEAK", "SPEAR", "SPECIAL", "SPEECH", "SPEED", "SPELL", "SPEND",
  "SPHERE", "SPICE", "SPIDER", "SPIKE", "SPILL", "SPIN", "SPINE", "SPIRIT", "SPIT", "SPLIT",
  "SPOIL", "SPOKE", "SPONGE", "SPOON", "SPORT", "SPOT", "SPRAY", "SPREAD", "SPRING", "SPRING",
  "SPY", "SQUAD", "SQUARE", "SQUASH", "SQUAT", "SQUAWK", "SQUEEZE", "SQUID", "SQUINT", "SQUIRM",
  "SQUIRT", "STAB", "STABLE", "STACK", "STADIUM", "STAFF", "STAGE", "STAIR", "STAKE", "STALE",
  "STALK", "STALL", "STAMP", "STAND", "STAR", "STARE", "STARK", "START", "STATE", "STATEMENT",
  "STATION", "STATUE", "STATUS", "STAY", "STEADY", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP",
  "STEM", "STEP", "STERN", "STEW", "STICK", "STIFF", "STILL", "STING", "STINK", "STIR",
  "STOCK", "STOMACH", "STONE", "STOOP", "STOP", "STORE", "STORM", "STORY", "STOVE", "STRAGHT",
  "STRAND", "STRANGE", "STRAP", "STRAW", "STRAW", "STREAM", "STREET", "STRENGTH", "STRESS", "STRETCH",
  "STRICT", "STRIKE", "STRING", "STRIP", "STRIPE", "STRIVE", "STROKE", "STRONG", "STRUGGLE", "STUB",
  "STUCK", "STUDENT", "STUDIO", "STUDY", "STUFF", "STUMBLE", "STUMP", "STUN", "STUNT", "STUPID",
  "STURDY", "STYLE", "SUBJECT", "SUBMIT", "SUBSCRIBE", "SUBSTANCE", "SUBSTITUTE", "SUBTLE", "SUBTRACT", "SUBURB",
  "SUCCEED", "SUCCESS", "SUCH", "SUCK", "SUDDEN", "SUFFER", "SUGAR", "SUGGEST", "SUIT", "SULPHUR",
  "SUM", "SUMMER", "SUN", "SUNNY", "SUNRISE", "SUNSET", "SUPER", "SUPPLY", "SUPPORT", "SUPPOSE",
  "SUPREME", "SURE", "SURFACE", "SURGE", "SURGEON", "SURPLUS", "SURPRISE", "SURRENDER", "SURROUND", "SURVEY",
  "SURVIVE", "SUSPECT", "SUSPEND", "SUSTAIN", "SWALLOW", "SWAMP", "SWAN", "SWAP", "SWARM", "SWAY",
  "SWEAR", "SWEAT", "SWEEP", "SWEET", "SWELL", "SWERVE", "SWIFT", "SWIM", "SWING", "SWITCH",
  "SWORD", "SYMBOL", "SYMPTOM", "SYRUP", "SYSTEM", "TABLE", "TACK", "TACKLE", "TACTIC", "TAG",
  "TAIL", "TAKE", "TALE", "TALENT", "TALK", "TALL", "TAME", "TAN", "TANGLE", "TANK",
  "TAP", "TAPE", "TARGET", "TASK", "TASTE", "TASTY", "TATTOO", "TAX", "TAXI", "TEA",
  "TEACH", "TEAM", "TEAR", "TEASE", "TECHNOLOGY", "TEEN", "TELEPHONE", "TELL", "TEMPER", "TEMPLE",
  "TEMPO", "TEMPT", "TEN", "TENANT", "TEND", "TENDER", "TENNIS", "TENSE", "TENT", "TERM",
  "TERMINAL", "TERRIFY", "TERRITORY", "TERROR", "TEST", "TEXT", "THAN", "THANK", "THAT", "THE",
  "THEATER", "THEFT", "THEIR", "THEM", "THEME", "THEN", "THEORY", "THERE", "THEREFORE", "THESE",
  "THEY", "THICK", "THIEF", "THIGH", "THIN", "THING", "THINK", "THIRD", "THIS", "THOROUGH",
  "THOSE", "THOUGH", "THOUGHT", "THOUSAND", "THREAD", "THREAT", "THREE", "THREW", "THRIFT", "THRILL",
  "THRIVE", "THROAT", "THRONE", "THROUGH", "THROW", "THRUST", "THUMB", "THUMP", "THUNDER", "THUS",
  "TICK", "TICKET", "TIDE", "TIDY", "TIE", "TIGER", "TIGHT", "TILE", "TILL", "TILT",
  "TIMBER", "TIME", "TIMID", "TIN", "TINY", "TIP", "TIPSY", "TIRE", "TIRED", "TISSUE",
  "TITLE", "TO", "TOAD", "TOAST", "TOBACCO", "TODAY", "TOE", "TOGETHER", "TOILET", "TOKEN",
  "TOKYO", "TOLD", "TOLL", "TOMATO", "TOMB", "TOMORROW", "TONE", "TONGUE", "TONIGHT", "TONNE",
  "TOOL", "TOOTH", "TOP", "TOPIC", "TOPPLE", "TORCH", "TORNADO", "TORTOISE", "TOSS", "TOTAL",
  "TOUCH", "TOUGH", "TOUR", "TOURISM", "TOURIST", "TOURNAMENT", "TOW", "TOWARD", "TOWEL", "TOWER",
  "TOWN", "TOY", "TRACE", "TRACK", "TRACT", "TRACTOR", "TRADE", "TRADITION", "TRAFFIC", "TRAGEDY",
  "TRAIL", "TRAIN", "TRAIT", "TRAMP", "TRANCE", "TRANSACTION", "TRANSFER", "TRANSFORM", "TRANSIT", "TRANSLATE",
  "TRANSMIT", "TRANSPORT", "TRAP", "TRASH", "TRAVEL", "TRAY", "TREAD", "TREASON", "TREASURE", "TREAT",
  "TREATMENT", "TREATY", "TREE", "TREK", "TREMENDOUS", "TRIAL", "TRIBE", "TRICK", "TRIGGER", "TRIM",
  "TRIP", "TRIUMPH", "TROLLEY", "TROOP", "TROPHY", "TROPICAL", "TROUBLE", "TRUCK", "TRUE", "TRULY",
  "TRUMPET", "TRUNK", "TRUST", "TRUTH", "TRY", "TUB", "TUBE", "TUESDAY", "TUG", "TUITION",
  "TULIP", "TUMBLE", "TUNE", "TUNNEL", "TURBINE", "TURF", "TURKEY", "TURN", "TURNIP", "TURTLE",
  "TUTOR", "TV", "TWELVE", "TWENTY", "TWICE", "TWIG", "TWILIGHT", "TWIN", "TWIST", "TWITCH",
  "TWO", "TYPE", "TYPICAL", "UGLY", "UMBRELLA", "UNABLE", "UNAWARE", "UNBALANCE", "UNCLE", "UNCOVER",
  "UNDER", "UNDERGO", "UNDERSTAND", "UNDERTAKE", "UNDO", "UNDRESS", "UNEMPLOYMENT", "UNEXPECTED", "UNFAIR", "UNFOLD",
  "UNFORTUNATELY", "UNHAPPY", "UNIFORM", "UNION", "UNIQUE", "UNIT", "UNITE", "UNITY", "UNIVERSAL", "UNIVERSE",
  "UNIVERSITY", "UNKNOWN", "UNLESS", "UNLIKE", "UNLIKELY", "UNLOAD", "UNLOCK", "UNLUCKY", "UNNECESSARY", "UNPLEASANT",
  "UNREST", "UNSAFE", "UNTIL", "UNUSUAL", "UNVEIL", "UNWILLING", "UP", "UPDATE", "UPGRADE", "UPHOLD",
  "UPON", "UPPER", "UPRIGHT", "UPSET", "UPSTAIRS", "UPWARD", "URBAN", "URGE", "URGENT", "US",
  "USAGE", "USE", "USED", "USEFUL", "USER", "USUAL", "USUALLY", "UTILITY", "UTTER", "VACANT",
  "VACATION", "VACUUM", "VAGUE", "VAIN", "VALID", "VALLEY", "VALUABLE", "VALUE", "VAN", "VANISH",
  "VARIABLE", "VARIATION", "VARIETY", "VARIOUS", "VAST", "VAT", "VAULT", "VEGETABLE", "VEHICLE", "VEIL",
  "VEIN", "VELOCITY", "VELVET", "VENDOR", "VENTURE", "VERB", "VERBAL", "VERDICT", "VERIFY", "VERSION",
  "VERSUS", "VERTICAL", "VERY", "VESSEL", "VEST", "VETERAN", "VIA", "VIBRATE", "VICE", "VICTIM",
  "VICTOR", "VICTORY", "VIDEO", "VIEW", "VIEWER", "VILLAGE", "VILLAIN", "VIOLATE", "VIOLENCE", "VIOLENT",
  "VIOLET", "VIOLIN", "VIRGIN", "VIRTUAL", "VIRTUE", "VIRUS", "VISIBLE", "VISION", "VISIT", "VISITOR",
  "VISUAL", "VITAL", "VITAMIN", "VIVID", "VOCABULARY", "VOCAL", "VOCATION", "VOICE", "VOID", "VOLCANO",
  "VOLTAGE", "VOLUME", "VOLUNTARY", "VOLUNTEER", "VOTE", "VOTER", "VOW", "VOYAGE", "VULNERABLE", "WAGE",
  "WAGON", "WAIST", "WAIT", "WAITER", "WAKE", "WALK", "WALL", "WALLET", "WALNUT", "WANDER",
  "WANT", "WAR", "WARD", "WARDROBE", "WAREHOUSE", "WARFARE", "WARM", "WARN", "WARRANT", "WARRANTY",
  "WARRIOR", "WARTIME", "WASH", "WASTE", "WATCH", "WATER", "WATERFALL", "WATERPROOF", "WAVE", "WAX",
  "WAY", "WE", "WEAK", "WEALTH", "WEALTHY", "WEAPON", "WEAR", "WEARY", "WEATHER", "WEAVE",
  "WEB", "WEDDING", "WEDGE", "WEDNESDAY", "WEED", "WEEK", "WEEKDAY", "WEEKEND", "WEEKLY", "WEEP",
  "WEIGH", "WEIGHT", "WEIRD", "WELCOME", "WELFARE", "WELL", "WEST", "WESTERN", "WET", "WHALE",
  "WHAT", "WHATEVER", "WHEAT", "WHEEL", "WHEN", "WHENEVER", "WHERE", "WHEREAS", "WHEREVER", "WHETHER",
  "WHICH", "WHILE", "WHIP", "WHIRL", "WHISK", "WHISPER", "WHISTLE", "WHITE", "WHO", "WHOEVER",
  "WHOLE", "WHOM", "WHOSE", "WHY", "WICKED", "WIDE", "WIDEN", "WIDOW", "WIDTH", "WIFE",
  "WILD", "WILL", "WILLING", "WILLOW", "WIN", "WIND", "WINDOW", "WINE", "WING", "WINK",
  "WINNER", "WINTER", "WIPE", "WIRE", "WISDOM", "WISE", "WISH", "WIT", "WITCH", "WITH",
  "WITHIN", "WITHOUT", "WITNESS", "WIZARD", "WOLF", "WOMAN", "WOMB", "WONDER", "WONDERFUL", "WOOD",
  "WOODEN", "WOOL", "WOOLEN", "WORD", "WORK", "WORKER", "WORKFORCE", "WORKPLACE", "WORKSHOP", "WORLD",
  "WORLDWIDE", "WORM", "WORRY", "WORSE", "WORSHIP", "WORST", "WORTH", "WORTHY", "WOULD", "WOUND",
  "WRAP", "WRATH", "WREAK", "WRECK", "WRENCH", "WRESTLE", "WRETCHED", "WRIGGLE", "WRING", "WRINKLE",
  "WRIST", "WRITE", "WRITER", "WRITING", "WRONG", "WROTE", "WRUNG", "WRY", "YARD", "YARN",
  "YAWN", "YEAR", "YELLOW", "YES", "YESTERDAY", "YET", "YIELD", "YOGA", "YOGURT", "YOU",
  "YOUNG", "YOUR", "YOURS", "YOURSELF", "YOUTH", "ZAP", "ZEAL", "ZEBRA", "ZERO", "ZEST",
  "ZIGZAG", "ZINC", "ZIP", "ZIPPER", "ZONE", "ZOO", "ZOOM"
];

type CardType = "red" | "blue" | "neutral" | "assassin";
type GamePhase = "setup" | "playing" | "gameOver";
type PlayerRole = "spymaster" | "operative";

interface Card {
  word: string;
  type: CardType;
  revealed: boolean;
}

interface Team {
  id: "red" | "blue";
  name: string;
  color: {
    name: string;
    bg: string;
    border: string;
    text: string;
    glow: string;
    light: string;
  };
  cardsRemaining: number;
}

export default function CodenamesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [redTeamName, setRedTeamName] = useState("RED TEAM");
  const [blueTeamName, setBlueTeamName] = useState("BLUE TEAM");
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue" | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentTeam, setCurrentTeam] = useState<"red" | "blue">("red");
  const [clue, setClue] = useState({ word: "", number: 0 });
  const [guessesRemaining, setGuessesRemaining] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string>("");

  const redTeam: Team = {
    id: "red",
    name: redTeamName,
    color: {
      name: "Red",
      bg: "bg-red-500",
      border: "border-red-500",
      text: "text-red-400",
      glow: "neon-glow-pink",
      light: "bg-red-900/30",
    },
    cardsRemaining: cards.filter(c => c.type === "red" && !c.revealed).length,
  };

  const blueTeam: Team = {
    id: "blue",
    name: blueTeamName,
    color: {
      name: "Blue",
      bg: "bg-blue-500",
      border: "border-blue-500",
      text: "text-blue-400",
      glow: "neon-glow-cyan",
      light: "bg-blue-900/30",
    },
    cardsRemaining: cards.filter(c => c.type === "blue" && !c.revealed).length,
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [router]);

  const generateBoard = () => {
    const shuffled = [...CODEWORDS].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 25);
    
    // Create card types: 9 red, 8 blue, 7 neutral, 1 assassin
    // First team gets 9 cards (red starts)
    const types: CardType[] = [
      ...Array(9).fill("red" as CardType),
      ...Array(8).fill("blue" as CardType),
      ...Array(7).fill("neutral" as CardType),
      "assassin" as CardType,
    ];
    
    // Shuffle types
    const shuffledTypes = [...types].sort(() => Math.random() - 0.5);
    
    const newCards: Card[] = selectedWords.map((word, idx) => ({
      word,
      type: shuffledTypes[idx],
      revealed: false,
    }));
    
    setCards(newCards);
  };

  const startGame = () => {
    generateBoard();
    setPhase("playing");
    setCurrentTeam("red");
    setClue({ word: "", number: 0 });
    setGuessesRemaining(0);
  };

  const revealCard = (index: number) => {
    if (role !== "operative" || guessesRemaining === 0 || cards[index].revealed) return;
    
    const newCards = [...cards];
    newCards[index].revealed = true;
    setCards(newCards);
    setGuessesRemaining(prev => prev - 1);
    
    const card = newCards[index];
    
    // Check for game over conditions
    if (card.type === "assassin") {
      // Current team loses
      setGameOverReason(`${currentTeam === "red" ? redTeamName : blueTeamName} hit the assassin! ${currentTeam === "red" ? blueTeamName : redTeamName} wins!`);
      setPhase("gameOver");
      return;
    }
    
    if (card.type !== currentTeam) {
      // Wrong team's card or neutral - switch teams
      setCurrentTeam(currentTeam === "red" ? "blue" : "red");
      setClue({ word: "", number: 0 });
      setGuessesRemaining(0);
      return;
    }
    
    // Check if team won
    const teamCards = newCards.filter(c => c.type === currentTeam);
    const allRevealed = teamCards.every(c => c.revealed);
    if (allRevealed) {
      setGameOverReason(`${currentTeam === "red" ? redTeamName : blueTeamName} found all their words!`);
      setPhase("gameOver");
    }
  };

  const giveClue = () => {
    if (!clue.word.trim() || clue.number < 1 || clue.number > 9) return;
    setGuessesRemaining(clue.number + 1); // +1 for the bonus guess
  };

  const passTurn = () => {
    setCurrentTeam(currentTeam === "red" ? "blue" : "red");
    setClue({ word: "", number: 0 });
    setGuessesRemaining(0);
  };

  const resetGame = () => {
    setPhase("setup");
    setRole(null);
    setSelectedTeam(null);
    setCards([]);
    setCurrentTeam("red");
    setClue({ word: "", number: 0 });
    setGuessesRemaining(0);
    setGameOverReason("");
  };

  if (!currentUser) return null;

  const activeTeam = currentTeam === "red" ? redTeam : blueTeam;

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO GAMES
          </Link>

          <div className="text-center mb-8">
            <h1 className="pixel-font text-3xl md:text-5xl font-bold text-pink-400 neon-glow-pink mb-4 float">
              🔍 CODENAMES
            </h1>
            <p className="text-cyan-300">
              Two teams compete to find all their words first!
            </p>
          </div>

          <div className="neon-card neon-box-pink p-8 mb-6 card-3d">
            <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-6 text-center">
              🎯 SETUP YOUR TEAMS
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-red-900/30 rounded-xl p-4 border-2 border-red-500 neon-box-pink">
                <label className="block text-red-400 font-semibold mb-2">RED TEAM NAME</label>
                <input
                  type="text"
                  value={redTeamName}
                  onChange={(e) => setRedTeamName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-red-400"
                  maxLength={20}
                />
              </div>

              <div className="bg-blue-900/30 rounded-xl p-4 border-2 border-blue-500 neon-box-cyan">
                <label className="block text-blue-400 font-semibold mb-2">BLUE TEAM NAME</label>
                <input
                  type="text"
                  value={blueTeamName}
                  onChange={(e) => setBlueTeamName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-blue-400"
                  maxLength={20}
                />
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full mt-8 py-5 rounded-xl text-xl font-bold transition-all flex items-center justify-center gap-3 neon-btn neon-btn-green btn-3d"
            >
              START GAME!
            </button>

            <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
              <h3 className="font-bold text-blue-400 mb-3">📖 HOW TO PLAY</h3>
              <ul className="text-blue-300/80 space-y-2 text-sm">
                <li>• Two teams compete: <span className="text-red-400">RED</span> (9 words) and <span className="text-blue-400">BLUE</span> (8 words)</li>
                <li>• Each team has a <span className="text-pink-400">SPYMASTER</span> who sees all card colors</li>
                <li>• <span className="text-cyan-400">OPERATIVES</span> only see the words on the board</li>
                <li>• Spymaster gives clues: <span className="text-yellow-400">ONE WORD + NUMBER</span> (e.g., "Animal 2")</li>
                <li>• Operatives guess words - correct guesses reveal the color</li>
                <li>• <span className="text-red-400 font-bold">⚠️ Avoid the ASSASSIN!</span> If found, your team loses!</li>
                <li>• First team to find all their words wins!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Role Selection
  if (phase === "playing" && !role) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Scoreboard */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className={`${redTeam.color.light} rounded-xl p-4 border-2 ${redTeam.color.border} ${currentTeam === "red" ? redTeam.color.glow : "opacity-70"} transition-all`}>
              <div className={`${redTeam.color.text} font-bold text-sm mb-1`}>{redTeam.name}</div>
              <div className={`${redTeam.color.text} text-3xl font-bold pixel-font`}>{redTeam.cardsRemaining}</div>
              <div className="text-xs text-gray-400">CARDS LEFT</div>
            </div>
            <div className={`${blueTeam.color.light} rounded-xl p-4 border-2 ${blueTeam.color.border} ${currentTeam === "blue" ? blueTeam.color.glow : "opacity-70"} transition-all`}>
              <div className={`${blueTeam.color.text} font-bold text-sm mb-1`}>{blueTeam.name}</div>
              <div className={`${blueTeam.color.text} text-3xl font-bold pixel-font`}>{blueTeam.cardsRemaining}</div>
              <div className="text-xs text-gray-400">CARDS LEFT</div>
            </div>
          </div>

          {/* Current Team Banner */}
          <div className={`${activeTeam.color.light} rounded-2xl p-8 border-2 ${activeTeam.color.border} ${activeTeam.color.glow} text-center mb-8`}>
            <div className="text-sm text-gray-400 mb-2">{activeTeam.name}'S TURN</div>
            <h2 className={`pixel-font text-3xl md:text-4xl font-bold ${activeTeam.color.text} mb-2`}>
              CHOOSE YOUR ROLE
            </h2>
          </div>

          {/* Team Selection */}
          <div className="neon-card neon-box-cyan p-8 mb-6 card-3d">
            <h3 className="text-xl font-bold text-center text-cyan-400 mb-4">CHOOSE YOUR TEAM</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedTeam("red")}
                className={`${redTeam.color.light} border-2 ${redTeam.color.border} ${selectedTeam === "red" ? redTeam.color.glow : ""} p-4 rounded-xl transition-all hover:scale-105`}
              >
                <div className={`${redTeam.color.text} font-bold text-lg`}>{redTeam.name}</div>
              </button>
              <button
                onClick={() => setSelectedTeam("blue")}
                className={`${blueTeam.color.light} border-2 ${blueTeam.color.border} ${selectedTeam === "blue" ? blueTeam.color.glow : ""} p-4 rounded-xl transition-all hover:scale-105`}
              >
                <div className={`${blueTeam.color.text} font-bold text-lg`}>{blueTeam.name}</div>
              </button>
            </div>
          </div>

          {/* Role Selection */}
          {selectedTeam && (
            <div className="neon-card neon-box-cyan p-8 card-3d">
              <h3 className="text-xl font-bold text-center text-cyan-400 mb-6">WHAT'S YOUR ROLE?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => { setRole("spymaster"); }}
                  className={`${selectedTeam === "red" ? redTeam.color.light : blueTeam.color.light} border-2 ${selectedTeam === "red" ? redTeam.color.border : blueTeam.color.border} ${selectedTeam === "red" ? redTeam.color.glow : blueTeam.color.glow} p-8 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-4`}
                >
                  <div className={`w-20 h-20 ${selectedTeam === "red" ? redTeam.color.bg : blueTeam.color.bg} rounded-full flex items-center justify-center`}>
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  <span className={`text-2xl font-bold ${selectedTeam === "red" ? redTeam.color.text : blueTeam.color.text} pixel-font text-sm`}>SPYMASTER</span>
                  <span className="text-gray-400 text-sm text-center">
                    See all card colors and give clues
                  </span>
                </button>

                <button
                  onClick={() => { setRole("operative"); }}
                  className="bg-gray-800/50 border-2 border-gray-600 hover:border-cyan-500 hover:neon-box-cyan p-8 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <span className="text-2xl font-bold text-gray-300 pixel-font text-sm">OPERATIVE</span>
                  <span className="text-gray-500 text-sm text-center">
                    See words and make guesses
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Spymaster View
  if (phase === "playing" && role === "spymaster" && selectedTeam) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          {(() => {
            const playerTeam = selectedTeam === "red" ? redTeam : blueTeam;
            const opponentTeam = selectedTeam === "red" ? blueTeam : redTeam;
            return (
              <div className={`${playerTeam.color.light} rounded-2xl p-4 mb-6 border-2 ${playerTeam.color.border} ${playerTeam.color.glow}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-gray-400">SPYMASTER</div>
                    <div className={`font-bold ${playerTeam.color.text} text-xl`}>{playerTeam.name}</div>
                    {selectedTeam !== currentTeam && (
                      <div className="text-xs text-yellow-400 mt-1">⏳ Not your turn</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">YOUR CARDS LEFT</div>
                    <div className={`text-4xl font-bold pixel-font ${playerTeam.color.text}`}>{playerTeam.cardsRemaining}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">OPPONENT CARDS LEFT</div>
                    <div className={`text-4xl font-bold pixel-font ${opponentTeam.color.text}`}>
                      {opponentTeam.cardsRemaining}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Clue Input */}
          {guessesRemaining === 0 && selectedTeam === currentTeam && (
            <div className="neon-card neon-box-pink p-6 mb-6 card-3d">
              <h3 className="text-xl font-bold text-center text-pink-400 mb-4">GIVE YOUR CLUE</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-cyan-400 font-semibold mb-2">CLUE WORD</label>
                  <input
                    type="text"
                    value={clue.word}
                    onChange={(e) => setClue({ ...clue, word: e.target.value.toUpperCase() })}
                    placeholder="Enter your clue word..."
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-pink-400 text-center text-xl"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 font-semibold mb-2">NUMBER (1-9)</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => setClue({ ...clue, number: num })}
                        className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                          clue.number === num
                            ? "bg-pink-500 text-black neon-box-pink"
                            : "bg-black/50 text-gray-400 border-2 border-gray-600 hover:border-pink-500"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={giveClue}
                  disabled={!clue.word.trim() || clue.number === 0}
                  className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${
                    clue.word.trim() && clue.number > 0
                      ? "neon-btn neon-btn-green"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
                  }`}
                >
                  GIVE CLUE: "{clue.word}" {clue.number}
                </button>
              </div>
            </div>
          )}

          {guessesRemaining > 0 && selectedTeam === currentTeam && (
            <div className="neon-card neon-box-green p-6 mb-6 text-center card-3d">
              <div className="text-2xl font-bold text-green-400 mb-2">
                CLUE: <span className="text-white">{clue.word}</span> <span className="text-yellow-400">{clue.number}</span>
              </div>
              <div className="text-gray-400">Your operatives are guessing... ({guessesRemaining} guesses remaining)</div>
            </div>
          )}

          {selectedTeam !== currentTeam && (
            <div className="neon-card neon-box-cyan p-6 mb-6 text-center card-3d">
              <div className="text-xl text-cyan-400">
                ⏳ Waiting for {currentTeam === "red" ? blueTeamName : redTeamName}'s turn...
              </div>
            </div>
          )}

          {/* Board - Spymaster sees colors */}
          <div className="neon-card neon-box-cyan p-3 md:p-6 card-3d">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {cards.map((card, idx) => {
                const isRevealed = card.revealed;
                const getCardColor = () => {
                  if (isRevealed) {
                    if (card.type === "red") return "bg-red-600 text-white";
                    if (card.type === "blue") return "bg-blue-600 text-white";
                    if (card.type === "assassin") return "bg-black text-white border-4 border-red-500";
                    return "bg-yellow-600 text-black";
                  }
                  if (card.type === "red") return "bg-red-900/50 text-red-300 border-2 border-red-500";
                  if (card.type === "blue") return "bg-blue-900/50 text-blue-300 border-2 border-blue-500";
                  if (card.type === "assassin") return "bg-gray-900 text-gray-500 border-2 border-gray-700";
                  return "bg-yellow-900/30 text-yellow-300 border-2 border-yellow-600";
                };
                
                return (
                  <div
                    key={idx}
                    className={`p-2 md:p-4 rounded-lg font-bold text-[10px] md:text-xs lg:text-sm text-center transition-all ${getCardColor()}`}
                  >
                    {card.word}
                    {card.type === "assassin" && !isRevealed && (
                      <div className="text-[8px] mt-1">💀</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-black/30 rounded-xl border-2 border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-900/50 border border-red-500"></div>
                <span className="text-red-400">Your Team</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-900/50 border border-blue-500"></div>
                <span className="text-blue-400">Opponent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-900/30 border border-yellow-600"></div>
                <span className="text-yellow-400">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-900 border border-gray-700"></div>
                <span className="text-gray-400">Assassin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Operative View
  if (phase === "playing" && role === "operative" && selectedTeam) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          {(() => {
            const playerTeam = selectedTeam === "red" ? redTeam : blueTeam;
            return (
              <div className={`${playerTeam.color.light} rounded-2xl p-4 mb-6 border-2 ${playerTeam.color.border} ${playerTeam.color.glow}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-gray-400">OPERATIVE</div>
                    <div className={`font-bold ${playerTeam.color.text} text-xl`}>{playerTeam.name}</div>
                    {selectedTeam !== currentTeam && (
                      <div className="text-xs text-yellow-400 mt-1">⏳ Not your turn</div>
                    )}
                  </div>
                  {selectedTeam === currentTeam && guessesRemaining > 0 && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400">GUESSES LEFT</div>
                      <div className={`text-4xl font-bold pixel-font ${playerTeam.color.text}`}>{guessesRemaining}</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-xs text-gray-400">YOUR CARDS LEFT</div>
                    <div className={`text-4xl font-bold pixel-font ${playerTeam.color.text}`}>{playerTeam.cardsRemaining}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Current Clue */}
          {selectedTeam === currentTeam && guessesRemaining > 0 ? (
            <div className="neon-card neon-box-green p-6 mb-6 text-center card-3d">
              <div className="text-sm text-gray-400 mb-2">YOUR SPYMASTER'S CLUE:</div>
              <div className="text-4xl font-bold text-green-400 mb-2 pixel-font">
                {clue.word} <span className="text-yellow-400">{clue.number}</span>
              </div>
              <div className="text-gray-400">Click on words that match the clue!</div>
            </div>
          ) : selectedTeam === currentTeam ? (
            <div className="neon-card neon-box-cyan p-6 mb-6 text-center card-3d">
              <div className="text-xl text-cyan-400">
                ⏳ Waiting for your spymaster to give a clue...
              </div>
            </div>
          ) : (
            <div className="neon-card neon-box-cyan p-6 mb-6 text-center card-3d">
              <div className="text-xl text-cyan-400">
                ⏳ Waiting for {currentTeam === "red" ? blueTeamName : redTeamName}'s turn...
              </div>
            </div>
          )}

          {/* Board - Operatives only see words */}
          <div className="neon-card neon-box-cyan p-3 md:p-6 card-3d">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {cards.map((card, idx) => {
                const isRevealed = card.revealed;
                const canClick = selectedTeam === currentTeam && guessesRemaining > 0 && !isRevealed;
                
                const getCardStyle = () => {
                  if (isRevealed) {
                    if (card.type === "red") return "bg-red-600 text-white cursor-default";
                    if (card.type === "blue") return "bg-blue-600 text-white cursor-default";
                    if (card.type === "assassin") return "bg-black text-white border-4 border-red-500 cursor-default";
                    return "bg-yellow-600 text-black cursor-default";
                  }
                  if (canClick) {
                    return "bg-gray-800/50 text-gray-300 border-2 border-gray-600 hover:border-cyan-400 hover:text-cyan-400 cursor-pointer";
                  }
                  return "bg-gray-800/30 text-gray-500 border-2 border-gray-700 cursor-not-allowed";
                };
                
                return (
                  <button
                    key={idx}
                    onClick={() => revealCard(idx)}
                    disabled={!canClick}
                    className={`p-2 md:p-4 rounded-lg font-bold text-[10px] md:text-xs lg:text-sm text-center transition-all ${getCardStyle()}`}
                  >
                    {card.word}
                    {isRevealed && card.type === "assassin" && (
                      <div className="text-xs mt-1">💀</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTeam === currentTeam && guessesRemaining > 0 && (
            <button
              onClick={passTurn}
              className="w-full mt-6 py-4 bg-yellow-900/50 border-2 border-yellow-500 text-yellow-400 rounded-xl font-bold hover:neon-box-yellow transition-all"
            >
              PASS TURN
            </button>
          )}
        </div>
      </div>
    );
  }


  // GAME OVER PHASE
  if (phase === "gameOver") {
    const winner = redTeam.cardsRemaining === 0 ? redTeam : blueTeam;
    const loser = redTeam.cardsRemaining === 0 ? blueTeam : redTeam;

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Winner Banner */}
          <div className={`${winner.color.light} rounded-2xl p-8 border-2 ${winner.color.border} ${winner.color.glow} text-center mb-8`}>
            <div className="text-6xl mb-4 float">🏆</div>
            <div className="text-sm text-gray-400 mb-2">THE WINNER IS...</div>
            <h1 className={`pixel-font text-3xl md:text-5xl font-bold ${winner.color.text} mb-4`}>
              {winner.name}
            </h1>
            <div className="text-gray-400 mb-4">{gameOverReason}</div>
          </div>

          {/* Final Scores */}
          <div className="neon-card neon-box-cyan p-8 mb-8 card-3d">
            <h2 className="text-xl font-bold text-cyan-400 mb-6 text-center pixel-font">FINAL SCORES</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${redTeam.color.light} rounded-xl p-4 border-2 ${redTeam.color.border} ${winner.id === "red" ? redTeam.color.glow : ""}`}>
                <div className={`${redTeam.color.text} font-bold text-lg mb-2`}>{redTeam.name}</div>
                <div className={`${redTeam.color.text} text-3xl font-bold pixel-font`}>
                  {redTeam.cardsRemaining === 0 ? "WINNER!" : `${redTeam.cardsRemaining} LEFT`}
                </div>
              </div>
              <div className={`${blueTeam.color.light} rounded-xl p-4 border-2 ${blueTeam.color.border} ${winner.id === "blue" ? blueTeam.color.glow : ""}`}>
                <div className={`${blueTeam.color.text} font-bold text-lg mb-2`}>{blueTeam.name}</div>
                <div className={`${blueTeam.color.text} text-3xl font-bold pixel-font`}>
                  {blueTeam.cardsRemaining === 0 ? "WINNER!" : `${blueTeam.cardsRemaining} LEFT`}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="flex-1 neon-btn neon-btn-green py-5 text-xl flex items-center justify-center gap-2 btn-3d"
            >
              <RotateCcw className="w-6 h-6" />
              PLAY AGAIN
            </button>
            <Link
              href="/games"
              className="flex-1 neon-btn neon-btn-pink py-5 text-xl flex items-center justify-center gap-2 btn-3d"
            >
              <ArrowLeft className="w-6 h-6" />
              BACK TO GAMES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

