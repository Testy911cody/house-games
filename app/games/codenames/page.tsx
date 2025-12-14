"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, RotateCcw, Crown, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

// Difficulty-based word lists
const CODEWORDS_EASY = [
  "APPLE", "BALL", "BEAR", "BED", "BEE", "BIRD", "BOOK", "BOX", "CAKE", "CAR",
  "CAT", "CLOCK", "CLOUD", "COIN", "CROWN", "DOG", "DOOR", "DRUM", "DUCK", "EGG",
  "EYE", "FIRE", "FISH", "FLAG", "FOOT", "FORK", "GAME", "GOLD", "HAND", "HAT",
  "HEART", "HORSE", "HOUSE", "ICE", "KEY", "KING", "KNIFE", "LAMP", "LEAF", "LION",
  "MOON", "MOUSE", "MUSIC", "NOSE", "OCEAN", "PEN", "PIG", "PIZZA", "PLANE", "RING",
  "ROAD", "ROSE", "SHIP", "SHOE", "SNOW", "STAR", "SUN", "TABLE", "TREE", "WATER"
];

const CODEWORDS_MEDIUM = [
  "ARROW", "BANK", "BLOCK", "BOARD", "BOLT", "BOMB", "BOW", "BRIDGE", "BRUSH", "BUCKET",
  "BUG", "BULL", "CAMEL", "CAP", "CARD", "CARROT", "CASTLE", "CHAIN", "CHEST", "CHICK",
  "CHINA", "CHURCH", "CIRCLE", "CLIFF", "CLOAK", "CLOWN", "COACH", "COAST", "COMIC", "COMPOUND",
  "CONCERT", "CONDUCTOR", "CONTRACT", "COOK", "COPPER", "COTTON", "COURT", "COVER", "CRANE", "CRASH",
  "CRICKET", "CROSS", "CYCLE", "DANCE", "DATE", "DAY", "DEATH", "DECK", "DEGREE", "DESIGN",
  "DESK", "DIAMOND", "DICE", "DINOSAUR", "DISEASE", "DOCTOR", "DOLL", "DRAFT", "DRAGON", "DRESS",
  "DRILL", "DRINK", "DRIVE", "DROWN", "DUMB", "DUTY", "EARTH", "EAST", "EAT", "EDGE",
  "ELBOW", "ELEPHANT", "EMPIRE", "ENGINE", "ENGLAND", "EUROPE", "FACE", "FAIR", "FALL", "FAN",
  "FENCE", "FIELD", "FIGHTER", "FIGURE", "FILE", "FILM", "FLUTE", "FLY", "FORCE", "FOREST",
  "FRAME", "FRANCE", "FREEDOM", "FROG", "FUEL", "GAS", "GENIUS", "GERMANY", "GHOST", "GIANT",
  "GLASS", "GLOVE", "GRACE", "GRASS", "GREEK", "GREEN", "GROUND", "HAM", "HAPPY", "HARP",
  "HEAD", "HELICOPTER", "HIMALAYAS", "HOLE", "HOLLYWOOD", "HONEY", "HOOD", "HOOK", "HORN", "HOSE",
  "HOTEL", "HOUR", "ICELAND", "INK", "IRON", "ISLAND", "IVORY", "JACK", "JAM", "JET",
  "JOB", "JOCKEY", "JOIN", "JOKE", "JUDGE", "JUICE", "JUMP", "JUNGLE", "KANGAROO", "KETCHUP",
  "KICK", "KIWI", "KNIGHT", "KNOCK", "KNOT", "LAB", "LADDER", "LADY", "LAKE", "LAMB",
  "LAND", "LAP", "LASER", "LAW", "LEAD", "LEAGUE", "LEAK", "LEAN", "LEAP", "LEG",
  "LETTER", "LEVEL", "LIBRARY", "LIE", "LIFE", "LIFT", "LIGHT", "LIMB", "LINE", "LINK",
  "LIP", "LIST", "LOCK", "LOG", "LONDON", "LOOK", "LOOP", "LORD", "LOSS", "LOVE"
];

const CODEWORDS_HARD = [
  "MACHINE", "MAGIC", "MAID", "MAIL", "MALL", "MAN", "MAP", "MARBLE", "MARCH", "MARK",
  "MARKET", "MASK", "MASS", "MATCH", "MATE", "MATH", "MATTER", "MAY", "MAZE", "MEAL",
  "MEAN", "MEASURE", "MEAT", "MEDAL", "MEDIA", "MELON", "MEMORY", "MENU", "MERCURY", "MESS",
  "METAL", "METER", "METHOD", "MIDDLE", "MILK", "MIND", "MINE", "MINUTE", "MIRROR", "MISS",
  "MODEL", "MOLE", "MORNING", "MOSQUITO", "MOTHER", "MOTION", "MOUNTAIN", "MOUTH", "MOVE", "MOVIE",
  "MUFFIN", "MULE", "NAIL", "NAME", "NAP", "NARROW", "NATION", "NATURE", "NECK", "NEED",
  "NEEDLE", "NEGATIVE", "NERVE", "NET", "NETWORK", "NEWS", "NIGHT", "NOISE", "NONE", "NOON",
  "NORTH", "NOTE", "NOTHING", "NOTICE", "NOVEL", "NUMBER", "NURSE", "NUT", "OBJECT", "OCTOPUS",
  "OFFICE", "OIL", "OLIVE", "ONION", "OPEN", "OPERA", "ORANGE", "ORBIT", "ORDER", "ORGAN",
  "ORGANIC", "ORIGIN", "OTHER", "OUT", "OUTPUT", "OVAL", "OVEN", "OVER", "OWN", "OWNER",
  "PACE", "PACK", "PAGE", "PAIN", "PAINT", "PAIR", "PALACE", "PALE", "PALM", "PAN",
  "PANEL", "PANIC", "PANT", "PAPER", "PARADE", "PARENT", "PARK", "PART", "PARTY", "PASS",
  "PASTE", "PATCH", "PATH", "PATTERN", "PAUSE", "PAY", "PEACE", "PEAK", "PEAR", "PENCIL",
  "PENNY", "PEOPLE", "PEPPER", "PERIOD", "PERMIT", "PERSON", "PHONE", "PHOTO", "PHYSICS", "PIANO",
  "PICK", "PICTURE", "PIE", "PIECE", "PILE", "PILOT", "PIN", "PINE", "PINK", "PIPE",
  "PIRATE", "PISTOL", "PIT", "PITCH", "PLACE", "PLAIN", "PLAN", "PLANET", "PLANT", "PLASTIC",
  "PLATE", "PLAY", "PLAYER", "PLOT", "PLUG", "PLUM", "PLUNGE", "POCKET", "POEM", "POET",
  "POINT", "POISON", "POLE", "POLICE", "POLICY", "POLISH", "POLITICS", "POOL", "POOR", "POP",
  "POPCORN", "PORT", "POSE", "POSITION", "POSITIVE", "POSSESS", "POST", "POT", "POTATO", "POTTERY",
  "POUND", "POUR", "POWDER", "POWER", "PRACTICE", "PRAISE", "PRAY", "PRESENT", "PRESS", "PRETTY",
  "PRICE", "PRIDE", "PRIMARY", "PRIME", "PRINCE", "PRINT", "PRIOR", "PRIZE", "PROBLEM", "PROCESS",
  "PRODUCE", "PRODUCT", "PROFIT", "PROGRAM", "PROJECT", "PROMISE", "PROMOTE", "PROOF", "PROPERTY", "PROPOSE",
  "PROTECT", "PROUD", "PROVE", "PROVIDE", "PUBLIC", "PUDDING", "PULL", "PUMP", "PUNCH", "PUPIL",
  "PURPLE", "PURPOSE", "PURSE", "PUSH", "PUT", "PUZZLE", "QUACK", "QUALITY", "QUANTITY", "QUARTER",
  "QUEEN", "QUESTION", "QUICK", "QUIET", "QUILT", "QUIT", "QUIZ", "QUOTE", "RABBIT", "RACE",
  "RACK", "RADAR", "RADIO", "RAIL", "RAIN", "RAINBOW", "RAISE", "RALLY", "RANGE", "RANK",
  "RAPID", "RARE", "RATE", "RATHER", "RATIO", "RAW", "RAY", "RAZOR", "REACH", "REACT",
  "READ", "REAL", "REALITY", "REALIZE", "REALLY", "REASON", "REBEL", "RECALL", "RECEIVE", "RECENT",
  "RECIPE", "RECORD", "RECOVER", "RECRUIT", "RED", "REDUCE", "REFER", "REFLECT", "REFORM", "REFUSE",
  "REGARD", "REGION", "REGULAR", "REJECT", "RELATE", "RELAX", "RELEASE", "RELEVANT", "RELIABLE", "RELIEF",
  "RELIGION", "RELY", "REMAIN", "REMEMBER", "REMIND", "REMOVE", "RENDER", "RENEW", "RENT", "REPAIR",
  "REPEAT", "REPLACE", "REPLY", "REPORT", "REPRESENT", "REPUBLIC", "REPUTATION", "REQUEST", "REQUIRE", "RESCUE",
  "RESEARCH", "RESERVE", "RESIDENT", "RESIGN", "RESIST", "RESOLVE", "RESORT", "RESOURCE", "RESPECT", "RESPOND",
  "REST", "RESTAURANT", "RESTORE", "RESTRICT", "RESULT", "RETAIN", "RETIRE", "RETURN", "REVEAL", "REVENGE",
  "REVENUE", "REVIEW", "REVOLUTION", "REWARD", "RHYME", "RICE", "RICH", "RIDE", "RIDGE", "RIFLE",
  "RIGHT", "RIGID", "RINSE", "RIOT", "RIP", "RIPE", "RISE", "RISK", "RIVAL", "RIVER",
  "ROAR", "ROAST", "ROB", "ROBOT", "ROCK", "ROCKET", "ROD", "ROLE", "ROLL", "ROMANCE",
  "ROOF", "ROOM", "ROOT", "ROPE", "ROT", "ROTATE", "ROUGH", "ROUND", "ROUTE", "ROW",
  "ROYAL", "RUB", "RUBBER", "RUBBISH", "RUBY", "RUDE", "RUIN", "RULE", "RUN", "RUSH",
  "RUST", "SACK", "SAD", "SAFE", "SAIL", "SAILOR", "SAKE", "SALAD", "SALARY", "SALE",
  "SALT", "SAME", "SAMPLE", "SAND", "SANDWICH", "SATISFY", "SAUCE", "SAUSAGE", "SAVE", "SAW",
  "SAY", "SCALE", "SCAN", "SCAR", "SCARCE", "SCARE", "SCARF", "SCATTER", "SCENE", "SCENT",
  "SCHEDULE", "SCHEME", "SCHOOL", "SCIENCE", "SCISSORS", "SCORE", "SCRAPE", "SCRATCH", "SCREAM", "SCREEN",
  "SCREW", "SCRIPT", "SCULPTURE", "SEA", "SEAL", "SEAM", "SEARCH", "SEASON", "SEAT", "SECOND",
  "SECRET", "SECTION", "SECTOR", "SECURE", "SEE", "SEED", "SEEK", "SEEM", "SEIZE", "SELECT",
  "SELL", "SEND", "SENIOR", "SENSE", "SENTENCE", "SERIES", "SERIOUS", "SERVE", "SERVICE", "SESSION",
  "SET", "SETTLE", "SETUP", "SEVEN", "SEVERAL", "SEVERE", "SEW", "SEX", "SHADE", "SHADOW",
  "SHAKE", "SHALL", "SHALLOW", "SHAME", "SHAPE", "SHARE", "SHARK", "SHARP", "SHE", "SHEEP",
  "SHEET", "SHELF", "SHELL", "SHELTER", "SHIELD", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT",
  "SHOP", "SHORE", "SHORT", "SHOT", "SHOULD", "SHOULDER", "SHOUT", "SHOVE", "SHOW", "SHOWER",
  "SHRED", "SHRIEK", "SHRINK", "SHRUG", "SHUT", "SHY", "SICK", "SIDE", "SIDEWALK", "SIGHT",
  "SIGN", "SIGNAL", "SILENCE", "SILENT", "SILK", "SILLY", "SILVER", "SIMILAR", "SIMPLE", "SINCE",
  "SING", "SINGLE", "SINK", "SIP", "SIR", "SISTER", "SIT", "SITE", "SITUATION", "SIX",
  "SIZE", "SKATE", "SKELETON", "SKETCH", "SKI", "SKILL", "SKIN", "SKIP", "SKIRT", "SKULL",
  "SKY", "SLAB", "SLACK", "SLAVE", "SLEEP", "SLEEVE", "SLICE", "SLIDE", "SLIGHT", "SLIM",
  "SLIP", "SLIT", "SLOPE", "SLOT", "SLOW", "SLUG", "SLUM", "SLUMP", "SMALL", "SMART",
  "SMASH", "SMELL", "SMILE", "SMOKE", "SMOOTH", "SNAKE", "SNAP", "SNATCH", "SNEAK", "SNEEZE",
  "SNIFF", "SNUG", "SO", "SOAK", "SOAP", "SOAR", "SOCCER", "SOCIAL", "SOCIETY", "SOCK",
  "SODA", "SOFA", "SOFT", "SOIL", "SOLAR", "SOLD", "SOLDIER", "SOLE", "SOLID", "SOLO",
  "SOLUTION", "SOLVE", "SOME", "SON", "SONG", "SOON", "SORE", "SORRY", "SORT", "SOUL",
  "SOUND", "SOUP", "SOUR", "SOURCE", "SOUTH", "SPACE", "SPARE", "SPARK", "SPEAK", "SPEAR",
  "SPECIAL", "SPEECH", "SPEED", "SPELL", "SPEND", "SPHERE", "SPICE", "SPIDER", "SPIKE", "SPILL",
  "SPIN", "SPINE", "SPIRIT", "SPIT", "SPLIT", "SPOIL", "SPOKE", "SPONGE", "SPOON", "SPORT",
  "SPOT", "SPRAY", "SPREAD", "SPRING", "SPY", "SQUAD", "SQUARE", "SQUASH", "SQUAT", "SQUAWK",
  "SQUEEZE", "SQUID", "SQUINT", "SQUIRM", "SQUIRT", "STAB", "STABLE", "STACK", "STADIUM", "STAFF",
  "STAGE", "STAIR", "STAKE", "STALE", "STALK", "STALL", "STAMP", "STAND", "STARE", "STARK",
  "START", "STATE", "STATEMENT", "STATION", "STATUE", "STATUS", "STAY", "STEADY", "STEAK", "STEAL",
  "STEAM", "STEEL", "STEEP", "STEM", "STEP", "STERN", "STEW", "STICK", "STIFF", "STILL",
  "STING", "STINK", "STIR", "STOCK", "STOMACH", "STONE", "STOOP", "STOP", "STORE", "STORM",
  "STORY", "STOVE", "STRAGHT", "STRAND", "STRANGE", "STRAP", "STRAW", "STREAM", "STREET", "STRENGTH",
  "STRESS", "STRETCH", "STRICT", "STRIKE", "STRING", "STRIP", "STRIPE", "STRIVE", "STROKE", "STRONG",
  "STRUGGLE", "STUB", "STUCK", "STUDENT", "STUDIO", "STUDY", "STUFF", "STUMBLE", "STUMP", "STUN",
  "STUNT", "STUPID", "STURDY", "STYLE", "SUBJECT", "SUBMIT", "SUBSCRIBE", "SUBSTANCE", "SUBSTITUTE", "SUBTLE",
  "SUBTRACT", "SUBURB", "SUCCEED", "SUCCESS", "SUCH", "SUCK", "SUDDEN", "SUFFER", "SUGAR", "SUGGEST",
  "SUIT", "SULPHUR", "SUM", "SUMMER", "SUNNY", "SUNRISE", "SUNSET", "SUPER", "SUPPLY", "SUPPORT",
  "SUPPOSE", "SUPREME", "SURE", "SURFACE", "SURGE", "SURGEON", "SURPLUS", "SURPRISE", "SURRENDER", "SURROUND",
  "SURVEY", "SURVIVE", "SUSPECT", "SUSPEND", "SUSTAIN", "SWALLOW", "SWAMP", "SWAN", "SWAP", "SWARM",
  "SWAY", "SWEAR", "SWEAT", "SWEEP", "SWEET", "SWELL", "SWERVE", "SWIFT", "SWIM", "SWING",
  "SWITCH", "SWORD", "SYMBOL", "SYMPTOM", "SYRUP", "SYSTEM", "TACK", "TACKLE", "TACTIC", "TAG",
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
  "TREATMENT", "TREATY", "TREK", "TREMENDOUS", "TRIAL", "TRIBE", "TRICK", "TRIGGER", "TRIM", "TRIP",
  "TRIUMPH", "TROLLEY", "TROOP", "TROPHY", "TROPICAL", "TROUBLE", "TRUCK", "TRUE", "TRULY", "TRUMPET",
  "TRUNK", "TRUST", "TRUTH", "TRY", "TUB", "TUBE", "TUESDAY", "TUG", "TUITION", "TULIP",
  "TUMBLE", "TUNE", "TUNNEL", "TURBINE", "TURF", "TURKEY", "TURN", "TURNIP", "TURTLE", "TUTOR",
  "TV", "TWELVE", "TWENTY", "TWICE", "TWIG", "TWILIGHT", "TWIN", "TWIST", "TWITCH", "TWO",
  "TYPE", "TYPICAL", "UGLY", "UMBRELLA", "UNABLE", "UNAWARE", "UNBALANCE", "UNCLE", "UNCOVER", "UNDER",
  "UNDERGO", "UNDERSTAND", "UNDERTAKE", "UNDO", "UNDRESS", "UNEMPLOYMENT", "UNEXPECTED", "UNFAIR", "UNFOLD", "UNFORTUNATELY",
  "UNHAPPY", "UNIFORM", "UNION", "UNIQUE", "UNIT", "UNITE", "UNITY", "UNIVERSAL", "UNIVERSE", "UNIVERSITY",
  "UNKNOWN", "UNLESS", "UNLIKE", "UNLIKELY", "UNLOAD", "UNLOCK", "UNLUCKY", "UNNECESSARY", "UNPLEASANT", "UNREST",
  "UNSAFE", "UNTIL", "UNUSUAL", "UNVEIL", "UNWILLING", "UP", "UPDATE", "UPGRADE", "UPHOLD", "UPON",
  "UPPER", "UPRIGHT", "UPSET", "UPSTAIRS", "UPWARD", "URBAN", "URGE", "URGENT", "US", "USAGE",
  "USE", "USED", "USEFUL", "USER", "USUAL", "USUALLY", "UTILITY", "UTTER", "VACANT", "VACATION",
  "VACUUM", "VAGUE", "VAIN", "VALID", "VALLEY", "VALUABLE", "VALUE", "VAN", "VANISH", "VARIABLE",
  "VARIATION", "VARIETY", "VARIOUS", "VAST", "VAT", "VAULT", "VEGETABLE", "VEHICLE", "VEIL", "VEIN",
  "VELOCITY", "VELVET", "VENDOR", "VENTURE", "VERB", "VERBAL", "VERDICT", "VERIFY", "VERSION", "VERSUS",
  "VERTICAL", "VERY", "VESSEL", "VEST", "VETERAN", "VIA", "VIBRATE", "VICE", "VICTIM", "VICTOR",
  "VICTORY", "VIDEO", "VIEW", "VIEWER", "VILLAGE", "VILLAIN", "VIOLATE", "VIOLENCE", "VIOLENT", "VIOLET",
  "VIOLIN", "VIRGIN", "VIRTUAL", "VIRTUE", "VIRUS", "VISIBLE", "VISION", "VISIT", "VISITOR", "VISUAL",
  "VITAL", "VITAMIN", "VIVID", "VOCABULARY", "VOCAL", "VOCATION", "VOICE", "VOID", "VOLCANO", "VOLTAGE",
  "VOLUME", "VOLUNTARY", "VOLUNTEER", "VOTE", "VOTER", "VOW", "VOYAGE", "VULNERABLE", "WAGE", "WAGON",
  "WAIST", "WAIT", "WAITER", "WAKE", "WALK", "WALL", "WALLET", "WALNUT", "WANDER", "WANT",
  "WAR", "WARD", "WARDROBE", "WAREHOUSE", "WARFARE", "WARM", "WARN", "WARRANT", "WARRANTY", "WARRIOR",
  "WARTIME", "WASH", "WASTE", "WATCH", "WATERFALL", "WATERPROOF", "WAVE", "WAX", "WAY", "WE",
  "WEAK", "WEALTH", "WEALTHY", "WEAPON", "WEAR", "WEARY", "WEATHER", "WEAVE", "WEB", "WEDDING",
  "WEDGE", "WEDNESDAY", "WEED", "WEEK", "WEEKDAY", "WEEKEND", "WEEKLY", "WEEP", "WEIGH", "WEIGHT",
  "WEIRD", "WELCOME", "WELFARE", "WELL", "WEST", "WESTERN", "WET", "WHALE", "WHAT", "WHATEVER",
  "WHEAT", "WHEEL", "WHEN", "WHENEVER", "WHERE", "WHEREAS", "WHEREVER", "WHETHER", "WHICH", "WHILE",
  "WHIP", "WHIRL", "WHISK", "WHISPER", "WHISTLE", "WHITE", "WHO", "WHOEVER", "WHOLE", "WHOM",
  "WHOSE", "WHY", "WICKED", "WIDE", "WIDEN", "WIDOW", "WIDTH", "WIFE", "WILD", "WILL",
  "WILLING", "WILLOW", "WIN", "WIND", "WINDOW", "WINE", "WING", "WINK", "WINNER", "WINTER",
  "WIPE", "WIRE", "WISDOM", "WISE", "WISH", "WIT", "WITCH", "WITH", "WITHIN", "WITHOUT",
  "WITNESS", "WIZARD", "WOLF", "WOMAN", "WOMB", "WONDER", "WONDERFUL", "WOOD", "WOODEN", "WOOL",
  "WOOLEN", "WORD", "WORK", "WORKER", "WORKFORCE", "WORKPLACE", "WORKSHOP", "WORLD", "WORLDWIDE", "WORM",
  "WORRY", "WORSE", "WORSHIP", "WORST", "WORTH", "WORTHY", "WOULD", "WOUND", "WRAP", "WRATH",
  "WREAK", "WRECK", "WRENCH", "WRESTLE", "WRETCHED", "WRIGGLE", "WRING", "WRINKLE", "WRIST", "WRITE",
  "WRITER", "WRITING", "WRONG", "WROTE", "WRUNG", "WRY", "YARD", "YARN", "YAWN", "YEAR",
  "YELLOW", "YES", "YESTERDAY", "YET", "YIELD", "YOGA", "YOGURT", "YOU", "YOUNG", "YOUR",
  "YOURS", "YOURSELF", "YOUTH", "ZAP", "ZEAL", "ZEBRA", "ZERO", "ZEST", "ZIGZAG", "ZINC",
  "ZIP", "ZIPPER", "ZONE", "ZOO", "ZOOM"
];

// Combined word list for medium difficulty (uses all words)
const CODEWORDS = [...CODEWORDS_EASY, ...CODEWORDS_MEDIUM, ...CODEWORDS_HARD];

type Difficulty = "easy" | "medium" | "hard";

type CardType = "red" | "blue" | "neutral" | "assassin";
type GamePhase = "waiting" | "setup" | "playing" | "gameOver";
type PlayerRole = "spymaster" | "operative";

interface Card {
  word: string;
  type: CardType;
  revealed: boolean;
  clickedBy?: string; // Player name who clicked this card
}

interface Player {
  name: string;
  role: PlayerRole;
  team: "red" | "blue";
  avatar?: string;
}

interface GameLogEntry {
  type: "clue" | "guess" | "pass";
  team: "red" | "blue";
  player?: string;
  clue?: string;
  number?: number;
  word?: string;
  timestamp: Date;
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

interface AvailableTeam {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  adminName: string;
}

export default function CodenamesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [redTeamName, setRedTeamName] = useState("RED TEAM");
  const [blueTeamName, setBlueTeamName] = useState("BLUE TEAM");
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue" | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentTeam, setCurrentTeam] = useState<"red" | "blue">("red");
  const [clue, setClue] = useState({ word: "", number: 0 });
  const [guessesRemaining, setGuessesRemaining] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  
  // Waiting room state
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [blueTeamId, setBlueTeamId] = useState<string | null>(null);
  const [isPlayingAgainstComputer, setIsPlayingAgainstComputer] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waitingRoomStartTime, setWaitingRoomStartTime] = useState<number | null>(null);

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

  const [gameId, setGameId] = useState<string | null>(null);
  const [lastSyncedState, setLastSyncedState] = useState<string>("");

  // Helper function to determine which team the current user is on
  const getUserTeam = (): "red" | "blue" | null => {
    if (!currentUser) return null;
    const currentTeamData = localStorage.getItem("currentTeam");
    if (!currentTeamData) return "red"; // Host is red by default
    try {
      const currentTeamId = JSON.parse(currentTeamData).id;
      // If blueTeamId matches current user's team, they're on blue team
      // Otherwise, they're on red team (the host)
      if (blueTeamId && currentTeamId === blueTeamId) {
        return "blue";
      }
      return "red";
    } catch (e) {
      return "red"; // Default to red if error
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);

    // Check if there's a current group and set team name
    const currentTeam = localStorage.getItem("currentTeam");
    if (currentTeam) {
      try {
        const team = JSON.parse(currentTeam);
        setRedTeamName(team.name);
        // Create game ID from team
        const { gameStateAPI, teamsAPI } = require('@/lib/api-utils');
        const id = gameStateAPI.createGameId(team.id, 'codenames');
        setGameId(id);
        // Update team's last game access
        teamsAPI.updateTeamGameAccess(team.id);
      } catch (e) {
        console.error("Error loading team:", e);
      }
    } else {
      // Create game ID from user
      const { gameStateAPI } = require('@/lib/api-utils');
      const id = gameStateAPI.createGameId(null, 'codenames');
      setGameId(id);
    }
    
    // Initialize waiting room
    setWaitingRoomStartTime(Date.now());
    loadAvailableTeams();
  }, [router]);
  
  // Load available teams for waiting room
  const loadAvailableTeams = async () => {
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const { isSupabaseConfigured } = await import('@/lib/supabase');
      const result = await teamsAPI.getTeams();
      
      if (result.success && result.teams) {
        // Filter to only show teams that are online and not already in this game
        const currentTeamData = localStorage.getItem("currentTeam");
        const currentTeamId = currentTeamData ? JSON.parse(currentTeamData).id : null;
        
        console.log(`🔍 Codenames: Loaded ${result.teams.length} teams, current team: ${currentTeamId}`);
        
        const onlineTeams = result.teams
          .filter((team: any) => {
            // Don't show the current user's team
            if (team.id === currentTeamId) {
              console.log(`   ⏭️ Skipping own team: ${team.name}`);
              return false;
            }
            
            // If Supabase is configured, show ALL teams (they're synced across devices)
            if (isSupabaseConfigured()) {
              console.log(`   ✅ Showing Supabase team: ${team.name} (${team.id})`);
              return true;
            }
            
            // For local-only teams, check activity (but be more lenient)
            const adminOnline = teamsAPI.isUserOnline(team.adminId);
            const membersOnline = team.members?.some((member: any) => 
              teamsAPI.isUserOnline(member.id)
            ) || false;
            
            // Show new teams (created in last 30 minutes - more lenient)
            const teamAge = Date.now() - new Date(team.createdAt).getTime();
            const isNewTeam = teamAge < 30 * 60 * 1000; // 30 minutes
            
            // Also check if team has accessed a game recently (they're active)
            const hasRecentGameAccess = team.lastGameAccess 
              ? (Date.now() - new Date(team.lastGameAccess).getTime()) < 10 * 60 * 1000
              : false;
            
            const shouldShow = adminOnline || membersOnline || isNewTeam || hasRecentGameAccess;
            
            if (shouldShow) {
              console.log(`   ✅ Showing local team: ${team.name} (admin: ${adminOnline}, members: ${membersOnline}, new: ${isNewTeam}, recent game: ${hasRecentGameAccess})`);
            } else {
              console.log(`   ⏭️ Skipping inactive local team: ${team.name}`);
            }
            
            return shouldShow;
          })
          .map((team: any) => ({
            id: team.id,
            name: team.name,
            code: team.code,
            memberCount: (team.members?.length || 0) + 1,
            adminName: team.adminName,
          }));
        
        console.log(`   📋 Showing ${onlineTeams.length} available teams:`, onlineTeams.map(t => t.name));
        setAvailableTeams(onlineTeams);
      } else {
        console.warn('⚠️ Failed to load teams:', result);
        setAvailableTeams([]);
      }
    } catch (error) {
      console.error('❌ Error loading available teams:', error);
      setAvailableTeams([]);
    }
  };
  
  // Auto-refresh available teams in waiting room
  useEffect(() => {
    if (phase !== "waiting" || !currentUser) return;
    
    const interval = setInterval(() => {
      loadAvailableTeams();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [phase, currentUser]);
  
  // Function to proceed to setup phase
  const proceedToSetup = () => {
    setPhase("setup");
    setCountdown(null);
  };
  
  // Countdown timer for waiting room
  useEffect(() => {
    if (phase !== "waiting" || !waitingRoomStartTime) return;
    
    const WAIT_TIME = 30; // 30 seconds to wait for teams
    const elapsed = Math.floor((Date.now() - waitingRoomStartTime) / 1000);
    const remaining = Math.max(0, WAIT_TIME - elapsed);
    
    if (remaining > 0) {
      setCountdown(remaining);
      const timer = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - waitingRoomStartTime) / 1000);
        const newRemaining = Math.max(0, WAIT_TIME - newElapsed);
        setCountdown(newRemaining);
        
        if (newRemaining === 0 && isPlayingAgainstComputer) {
          // Auto-start if no team joined
          proceedToSetup();
        }
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      if (isPlayingAgainstComputer) {
        proceedToSetup();
      }
    }
  }, [phase, waitingRoomStartTime, isPlayingAgainstComputer]);
  
  // Function to join as blue team
  const joinAsBlueTeam = async (teamId: string) => {
    try {
      const { teamsAPI } = await import('@/lib/api-utils');
      const result = await teamsAPI.getTeams();
      
      if (result.success && result.teams) {
        const team = result.teams.find((t: any) => t.id === teamId);
        if (team) {
          setBlueTeamId(teamId);
          setBlueTeamName(team.name);
          setIsPlayingAgainstComputer(false);
          
          // Update game state to reflect blue team joined
          if (gameId && currentUser) {
            const { gameStateAPI } = await import('@/lib/api-utils');
            await gameStateAPI.saveGameState({
              id: gameId,
              gameType: 'codenames',
              teamId: (() => {
                const team = localStorage.getItem("currentTeam");
                if (team) {
                  try {
                    return JSON.parse(team).id;
                  } catch (e) {
                    return undefined;
                  }
                }
                return undefined;
              })(),
              state: {
                phase: "waiting",
                redTeamName,
                blueTeamId: teamId,
                blueTeamName: team.name,
                isPlayingAgainstComputer: false,
                waitingRoomStartTime,
              },
              lastUpdated: new Date().toISOString(),
              updatedBy: currentUser.id,
            });
          }
          
          // Reload available teams
          loadAvailableTeams();
        }
      }
    } catch (error) {
      console.error('Error joining as blue team:', error);
    }
  };

  // Save game state to Supabase whenever it changes
  useEffect(() => {
    if (!currentUser || !gameId) return;
    
    // Save waiting room state
    if (phase === "waiting") {
      const saveWaitingState = async () => {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          await gameStateAPI.saveGameState({
            id: gameId,
            gameType: 'codenames',
            teamId: (() => {
              const team = localStorage.getItem("currentTeam");
              if (team) {
                try {
                  return JSON.parse(team).id;
                } catch (e) {
                  return undefined;
                }
              }
              return undefined;
            })(),
            state: {
              phase: "waiting",
              redTeamName,
              blueTeamName,
              blueTeamId,
              isPlayingAgainstComputer,
              waitingRoomStartTime,
            },
            lastUpdated: new Date().toISOString(),
            updatedBy: currentUser.id,
          });
        } catch (error) {
          console.error('Error saving waiting room state:', error);
        }
      };
      
      // Save immediately when waiting room state changes
      saveWaitingState();
      
      // Also save periodically to ensure sync
      const intervalId = setInterval(saveWaitingState, 2000);
      return () => clearInterval(intervalId);
    }
    
    if (phase === "setup") return;
    
    const saveState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const stateToSave = {
          phase,
          difficulty,
          redTeamName,
          blueTeamName,
          cards,
          currentTeam,
          clue,
          guessesRemaining,
          gameOverReason,
          players,
          gameLog: gameLog.map(entry => ({
            ...entry,
            timestamp: entry.timestamp.toISOString()
          })),
        };
        
        const stateString = JSON.stringify(stateToSave);
        if (stateString === lastSyncedState) return; // Skip if unchanged
        
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'codenames',
          teamId: (() => {
            const team = localStorage.getItem("currentTeam");
            if (team) {
              try {
                return JSON.parse(team).id;
              } catch (e) {
                return undefined;
              }
            }
            return undefined;
          })(),
          state: stateToSave,
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
        
        setLastSyncedState(stateString);
      } catch (error) {
        console.error('Error saving game state:', error);
      }
    };
    
    // Debounce saves to avoid too many API calls
    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [phase, cards, currentTeam, clue, guessesRemaining, gameOverReason, players, gameLog, currentUser, gameId, lastSyncedState, difficulty, redTeamName, blueTeamName]);

  // Auto-switch turns when guesses run out (but not if turn was already switched by wrong card)
  const prevGuessesRemainingRef = useRef<number>(0);
  
  useEffect(() => {
    // Store the previous value before we check
    const prevGuesses = prevGuessesRemainingRef.current;
    // Update ref for next render (this will be the "previous" value next time)
    prevGuessesRemainingRef.current = guessesRemaining;
    
    // Only auto-switch if:
    // 1. We're playing
    // 2. Guesses just reached 0 (was > 0 before)
    // 3. Game isn't over
    // 4. We have a clue (meaning a turn was in progress)
    if (phase !== "playing" || guessesRemaining !== 0 || gameOverReason) {
      return;
    }
    if (prevGuesses <= 0) {
      return; // Was already 0, don't switch
    }
    if (!clue.word && clue.number === 0) {
      return; // No clue, turn already switched or game just started
    }
    
    // Small delay to allow the UI to update first
    const timeoutId = setTimeout(async () => {
      const newCurrentTeam = currentTeam === "red" ? "blue" : "red";
      const newClue = { word: "", number: 0 };
      setCurrentTeam(newCurrentTeam);
      setClue(newClue);
      
      // Sync turn switch to other devices
      if (gameId && currentUser) {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          await gameStateAPI.saveGameState({
            id: gameId,
            gameType: 'codenames',
            teamId: (() => {
              const team = localStorage.getItem("currentTeam");
              if (team) {
                try {
                  return JSON.parse(team).id;
                } catch (e) {
                  return undefined;
                }
              }
              return undefined;
            })(),
            state: {
              phase,
              difficulty,
              redTeamName,
              blueTeamName,
              cards,
              currentTeam: newCurrentTeam,
              clue: newClue,
              guessesRemaining: 0,
              gameOverReason,
              players,
              gameLog: gameLog.map(entry => ({
                ...entry,
                timestamp: entry.timestamp.toISOString()
              })),
            },
            lastUpdated: new Date().toISOString(),
            updatedBy: currentUser.id,
          });
          setLastSyncedState(JSON.stringify({
            phase,
            difficulty,
            redTeamName,
            blueTeamName,
            cards,
            currentTeam: newCurrentTeam,
            clue: newClue,
            guessesRemaining: 0,
            gameOverReason,
            players,
            gameLog,
          }));
        } catch (error) {
          console.error('Error syncing auto turn switch:', error);
        }
      }
    }, 500); // Small delay to show the "no guesses remaining" state
    
    return () => clearTimeout(timeoutId);
  }, [guessesRemaining, phase, currentTeam, clue, gameOverReason, gameId, currentUser, cards, difficulty, redTeamName, blueTeamName, players, gameLog]);

  // Poll for game state updates from other devices
  useEffect(() => {
    if (!currentUser || !gameId) return;
    
    // Poll waiting room state
    if (phase === "waiting") {
      const pollWaitingState = async () => {
        try {
          const { gameStateAPI } = await import('@/lib/api-utils');
          const result = await gameStateAPI.getGameState(gameId);
          
          if (result.success && result.state) {
            const remoteState = result.state.state;
            
            // Only update if state is different and from another user
            if (result.state.updatedBy !== currentUser.id) {
              const userTeam = getUserTeam();
              
              // Update blue team if it changed
              if (remoteState.blueTeamId) {
                if (remoteState.blueTeamId !== blueTeamId) {
                  setBlueTeamId(remoteState.blueTeamId);
                  setIsPlayingAgainstComputer(false);
                  // Only update blue team name if we're on red team (opposing team)
                  if (remoteState.blueTeamName && userTeam === "red") {
                    setBlueTeamName(remoteState.blueTeamName);
                  }
                }
              } else if (blueTeamId && !remoteState.blueTeamId) {
                // Blue team was removed
                setBlueTeamId(null);
                setIsPlayingAgainstComputer(true);
              }
              
              // Update isPlayingAgainstComputer status
              if (remoteState.isPlayingAgainstComputer !== undefined) {
                setIsPlayingAgainstComputer(remoteState.isPlayingAgainstComputer);
              }
              
              // Only update red team name if we're on blue team (opposing team)
              if (remoteState.redTeamName && remoteState.redTeamName !== redTeamName && userTeam === "blue") {
                setRedTeamName(remoteState.redTeamName);
              }
              
              if (remoteState.phase && remoteState.phase !== "waiting") {
                // Game started by another player
                if (remoteState.phase === "setup" || remoteState.phase === "playing") {
                  setPhase(remoteState.phase);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error polling waiting room state:', error);
        }
      };
      
      const intervalId = setInterval(pollWaitingState, 1000);
      pollWaitingState(); // Initial poll
      
      return () => clearInterval(intervalId);
    }
    
    if (phase === "setup") return;
    
    const pollState = async () => {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state) {
          const remoteState = result.state.state;
          const remoteStateString = JSON.stringify(remoteState);
          
          // Only update if state is different and from another user
          if (remoteStateString !== lastSyncedState && result.state.updatedBy !== currentUser.id) {
            const userTeam = getUserTeam();
            
            // Merge remote state
            if (remoteState.phase) setPhase(remoteState.phase);
            if (remoteState.difficulty) setDifficulty(remoteState.difficulty);
            
            // Only update team names from opposing team
            // Red team name should only be updated if we're on blue team
            if (remoteState.redTeamName && userTeam === "blue") {
              setRedTeamName(remoteState.redTeamName);
            }
            // Blue team name should only be updated if we're on red team
            if (remoteState.blueTeamName && userTeam === "red") {
              setBlueTeamName(remoteState.blueTeamName);
            }
            if (remoteState.cards) setCards(remoteState.cards);
            if (remoteState.currentTeam) setCurrentTeam(remoteState.currentTeam);
            if (remoteState.clue) setClue(remoteState.clue);
            if (remoteState.guessesRemaining !== undefined) setGuessesRemaining(remoteState.guessesRemaining);
            if (remoteState.gameOverReason) setGameOverReason(remoteState.gameOverReason);
            if (remoteState.players) setPlayers(remoteState.players);
            if (remoteState.gameLog) {
              setGameLog(remoteState.gameLog.map((entry: any) => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
              })));
            }
            setLastSyncedState(remoteStateString);
          }
        }
      } catch (error) {
        console.error('Error polling game state:', error);
      }
    };
    
    // Poll every 1 second for real-time updates
    const intervalId = setInterval(pollState, 1000);
    pollState(); // Initial poll
    
    return () => clearInterval(intervalId);
  }, [currentUser, gameId, phase, lastSyncedState]);

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPlayerAvatar = (name: string) => {
    const initials = getPlayerInitials(name);
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  const generateBoard = () => {
    // Select words based on difficulty
    let wordPool: string[];
    switch (difficulty) {
      case "easy":
        wordPool = CODEWORDS_EASY;
        break;
      case "hard":
        wordPool = CODEWORDS_HARD;
        break;
      case "medium":
      default:
        // Medium uses mix: 40% easy, 30% medium, 30% hard
        const easyCount = Math.floor(25 * 0.4);
        const mediumCount = Math.floor(25 * 0.3);
        const hardCount = 25 - easyCount - mediumCount;
        const easyWords = [...CODEWORDS_EASY].sort(() => Math.random() - 0.5).slice(0, easyCount);
        const mediumWords = [...CODEWORDS_MEDIUM].sort(() => Math.random() - 0.5).slice(0, mediumCount);
        const hardWords = [...CODEWORDS_HARD].sort(() => Math.random() - 0.5).slice(0, hardCount);
        wordPool = [...easyWords, ...mediumWords, ...hardWords];
        break;
    }
    
    const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
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

  const startGame = async () => {
    // Try to load existing game state first
    if (gameId && currentUser) {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        const result = await gameStateAPI.getGameState(gameId);
        
        if (result.success && result.state && result.state.state.phase === "playing") {
          // Load existing game state
          const savedState = result.state.state;
          setPhase(savedState.phase || "playing");
          setDifficulty(savedState.difficulty || difficulty);
          // When loading a game in progress, restore both team names (they're locked at this point)
          // But only if we don't already have them set (to avoid overwriting user's own team name)
          if (savedState.redTeamName && (!redTeamName || redTeamName === "RED TEAM")) {
            setRedTeamName(savedState.redTeamName);
          }
          if (savedState.blueTeamName && (!blueTeamName || blueTeamName === "BLUE TEAM")) {
            setBlueTeamName(savedState.blueTeamName);
          }
          setCards(savedState.cards || []);
          setCurrentTeam(savedState.currentTeam || "red");
          setClue(savedState.clue || { word: "", number: 0 });
          setGuessesRemaining(savedState.guessesRemaining || 0);
          setGameOverReason(savedState.gameOverReason || "");
          setPlayers(savedState.players || []);
          setGameLog((savedState.gameLog || []).map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })));
          return;
        }
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    }
    
    // Start new game
    generateBoard();
    setPhase("playing");
    setCurrentTeam("red");
    setClue({ word: "", number: 0 });
    setGuessesRemaining(0);
    setGameLog([]);
    // Initialize players if team exists
    const currentTeam = localStorage.getItem("currentTeam");
    if (currentTeam) {
      try {
        const team = JSON.parse(currentTeam);
        const teamPlayers: Player[] = [
          { name: currentUser.name, role: "operative", team: "red" },
          ...team.members.map((m: any) => ({ name: m.name, role: "operative", team: "red" as const }))
        ];
        setPlayers(teamPlayers);
      } catch (e) {
        console.error("Error loading team:", e);
      }
    }
  };

  const revealCard = async (index: number) => {
    if (role !== "operative" || guessesRemaining === 0 || cards[index].revealed) return;
    
    const newCards = [...cards];
    newCards[index].revealed = true;
    newCards[index].clickedBy = currentUser.name;
    setCards(newCards);
    const newGuessesRemaining = guessesRemaining - 1;
    setGuessesRemaining(newGuessesRemaining);
    
    // Add to game log
    const newLogEntry = {
      type: "guess" as const,
      team: currentTeam,
      player: currentUser.name,
      word: newCards[index].word,
      timestamp: new Date()
    };
    setGameLog(prev => [...prev, newLogEntry]);
    
    const card = newCards[index];
    let newPhase = phase;
    let newCurrentTeam = currentTeam;
    let newClue = clue;
    let newGuessesRemainingAfter = newGuessesRemaining;
    let newGameOverReason = gameOverReason;
    
    // Check for game over conditions
    if (card.type === "assassin") {
      // Current team loses
      newGameOverReason = `${currentTeam === "red" ? redTeamName : blueTeamName} hit the assassin! ${currentTeam === "red" ? blueTeamName : redTeamName} wins!`;
      newPhase = "gameOver";
      setGameOverReason(newGameOverReason);
      setPhase(newPhase);
    } else if (card.type !== currentTeam) {
      // Wrong team's card or neutral - switch teams
      newCurrentTeam = currentTeam === "red" ? "blue" : "red";
      newClue = { word: "", number: 0 };
      newGuessesRemainingAfter = 0;
      setCurrentTeam(newCurrentTeam);
      setClue(newClue);
      setGuessesRemaining(newGuessesRemainingAfter);
    } else {
      // Check if team won
      const teamCards = newCards.filter(c => c.type === currentTeam);
      const allRevealed = teamCards.every(c => c.revealed);
      if (allRevealed) {
        newGameOverReason = `${currentTeam === "red" ? redTeamName : blueTeamName} found all their words!`;
        newPhase = "gameOver";
        setGameOverReason(newGameOverReason);
        setPhase(newPhase);
      }
    }
    
    // Immediately sync card reveal to other devices
    if (gameId && currentUser) {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'codenames',
          teamId: (() => {
            const team = localStorage.getItem("currentTeam");
            if (team) {
              try {
                return JSON.parse(team).id;
              } catch (e) {
                return undefined;
              }
            }
            return undefined;
          })(),
          state: {
            phase: newPhase,
            difficulty,
            redTeamName,
            blueTeamName,
            cards: newCards,
            currentTeam: newCurrentTeam,
            clue: newClue,
            guessesRemaining: newGuessesRemainingAfter,
            gameOverReason: newGameOverReason,
            players,
            gameLog: [...gameLog, newLogEntry].map(entry => ({
              ...entry,
              timestamp: entry.timestamp.toISOString()
            })),
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
        setLastSyncedState(JSON.stringify({
          phase: newPhase,
          difficulty,
          redTeamName,
          blueTeamName,
          cards: newCards,
          currentTeam: newCurrentTeam,
          clue: newClue,
          guessesRemaining: newGuessesRemainingAfter,
          gameOverReason: newGameOverReason,
          players,
          gameLog: [...gameLog, newLogEntry],
        }));
      } catch (error) {
        console.error('Error syncing card reveal:', error);
      }
    }
  };

  const giveClue = async () => {
    if (!clue.word.trim() || clue.number < 1 || clue.number > 9) return;
    const newGuessesRemaining = clue.number + 1; // +1 for the bonus guess
    setGuessesRemaining(newGuessesRemaining);
    // Add to game log
    const newLogEntry = {
      type: "clue" as const,
      team: currentTeam,
      player: currentUser.name,
      clue: clue.word,
      number: clue.number,
      timestamp: new Date()
    };
    setGameLog(prev => [...prev, newLogEntry]);
    
    // Immediately sync clue to other devices
    if (gameId && currentUser) {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'codenames',
          teamId: (() => {
            const team = localStorage.getItem("currentTeam");
            if (team) {
              try {
                return JSON.parse(team).id;
              } catch (e) {
                return undefined;
              }
            }
            return undefined;
          })(),
          state: {
            phase,
            difficulty,
            redTeamName,
            blueTeamName,
            cards,
            currentTeam,
            clue,
            guessesRemaining: newGuessesRemaining,
            gameOverReason,
            players,
            gameLog: [...gameLog, newLogEntry].map(entry => ({
              ...entry,
              timestamp: entry.timestamp.toISOString()
            })),
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
        setLastSyncedState(JSON.stringify({
          phase,
          difficulty,
          redTeamName,
          blueTeamName,
          cards,
          currentTeam,
          clue,
          guessesRemaining: newGuessesRemaining,
          gameOverReason,
          players,
          gameLog: [...gameLog, newLogEntry],
        }));
      } catch (error) {
        console.error('Error syncing clue:', error);
      }
    }
  };

  const passTurn = async () => {
    const newLogEntry = {
      type: "pass" as const,
      team: currentTeam,
      player: currentUser.name,
      timestamp: new Date()
    };
    setGameLog(prev => [...prev, newLogEntry]);
    const newCurrentTeam = currentTeam === "red" ? "blue" : "red";
    const newClue = { word: "", number: 0 };
    setCurrentTeam(newCurrentTeam);
    setClue(newClue);
    setGuessesRemaining(0);
    
    // Sync turn switch to other devices
    if (gameId && currentUser) {
      try {
        const { gameStateAPI } = await import('@/lib/api-utils');
        await gameStateAPI.saveGameState({
          id: gameId,
          gameType: 'codenames',
          teamId: (() => {
            const team = localStorage.getItem("currentTeam");
            if (team) {
              try {
                return JSON.parse(team).id;
              } catch (e) {
                return undefined;
              }
            }
            return undefined;
          })(),
          state: {
            phase,
            difficulty,
            redTeamName,
            blueTeamName,
            cards,
            currentTeam: newCurrentTeam,
            clue: newClue,
            guessesRemaining: 0,
            gameOverReason,
            players,
            gameLog: [...gameLog, newLogEntry].map(entry => ({
              ...entry,
              timestamp: entry.timestamp.toISOString()
            })),
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
        setLastSyncedState(JSON.stringify({
          phase,
          difficulty,
          redTeamName,
          blueTeamName,
          cards,
          currentTeam: newCurrentTeam,
          clue: newClue,
          guessesRemaining: 0,
          gameOverReason,
          players,
          gameLog: [...gameLog, newLogEntry],
        }));
      } catch (error) {
        console.error('Error syncing turn switch:', error);
      }
    }
  };

  const resetGame = () => {
    setPhase("waiting");
    setRole(null);
    setSelectedTeam(null);
    setCards([]);
    setCurrentTeam("red");
    setClue({ word: "", number: 0 });
    setGuessesRemaining(0);
    setGameOverReason("");
    setBlueTeamId(null);
    setIsPlayingAgainstComputer(true);
    setCountdown(null);
    setWaitingRoomStartTime(Date.now());
    loadAvailableTeams();
    // Keep difficulty setting
  };

  if (!currentUser) return null;

  const activeTeam = currentTeam === "red" ? redTeam : blueTeam;

  // WAITING ROOM PHASE
  if (phase === "waiting") {
    const currentTeamData = localStorage.getItem("currentTeam");
    let teamInfo = null;
    if (currentTeamData) {
      try {
        teamInfo = JSON.parse(currentTeamData);
      } catch (e) {
        // Ignore parse errors
      }
    }

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
              Waiting for teams to join...
            </p>
          </div>

          {/* Current Team Info */}
          {teamInfo && (
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-purple-400 font-bold">You are playing as: {teamInfo.name}</div>
                    <div className="text-red-400 font-semibold text-sm">
                      RED TEAM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Status */}
          <div className="neon-card neon-box-cyan p-6 mb-6 card-3d">
            <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-4 text-center">
              🎮 GAME STATUS
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-900/30 rounded-xl p-4 border-2 border-red-500 neon-box-pink">
                <div className="text-red-400 font-bold text-sm mb-2">RED TEAM</div>
                <div className="text-white font-semibold text-lg">{redTeamName}</div>
                {teamInfo && (
                  <div className="text-red-300/70 text-xs mt-1">
                    {teamInfo.members.length + 1} member{teamInfo.members.length !== 0 ? "s" : ""}
                  </div>
                )}
              </div>
              
              <div className={`rounded-xl p-4 border-2 ${blueTeamId ? "bg-blue-900/30 border-blue-500 neon-box-cyan" : "bg-gray-800/50 border-gray-600"}`}>
                <div className={`font-bold text-sm mb-2 ${blueTeamId ? "text-blue-400" : "text-gray-400"}`}>
                  BLUE TEAM
                </div>
                {blueTeamId ? (
                  <>
                    <div className="text-white font-semibold text-lg">{blueTeamName}</div>
                    <div className="text-blue-300/70 text-xs mt-1">Team joined!</div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 font-semibold text-lg">
                      {isPlayingAgainstComputer ? "🤖 COMPUTER" : "WAITING..."}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {isPlayingAgainstComputer ? "Playing against AI" : "No team joined yet"}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Countdown Timer */}
            {countdown !== null && countdown > 0 && (
              <div className="text-center mb-4">
                <div className="text-yellow-400 font-bold text-2xl mb-2">
                  {isPlayingAgainstComputer ? `Starting in ${countdown} seconds...` : "Waiting for teams..."}
                </div>
                {isPlayingAgainstComputer && (
                  <p className="text-cyan-300/70 text-sm">
                    Game will start automatically against computer if no team joins
                  </p>
                )}
              </div>
            )}

            {/* Available Teams */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                AVAILABLE TEAMS TO JOIN AS BLUE TEAM
              </h3>
              
              {availableTeams.length === 0 ? (
                <div className="bg-gray-800/30 rounded-xl p-6 border-2 border-gray-600 text-center">
                  <div className="text-gray-400 mb-2">No other teams online</div>
                  <div className="text-gray-500 text-sm">
                    {isPlayingAgainstComputer 
                      ? "You'll play against the computer"
                      : "Waiting for teams to come online..."}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableTeams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-gray-800/50 rounded-xl p-4 border-2 border-gray-600 hover:border-blue-500 transition-all flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="text-white font-semibold">{team.name}</div>
                        <div className="text-gray-400 text-sm">
                          {team.memberCount} member{team.memberCount !== 1 ? "s" : ""} • Admin: {team.adminName}
                        </div>
                        <div className="text-cyan-400 text-xs font-mono mt-1">Code: {team.code}</div>
                      </div>
                      {blueTeamId === team.id ? (
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded text-green-400 font-bold text-sm">
                          JOINED ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => joinAsBlueTeam(team.id)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition-all hover:scale-105"
                        >
                          JOIN AS BLUE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {blueTeamId && (
                <button
                  onClick={proceedToSetup}
                  className="flex-1 neon-btn neon-btn-green py-4 text-lg font-bold"
                >
                  START GAME WITH {blueTeamName.toUpperCase()}
                </button>
              )}
              {isPlayingAgainstComputer && (
                <button
                  onClick={proceedToSetup}
                  className="flex-1 neon-btn neon-btn-yellow py-4 text-lg font-bold"
                >
                  START GAME VS COMPUTER
                </button>
              )}
              {!blueTeamId && !isPlayingAgainstComputer && countdown !== null && countdown > 0 && (
                <button
                  onClick={() => {
                    setIsPlayingAgainstComputer(true);
                    setCountdown(5); // Short countdown when manually starting
                  }}
                  className="flex-1 neon-btn neon-btn-yellow py-4 text-lg font-bold"
                >
                  PLAY VS COMPUTER INSTEAD
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
              <h3 className="font-bold text-blue-400 mb-2">ℹ️ HOW IT WORKS</h3>
              <ul className="text-blue-300/80 space-y-1 text-sm">
                <li>• You are automatically on the <span className="text-red-400 font-bold">RED TEAM</span></li>
                <li>• Other online teams can join as the <span className="text-blue-400 font-bold">BLUE TEAM</span></li>
                <li>• If no team joins, you'll play against the <span className="text-yellow-400 font-bold">COMPUTER</span></li>
                <li>• Game will start automatically after {countdown !== null ? countdown : 30} seconds, or click to start early</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SETUP PHASE
  if (phase === "setup") {
    const currentTeamData = localStorage.getItem("currentTeam");
    let teamInfo = null;
    if (currentTeamData) {
      try {
        teamInfo = JSON.parse(currentTeamData);
      } catch (e) {
        // Ignore parse errors
      }
    }

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

          {/* Group Info Banner */}
          {teamInfo && (
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-purple-400 font-bold">Playing as Team: {teamInfo.name}</div>
                    <div className="text-cyan-300/70 text-sm">
                      {teamInfo.members.length + 1} member{teamInfo.members.length !== 0 ? "s" : ""} as RED TEAM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="neon-card neon-box-pink p-8 mb-6 card-3d">
            <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-6 text-center">
              🎯 SETUP YOUR TEAMS
            </h2>

            {/* Difficulty Selection */}
            <div className="mb-6 p-4 bg-black/30 rounded-xl border-2 border-yellow-500/50">
              <label className="block text-yellow-400 font-semibold mb-3">
                DIFFICULTY LEVEL
              </label>
              <div className="flex gap-3">
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 ${
                      difficulty === diff
                        ? "bg-yellow-500 text-black neon-box-yellow"
                        : "bg-black/50 text-gray-400 border-2 border-gray-600 hover:border-yellow-500"
                    }`}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                {difficulty === "easy" && "Simple, common words"}
                {difficulty === "medium" && "Mix of simple and complex words"}
                {difficulty === "hard" && "Complex and abstract words"}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-900/30 rounded-xl p-4 border-2 border-red-500 neon-box-pink">
                <label className="block text-red-400 font-semibold mb-2">RED TEAM NAME</label>
                <input
                  type="text"
                  value={redTeamName}
                  onChange={(e) => {
                    const userTeam = getUserTeam();
                    // Only allow red team (host) to edit red team name
                    if (userTeam === "red") {
                      setRedTeamName(e.target.value.toUpperCase());
                    }
                  }}
                  disabled={getUserTeam() !== "red"}
                  className={`w-full px-4 py-2 rounded-lg bg-black/50 border-2 text-white font-semibold focus:outline-none ${
                    getUserTeam() === "red" 
                      ? "border-gray-600 focus:border-red-400 cursor-text" 
                      : "border-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                  maxLength={20}
                />
                {getUserTeam() !== "red" && (
                  <div className="text-xs text-gray-400 mt-1">Only the red team can edit this name</div>
                )}
              </div>

              <div className="bg-blue-900/30 rounded-xl p-4 border-2 border-blue-500 neon-box-cyan">
                <label className="block text-blue-400 font-semibold mb-2">BLUE TEAM NAME</label>
                <input
                  type="text"
                  value={blueTeamName}
                  onChange={(e) => {
                    const userTeam = getUserTeam();
                    // Only allow blue team to edit blue team name
                    if (userTeam === "blue") {
                      setBlueTeamName(e.target.value.toUpperCase());
                    }
                  }}
                  disabled={getUserTeam() !== "blue" || !blueTeamId}
                  className={`w-full px-4 py-2 rounded-lg bg-black/50 border-2 text-white font-semibold focus:outline-none ${
                    getUserTeam() === "blue" && blueTeamId
                      ? "border-gray-600 focus:border-blue-400 cursor-text" 
                      : "border-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                  maxLength={20}
                />
                {getUserTeam() !== "blue" && (
                  <div className="text-xs text-gray-400 mt-1">
                    {blueTeamId ? "Only the blue team can edit this name" : "Blue team name will be set when a team joins"}
                  </div>
                )}
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
    // Auto-select team based on waiting room setup
    // If blueTeamId is set and matches current user's team, they're blue, otherwise red (host)
    if (!selectedTeam && currentUser) {
      const currentTeamData = localStorage.getItem("currentTeam");
      let currentTeamId = null;
      if (currentTeamData) {
        try {
          currentTeamId = JSON.parse(currentTeamData).id;
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // If blueTeamId matches current user's team, they're on blue team
      // Otherwise, they're on red team (the host)
      if (blueTeamId && currentTeamId === blueTeamId) {
        setSelectedTeam("blue");
      } else {
        setSelectedTeam("red");
      }
    }
    
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

          {/* Role Selection */}
          {selectedTeam && (
            <div className="neon-card neon-box-cyan p-8 card-3d">
              <h3 className="text-xl font-bold text-center text-cyan-400 mb-6">WHAT'S YOUR ROLE?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={async () => { 
                    setRole("spymaster");
                    // Add player to players list
                    const newPlayer: Player = {
                      name: currentUser.name,
                      role: "spymaster",
                      team: selectedTeam
                    };
                    setPlayers(prev => {
                      const filtered = prev.filter(p => p.name !== currentUser.name);
                      return [...filtered, newPlayer];
                    });
                    // Immediately sync role selection
                    if (gameId && currentUser) {
                      try {
                        const { gameStateAPI } = await import('@/lib/api-utils');
                        await gameStateAPI.saveGameState({
                          id: gameId,
                          gameType: 'codenames',
                          teamId: (() => {
                            const team = localStorage.getItem("currentTeam");
                            if (team) {
                              try {
                                return JSON.parse(team).id;
                              } catch (e) {
                                return undefined;
                              }
                            }
                            return undefined;
                          })(),
                          state: {
                            phase,
                            difficulty,
                            redTeamName,
                            blueTeamName,
                            cards,
                            currentTeam,
                            clue,
                            guessesRemaining,
                            gameOverReason,
                            players: [...players.filter(p => p.name !== currentUser.name), newPlayer],
                            gameLog: gameLog.map(entry => ({
                              ...entry,
                              timestamp: entry.timestamp.toISOString()
                            })),
                          },
                          lastUpdated: new Date().toISOString(),
                          updatedBy: currentUser.id,
                        });
                      } catch (error) {
                        console.error('Error syncing role:', error);
                      }
                    }
                  }}
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
                  onClick={async () => { 
                    setRole("operative");
                    // Add player to players list
                    const newPlayer: Player = {
                      name: currentUser.name,
                      role: "operative",
                      team: selectedTeam
                    };
                    setPlayers(prev => {
                      const filtered = prev.filter(p => p.name !== currentUser.name);
                      return [...filtered, newPlayer];
                    });
                    // Immediately sync role selection
                    if (gameId && currentUser) {
                      try {
                        const { gameStateAPI } = await import('@/lib/api-utils');
                        await gameStateAPI.saveGameState({
                          id: gameId,
                          gameType: 'codenames',
                          teamId: (() => {
                            const team = localStorage.getItem("currentTeam");
                            if (team) {
                              try {
                                return JSON.parse(team).id;
                              } catch (e) {
                                return undefined;
                              }
                            }
                            return undefined;
                          })(),
                          state: {
                            phase,
                            difficulty,
                            redTeamName,
                            blueTeamName,
                            cards,
                            currentTeam,
                            clue,
                            guessesRemaining,
                            gameOverReason,
                            players: [...players.filter(p => p.name !== currentUser.name), newPlayer],
                            gameLog: gameLog.map(entry => ({
                              ...entry,
                              timestamp: entry.timestamp.toISOString()
                            })),
                          },
                          lastUpdated: new Date().toISOString(),
                          updatedBy: currentUser.id,
                        });
                      } catch (error) {
                        console.error('Error syncing role:', error);
                      }
                    }
                  }}
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
    const playerTeam = selectedTeam === "red" ? redTeam : blueTeam;
    const opponentTeam = selectedTeam === "red" ? blueTeam : redTeam;
    const redOperatives = players.filter(p => p.team === "red" && p.role === "operative");
    const blueOperatives = players.filter(p => p.team === "blue" && p.role === "operative");
    const redSpymasters = players.filter(p => p.team === "red" && p.role === "spymaster");
    const blueSpymasters = players.filter(p => p.team === "blue" && p.role === "spymaster");

    return (
      <div className="min-h-screen p-2 md:p-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Teams and Game Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
            {/* Blue Team Panel */}
            <div className={`${blueTeam.color.light} rounded-xl p-3 md:p-4 border-2 ${blueTeam.color.border} ${currentTeam === "blue" ? blueTeam.color.glow : "opacity-80"}`}>
              <div className="text-xs text-gray-400 mb-2 font-semibold">OPERATIVES</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {blueOperatives.length > 0 ? blueOperatives.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-bold border-2 ${blueTeam.color.border}`}>
                        {avatar.initials}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[50px]">{p.name}</div>
                    </div>
                  );
                }) : (
                  <div className="text-xs text-gray-500">No operatives</div>
                )}
              </div>
              <div className="text-center mb-2">
                <div className={`text-3xl md:text-4xl font-bold pixel-font ${blueTeam.color.text}`}>{blueTeam.cardsRemaining}</div>
                <div className="text-[10px] text-gray-400">CARDS LEFT</div>
              </div>
              <div className="text-xs text-gray-400 mb-1 font-semibold">SPYMASTERS</div>
              <div className="flex flex-wrap gap-2">
                {blueSpymasters.length > 0 ? blueSpymasters.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-[10px] font-bold border-2 ${blueTeam.color.border}`}>
                      {avatar.initials}
                    </div>
                  );
                }) : (
                  <div className="text-[10px] text-gray-500">No spymasters</div>
                )}
              </div>
            </div>

            {/* Game Log */}
            <div className="bg-black/40 rounded-xl p-3 md:p-4 border-2 border-gray-700">
              <div className="text-xs text-gray-400 mb-2 font-semibold">GAME LOG</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {gameLog.slice(-5).reverse().map((entry, i) => (
                  <div key={i} className="text-[10px] md:text-xs">
                    {entry.type === "clue" && (
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${entry.team === "red" ? "text-red-400" : "text-blue-400"}`}>
                          {entry.clue} {entry.number}
                        </span>
                        {guessesRemaining > 0 && entry.team === currentTeam && (
                          <span className="text-cyan-400 text-xs">∞</span>
                        )}
                      </div>
                    )}
                    {entry.type === "guess" && (
                      <div className="flex items-center gap-1">
                        {entry.word && (
                          <>
                            <div className={`w-4 h-4 rounded-full ${getPlayerAvatar(entry.player || "").color} flex items-center justify-center text-[8px] text-white`}>
                              {getPlayerAvatar(entry.player || "").initials[0]}
                            </div>
                            <span className="text-gray-300">{entry.word}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Red Team Panel */}
            <div className={`${redTeam.color.light} rounded-xl p-3 md:p-4 border-2 ${redTeam.color.border} ${currentTeam === "red" ? redTeam.color.glow : "opacity-80"}`}>
              <div className="text-xs text-gray-400 mb-2 font-semibold">OPERATIVES</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {redOperatives.length > 0 ? redOperatives.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-bold border-2 ${redTeam.color.border}`}>
                        {avatar.initials}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[50px]">{p.name}</div>
                    </div>
                  );
                }) : (
                  <div className="text-xs text-gray-500">No operatives</div>
                )}
              </div>
              <div className="text-center mb-2">
                <div className={`text-3xl md:text-4xl font-bold pixel-font ${redTeam.color.text}`}>{redTeam.cardsRemaining}</div>
                <div className="text-[10px] text-gray-400">CARDS LEFT</div>
              </div>
              <div className="text-xs text-gray-400 mb-1 font-semibold">SPYMASTERS</div>
              <div className="flex flex-wrap gap-2">
                {redSpymasters.length > 0 ? redSpymasters.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-[10px] font-bold border-2 ${redTeam.color.border}`}>
                      {avatar.initials}
                    </div>
                  );
                }) : (
                  <div className="text-[10px] text-gray-500">No spymasters</div>
                )}
              </div>
            </div>
          </div>

          {/* Current Turn Banner */}
          <div className={`${activeTeam.color.light} rounded-xl p-3 md:p-4 mb-4 border-2 ${activeTeam.color.border} ${activeTeam.color.glow} text-center`}>
            <div className="text-sm md:text-base font-bold text-gray-300">
              {activeTeam.name.toUpperCase()} SPYMASTER TURN
            </div>
            {selectedTeam === currentTeam && guessesRemaining > 0 && (
              <div className="mt-2">
                <div className="text-xl md:text-2xl font-bold text-yellow-400 pixel-font">
                  {clue.word} {clue.number}
                </div>
                <div className="text-xs text-gray-400 mt-1">Your operatives are guessing...</div>
              </div>
            )}
          </div>

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

          {/* Board - Spymaster sees colors */}
          <div className="bg-black/30 rounded-xl p-3 md:p-5 border-2 border-gray-700 mb-4">
            <div className="grid grid-cols-5 gap-3 md:gap-4 lg:gap-5">
              {cards.map((card, idx) => {
                const isRevealed = card.revealed;
                const getCardColor = () => {
                  if (isRevealed) {
                    if (card.type === "red") return "bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-xl shadow-red-500/60 border-2 border-red-300";
                    if (card.type === "blue") return "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/60 border-2 border-blue-300";
                    if (card.type === "assassin") return "bg-gradient-to-br from-black via-gray-900 to-black text-white border-4 border-red-400 shadow-xl shadow-red-500/80";
                    return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 text-black shadow-xl shadow-yellow-500/60 border-2 border-yellow-300";
                  }
                  if (card.type === "red") return "bg-gradient-to-br from-red-800/70 to-red-950/70 text-red-100 border-2 border-red-400/80 shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/60 hover:border-red-300";
                  if (card.type === "blue") return "bg-gradient-to-br from-blue-800/70 to-blue-950/70 text-blue-100 border-2 border-blue-400/80 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 hover:border-blue-300";
                  if (card.type === "assassin") return "bg-gradient-to-br from-gray-900 to-black text-gray-400 border-2 border-gray-600/80 shadow-lg shadow-gray-900/60";
                  return "bg-gradient-to-br from-yellow-800/50 to-yellow-950/50 text-yellow-100 border-2 border-yellow-500/80 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/50 hover:border-yellow-400";
                };
                
                // Asian pattern SVG
                const asianPattern = `data:image/svg+xml,${encodeURIComponent(`
                  <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="asian${idx}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/>
                        <path d="M5,5 L15,15 M15,5 L5,15" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
                        <rect x="8" y="8" width="4" height="4" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#asian${idx})"/>
                  </svg>
                `)}`;
                
                const clickedByAvatar = card.clickedBy ? getPlayerAvatar(card.clickedBy) : null;
                
                return (
                  <div
                    key={idx}
                    className={`relative p-3 md:p-5 lg:p-6 rounded-xl font-bold text-xs md:text-sm lg:text-base text-center transition-all duration-300 transform hover:scale-105 ${getCardColor()}`}
                    style={{
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {/* Player avatar on tile */}
                    {card.clickedBy && (
                      <div className="absolute top-1 left-1 z-20">
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${clickedByAvatar?.color} flex items-center justify-center text-white text-[8px] md:text-[10px] font-bold border border-white/50`}>
                          {clickedByAvatar?.initials[0]}
                        </div>
                      </div>
                    )}
                    
                    {/* Asian pattern overlay */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-30"
                      style={{
                        backgroundImage: `url("${asianPattern}")`,
                        backgroundSize: '40px 40px',
                        backgroundRepeat: 'repeat',
                      }}
                    ></div>
                    {/* Additional decorative border pattern */}
                    <div className="absolute inset-0 rounded-xl" style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                      backgroundSize: '20px 20px',
                    }}></div>
                    <div className="relative z-10 w-full font-semibold">
                      {card.word}
                      {card.type === "assassin" && !isRevealed && (
                        <div className="text-sm mt-1 opacity-80">💀</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-black/30 rounded-xl border-2 border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${playerTeam.color.bg}/50 border ${playerTeam.color.border}`}></div>
                <span className={playerTeam.color.text}>{playerTeam.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${opponentTeam.color.bg}/50 border ${opponentTeam.color.border}`}></div>
                <span className={opponentTeam.color.text}>{opponentTeam.name}</span>
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
    const playerTeam = selectedTeam === "red" ? redTeam : blueTeam;
    const opponentTeam = selectedTeam === "red" ? blueTeam : redTeam;
    const redOperatives = players.filter(p => p.team === "red" && p.role === "operative");
    const blueOperatives = players.filter(p => p.team === "blue" && p.role === "operative");
    const redSpymasters = players.filter(p => p.team === "red" && p.role === "spymaster");
    const blueSpymasters = players.filter(p => p.team === "blue" && p.role === "spymaster");

    return (
      <div className="min-h-screen p-2 md:p-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar - Teams and Game Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
            {/* Blue Team Panel */}
            <div className={`${blueTeam.color.light} rounded-xl p-3 md:p-4 border-2 ${blueTeam.color.border} ${currentTeam === "blue" ? blueTeam.color.glow : "opacity-80"}`}>
              <div className="text-xs text-gray-400 mb-2 font-semibold">OPERATIVES</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {blueOperatives.length > 0 ? blueOperatives.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-bold border-2 ${blueTeam.color.border}`}>
                        {avatar.initials}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[50px]">{p.name}</div>
                    </div>
                  );
                }) : (
                  <div className="text-xs text-gray-500">No operatives</div>
                )}
              </div>
              <div className="text-center mb-2">
                <div className={`text-3xl md:text-4xl font-bold pixel-font ${blueTeam.color.text}`}>{blueTeam.cardsRemaining}</div>
                <div className="text-[10px] text-gray-400">CARDS LEFT</div>
              </div>
              <div className="text-xs text-gray-400 mb-1 font-semibold">SPYMASTERS</div>
              <div className="flex flex-wrap gap-2">
                {blueSpymasters.length > 0 ? blueSpymasters.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-[10px] font-bold border-2 ${blueTeam.color.border}`}>
                      {avatar.initials}
                    </div>
                  );
                }) : (
                  <div className="text-[10px] text-gray-500">No spymasters</div>
                )}
              </div>
            </div>

            {/* Game Log */}
            <div className="bg-black/40 rounded-xl p-3 md:p-4 border-2 border-gray-700">
              <div className="text-xs text-gray-400 mb-2 font-semibold">GAME LOG</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {gameLog.slice(-5).reverse().map((entry, i) => (
                  <div key={i} className="text-[10px] md:text-xs">
                    {entry.type === "clue" && (
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${entry.team === "red" ? "text-red-400" : "text-blue-400"}`}>
                          {entry.clue} {entry.number}
                        </span>
                        {guessesRemaining > 0 && entry.team === currentTeam && (
                          <span className="text-cyan-400 text-xs">∞</span>
                        )}
                      </div>
                    )}
                    {entry.type === "guess" && (
                      <div className="flex items-center gap-1">
                        {entry.word && (
                          <>
                            <div className={`w-4 h-4 rounded-full ${getPlayerAvatar(entry.player || "").color} flex items-center justify-center text-[8px] text-white`}>
                              {getPlayerAvatar(entry.player || "").initials[0]}
                            </div>
                            <span className="text-gray-300">{entry.word}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Red Team Panel */}
            <div className={`${redTeam.color.light} rounded-xl p-3 md:p-4 border-2 ${redTeam.color.border} ${currentTeam === "red" ? redTeam.color.glow : "opacity-80"}`}>
              <div className="text-xs text-gray-400 mb-2 font-semibold">OPERATIVES</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {redOperatives.length > 0 ? redOperatives.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-bold border-2 ${redTeam.color.border}`}>
                        {avatar.initials}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[50px]">{p.name}</div>
                    </div>
                  );
                }) : (
                  <div className="text-xs text-gray-500">No operatives</div>
                )}
              </div>
              <div className="text-center mb-2">
                <div className={`text-3xl md:text-4xl font-bold pixel-font ${redTeam.color.text}`}>{redTeam.cardsRemaining}</div>
                <div className="text-[10px] text-gray-400">CARDS LEFT</div>
              </div>
              <div className="text-xs text-gray-400 mb-1 font-semibold">SPYMASTERS</div>
              <div className="flex flex-wrap gap-2">
                {redSpymasters.length > 0 ? redSpymasters.map((p, i) => {
                  const avatar = getPlayerAvatar(p.name);
                  return (
                    <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-[10px] font-bold border-2 ${redTeam.color.border}`}>
                      {avatar.initials}
                    </div>
                  );
                }) : (
                  <div className="text-[10px] text-gray-500">No spymasters</div>
                )}
              </div>
            </div>
          </div>

          {/* Current Turn Banner */}
          <div className={`${activeTeam.color.light} rounded-xl p-3 md:p-4 mb-4 border-2 ${activeTeam.color.border} ${activeTeam.color.glow} text-center`}>
            <div className="text-sm md:text-base font-bold text-gray-300">
              {activeTeam.name.toUpperCase()} OPERATIVES {selectedTeam === currentTeam && guessesRemaining > 0 ? "ARE GUESSING" : "TURN"}
            </div>
            {selectedTeam === currentTeam && guessesRemaining > 0 && (
              <div className="mt-2">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 pixel-font">
                  {clue.word} {clue.number}
                </div>
                <div className="text-xs text-gray-400 mt-1">{guessesRemaining} guesses remaining</div>
              </div>
            )}
          </div>

          {/* Board - Operatives only see words */}
          <div className="bg-black/30 rounded-xl p-3 md:p-5 border-2 border-gray-700 mb-4">
            <div className="grid grid-cols-5 gap-3 md:gap-4 lg:gap-5">
              {cards.map((card, idx) => {
                const isRevealed = card.revealed;
                const canClick = selectedTeam === currentTeam && guessesRemaining > 0 && !isRevealed;
                
                const getCardStyle = () => {
                  if (isRevealed) {
                    if (card.type === "red") return "bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white cursor-default shadow-xl shadow-red-500/60 border-2 border-red-300";
                    if (card.type === "blue") return "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white cursor-default shadow-xl shadow-blue-500/60 border-2 border-blue-300";
                    if (card.type === "assassin") return "bg-gradient-to-br from-black via-gray-900 to-black text-white border-4 border-red-400 cursor-default shadow-xl shadow-red-500/80";
                    return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 text-black cursor-default shadow-xl shadow-yellow-500/60 border-2 border-yellow-300";
                  }
                  if (canClick) {
                    return "bg-gradient-to-br from-amber-800/80 to-amber-900/80 text-amber-100 border-2 border-amber-600 hover:border-cyan-300 hover:text-cyan-200 hover:shadow-xl hover:shadow-cyan-500/60 cursor-pointer active:scale-95";
                  }
                  return "bg-gradient-to-br from-amber-800/40 to-amber-900/40 text-amber-200/60 border-2 border-amber-700/50 cursor-not-allowed opacity-60";
                };
                
                // Asian pattern SVG
                const asianPattern = `data:image/svg+xml,${encodeURIComponent(`
                  <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="asianOp${idx}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/>
                        <path d="M5,5 L15,15 M15,5 L5,15" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
                        <rect x="8" y="8" width="4" height="4" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#asianOp${idx})"/>
                  </svg>
                `)}`;
                
                const clickedByAvatar = card.clickedBy ? getPlayerAvatar(card.clickedBy) : null;
                
                return (
                  <button
                    key={idx}
                    onClick={() => revealCard(idx)}
                    disabled={!canClick}
                    className={`relative p-3 md:p-5 lg:p-6 rounded-xl font-bold text-xs md:text-sm lg:text-base text-center transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${getCardStyle()}`}
                    style={{
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {/* Player avatar on tile */}
                    {card.clickedBy && (
                      <div className="absolute top-1 left-1 z-20">
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${clickedByAvatar?.color} flex items-center justify-center text-white text-[8px] md:text-[10px] font-bold border border-white/50`}>
                          {clickedByAvatar?.initials[0]}
                        </div>
                      </div>
                    )}
                    
                    {/* Asian pattern overlay */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-30"
                      style={{
                        backgroundImage: `url("${asianPattern}")`,
                        backgroundSize: '40px 40px',
                        backgroundRepeat: 'repeat',
                      }}
                    ></div>
                    {/* Additional decorative border pattern */}
                    <div className="absolute inset-0 rounded-xl" style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                      backgroundSize: '20px 20px',
                    }}></div>
                    <div className="relative z-10 w-full font-semibold">
                      {card.word}
                      {isRevealed && card.type === "assassin" && (
                        <div className="text-sm mt-1 opacity-80">💀</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Controls */}
          {selectedTeam === currentTeam && guessesRemaining > 0 && (
            <div className="flex gap-3">
              <button
                onClick={passTurn}
                className="flex-1 py-3 bg-yellow-900/50 border-2 border-yellow-500 text-yellow-400 rounded-xl font-bold hover:neon-box-yellow transition-all text-sm md:text-base"
              >
                PASS TURN
              </button>
            </div>
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

