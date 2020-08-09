'use strict';

// See user/jobs-example.js for documentation.
let Options = {
  WellFedContentTypes: [
    ContentType.Trials,
    ContentType.Raids,
    ContentType.UltimateRaids,
  ],

  ShowHPNumber: [],
  ShowMPNumber: [],

  ShowMPTicker: ['BLM'],

  MaxLevel: 80,

  PerBuffOptions: {
    // This is noisy since it's more or less permanently on you.
    // Players are unlikely to make different decisions based on this.
    standardFinish: {
      hide: true,
    },
  },

  FarThresholdOffence: 24,
  DrkLowMPThreshold: 2999,
  DrkMediumMPThreshold: 5999,
  PldLowMPThreshold: 3600,
  PldMediumMPThreshold: 9400,
  // One more fire IV and then despair.
  BlmMediumMPThreshold: 3999,
  // Should cast despair.
  BlmLowMPThreshold: 2399,
};

const kAbility = {
  DragonKick: '4A',
  TwinSnakes: '3D',
  Demolish: '42',
  Verstone: '1D57',
  Verfire: '1D56',
  Veraero: '1D53',
  Verthunder: '1D51',
  Verholy: '1D66',
  Verflare: '1D65',
  Jolt2: '1D64',
  Jolt: '1D4F',
  Impact: '1D62',
  Scatter: '1D55',
  Vercure: '1D5A',
  Verraise: '1D63',
  Riposte: '1D50',
  Zwerchhau: '1D58',
  Redoublement: '1D5C',
  Moulinet: '1D59',
  EnchantedRiposte: '1D67',
  EnchantedZwerchhau: '1D68',
  EnchantedRedoublement: '1D69',
  EnchantedMoulinet: '1D6A',
  Tomahawk: '2E',
  Overpower: '29',
  HeavySwing: '1F',
  SkullSunder: '23',
  ButchersBlock: '2F',
  Maim: '25',
  StormsEye: '2D',
  StormsPath: '2A',
  TrickAttack: '8D2',
  Embolden: '1D60',
  Aetherflow: 'A6',
  ChainStratagem: '1D0C',
  Hypercharge: 'B45',
  Adloquium: 'B9',
  RabbitMedium: '8E0',
  OneIlmPunch: '48',
  Bootshine: '35',
  FastBlade: '09',
  RiotBlade: '0F',
  GoringBlade: 'DD2',
  RoyalAuthority: 'DD3',
  RageOfHalone: '15',
  SavageBlade: '0B',
  ShieldLob: '18',
  Requiescat: '1CD7',
  HolySpirit: '1CD8',
  TotalEclipse: '1CD5',
  Clemency: 'DD5',
  ShieldBash: '10',
  ShieldSwipe: '19',
  FightOrFlight: '14',
  BloodWeapon: 'E29',
  Souleater: 'E30',
  SyphonStrike: 'E27',
  HardSlash: 'E21',
  CarveAndSpit: 'E3B',
  Plunge: 'E38',
  Unmend: 'E28',
  AbyssalDrain: 'E39',
  PowerSlash: 'E2B',
  SpinningSlash: 'E23',
  BloodPrice: 'E2F',
  TheBlackestNight: '1CE1',
  Delirium: '1CDE',
  Combust2: 'E18',
  Combust3: '40AA',
  AspectedBenefic: 'E0B',
  AspectedHelios: 'E11',
  Bio: '45C8',
  Bio2: '45C9',
  Biolysis: '409C',
  Contagion: '31B',
  OffGuard: '2C93',
  SongOfTorment: '2C7A',
  PeculiarLight: '2C9D',
  MythrilTempest: '404E',
  Prominence: '4049',
  HolyCircle: '404A',
  Confiteor: '404B',
  FourPointFury: '4059',
  TechnicalFinish: '3F44',
  Thunder1: '90',
  Thunder2: '94',
  Thunder3: '99',
  Thunder4: '1CFC',
  Divination: '40A8',
  LucidDreaming: '1D8A',
};

const kMeleeWithMpJobs = [];

const kMPNormalRate = 0.06;
const kMPCombatRate = 0.02;
const kMPUI1Rate = 0.30;
const kMPUI2Rate = 0.45;
const kMPUI3Rate = 0.60;
const kMPTickInterval = 3.0;

// Regexes to be filled out once we know the player's name.
let kComboBreakers = null;

let kYouGainEffectRegex = null;
let kYouLoseEffectRegex = null;
let kYouUseAbilityRegex = null;
let kAnybodyAbilityRegex = null;
let kMobGainsEffectRegex = null;
let kMobLosesEffectRegex = null;

let kStatsRegex = Regexes.statChange();
// [level][Sub][Div]
// Source: http://theoryjerks.akhmorning.com/resources/levelmods/
const kLevelMod = [[0, 0],
  [56, 56], [57, 57], [60, 60], [62, 62], [65, 65],
  [68, 68], [70, 70], [73, 73], [76, 76], [78, 78],
  [82, 82], [85, 85], [89, 89], [93, 93], [96, 96],
  [100, 100], [104, 104], [109, 109], [113, 113], [116, 116],
  [122, 122], [127, 127], [133, 133], [138, 138], [144, 144],
  [150, 150], [155, 155], [162, 162], [168, 168], [173, 173],
  [181, 181], [188, 188], [194, 194], [202, 202], [209, 209],
  [215, 215], [223, 223], [229, 229], [236, 236], [244, 244],
  [253, 253], [263, 263], [272, 272], [283, 283], [292, 292],
  [302, 302], [311, 311], [322, 322], [331, 331], [341, 341],
  [342, 393], [344, 444], [345, 496], [346, 548], [347, 600],
  [349, 651], [350, 703], [351, 755], [352, 806], [354, 858],
  [355, 941], [356, 1032], [357, 1133], [358, 1243], [369, 1364],
  [360, 1497], [361, 1643], [362, 1802], [363, 1978], [364, 2170],
  [365, 2263], [366, 2360], [367, 2461], [368, 2566], [370, 2676],
  [372, 2790], [374, 2910], [376, 3034], [378, 3164], [380, 3300]];


class ComboTracker {
  constructor(comboBreakers, callback) {
    this.comboTimer = null;
    this.comboBreakers = comboBreakers;
    this.comboNodes = {}; // { key => { re: string, next: [node keys], last: bool } }
    this.startList = [];
    this.callback = callback;
    this.current = null;
    this.considerNext = this.startList;
  }

  AddCombo(skillList) {
    if (this.startList.indexOf(skillList[0]) == -1)
      this.startList.push(skillList[0]);

    for (let i = 0; i < skillList.length; ++i) {
      let node = this.comboNodes[skillList[i]];
      if (node == undefined) {
        node = {
          id: skillList[i],
          next: [],
        };
        this.comboNodes[skillList[i]] = node;
      }
      if (i != skillList.length - 1)
        node.next.push(skillList[i + 1]);
      else
        node.last = true;
    }
  }

  HandleAbility(id) {
    for (let i = 0; i < this.considerNext.length; ++i) {
      let next = this.considerNext[i];
      if (this.comboNodes[next].id == id) {
        this.StateTransition(next);
        return true;
      }
    }
    if (this.comboBreakers.indexOf(id) >= 0) {
      this.AbortCombo();
      return true;
    }
    return false;
  }

  StateTransition(nextState) {
    if (this.current == null && nextState == null)
      return;

    window.clearTimeout(this.comboTimer);
    this.comboTimer = null;
    this.current = nextState;

    if (nextState == null) {
      this.considerNext = this.startList;
    } else {
      this.considerNext = [];
      Array.prototype.push.apply(this.considerNext, this.comboNodes[nextState].next);
      Array.prototype.push.apply(this.considerNext, this.startList);

      if (!this.comboNodes[nextState].last) {
        let kComboDelayMs = 15000;
        this.comboTimer = window.setTimeout(this.AbortCombo.bind(this), kComboDelayMs);
      }
    }
    this.callback(nextState);
  }

  AbortCombo() {
    this.StateTransition(null);
  }
}

function setupComboTracker(callback) {
  let comboTracker = new ComboTracker(kComboBreakers, callback);
  comboTracker.AddCombo([
    kAbility.EnchantedRiposte,
    kAbility.EnchantedZwerchhau,
    kAbility.EnchantedRedoublement,
    kAbility.Verflare,
  ]);
  comboTracker.AddCombo([
    kAbility.EnchantedRiposte,
    kAbility.EnchantedZwerchhau,
    kAbility.EnchantedRedoublement,
    kAbility.Verholy,
  ]);
  comboTracker.AddCombo([
    kAbility.HeavySwing,
    kAbility.SkullSunder,
    kAbility.ButchersBlock,
  ]);
  comboTracker.AddCombo([
    kAbility.HeavySwing,
    kAbility.Maim,
    kAbility.StormsEye,
  ]);
  comboTracker.AddCombo([
    kAbility.HeavySwing,
    kAbility.Maim,
    kAbility.StormsPath,
  ]);
  comboTracker.AddCombo([
    kAbility.Overpower,
    kAbility.MythrilTempest,
  ]);
  comboTracker.AddCombo([
    kAbility.FastBlade,
    kAbility.SavageBlade,
    kAbility.RageofHalone,
  ]);
  comboTracker.AddCombo([
    kAbility.FastBlade,
    kAbility.RiotBlade,
    kAbility.RoyalAuthority,
  ]);
  comboTracker.AddCombo([
    kAbility.FastBlade,
    kAbility.RiotBlade,
    kAbility.FightOrFlight,
    kAbility.GoringBlade,
  ]);
  comboTracker.AddCombo([
    kAbility.FastBlade,
    kAbility.FightOrFlight,
    kAbility.RiotBlade,
    kAbility.GoringBlade,
  ]);
  comboTracker.AddCombo([
    kAbility.FightOrFlight,
    kAbility.FastBlade,
    kAbility.RiotBlade,
    kAbility.GoringBlade,
  ]);
  return comboTracker;
}

function setupRegexes(playerName) {
  kYouGainEffectRegex = NetRegexes.gainsEffect({ target: playerName });
  kYouLoseEffectRegex = NetRegexes.losesEffect({ target: playerName });
  kYouUseAbilityRegex = NetRegexes.ability({ source: playerName });
  kAnybodyAbilityRegex = NetRegexes.ability();
  kMobGainsEffectRegex = NetRegexes.gainsEffect({ targetId: '4.{7}' });
  kMobLosesEffectRegex = NetRegexes.losesEffect({ targetId: '4.{7}' });

  // Full skill names of abilities that break combos.
  // TODO: it's sad to have to duplicate combo abilities here to catch out-of-order usage.
  kComboBreakers = Object.freeze([
    // rdm
    kAbility.Verstone,
    kAbility.Verfire,
    kAbility.Veraero,
    kAbility.Verthunder,
    kAbility.Verholy,
    kAbility.Verflare,
    kAbility.Jolt2,
    kAbility.Jolt,
    kAbility.Impact,
    kAbility.Scatter,
    kAbility.Vercure,
    kAbility.Verraise,
    kAbility.Riposte,
    kAbility.Zwerchhau,
    kAbility.Redoublement,
    kAbility.Moulinet,
    kAbility.EnchantedRiposte,
    kAbility.EnchantedZwerchhau,
    kAbility.EnchantedRedoublement,
    kAbility.EnchantedMoulinet,
    // war
    kAbility.Tomahawk,
    kAbility.Overpower,
    kAbility.SkullSunder,
    kAbility.ButchersBlock,
    kAbility.Maim,
    kAbility.StormsEye,
    kAbility.StormsPath,
    kAbility.MythrilTempest,
    // pld
    kAbility.ShieldLob,
    kAbility.TotalEclipse,
    kAbility.SavageBlade,
    kAbility.RageofHalone,
    kAbility.RiotBlade,
    kAbility.RoyalAuthority,
    kAbility.GoringBlade,
    kAbility.Prominence,
    kAbility.HolySpirit,
    kAbility.HolyCircle,
    kAbility.Confiteor,
  ]);
}

function doesJobNeedMPBar(job) {
  return Util.isCasterJob(job) || kMeleeWithMpJobs.indexOf(job) >= 0;
}

function computeBackgroundColorFrom(element, classList) {
  let div = document.createElement('div');
  let classes = classList.split('.');
  for (let i = 0; i < classes.length; ++i)
    div.classList.add(classes[i]);
  element.appendChild(div);
  let color = window.getComputedStyle(div).backgroundColor;
  element.removeChild(div);
  return color;
}

function makeAuraTimerIcon(name, seconds, opacity, iconWidth, iconHeight, iconText,
    barHeight, textHeight, textColor, borderSize, borderColor, barColor, auraIcon) {
  let div = document.createElement('div');
  div.style.opacity = opacity;

  let icon = document.createElement('timer-icon');
  icon.width = iconWidth;
  icon.height = iconHeight;
  icon.bordersize = borderSize;
  icon.textcolor = textColor;
  div.appendChild(icon);

  let barDiv = document.createElement('div');
  barDiv.style.position = 'relative';
  barDiv.style.top = iconHeight;
  div.appendChild(barDiv);

  if (seconds >= 0) {
    let bar = document.createElement('timer-bar');
    bar.width = iconWidth;
    bar.height = barHeight;
    bar.fg = barColor;
    bar.duration = seconds;
    barDiv.appendChild(bar);
  }

  if (textHeight > 0) {
    let text = document.createElement('div');
    text.classList.add('text');
    text.style.width = iconWidth;
    text.style.height = textHeight;
    text.style.overflow = 'hidden';
    text.style.fontSize = textHeight - 1;
    text.style.whiteSpace = 'pre';
    text.style.position = 'relative';
    text.style.top = iconHeight;
    text.style.fontFamily = 'arial';
    text.style.fontWeight = 'bold';
    text.style.color = textColor;
    text.style.textShadow = '-1px 0 3px black, 0 1px 3px black, 1px 0 3px black, 0 -1px 3px black';
    text.style.paddingBottom = textHeight / 4;

    text.innerText = name;
    div.appendChild(text);
  }

  if (iconText)
    icon.text = iconText;
  icon.bordercolor = borderColor;
  icon.icon = auraIcon;
  icon.duration = seconds;

  return div;
}

// TODO: consider using real times and not setTimeout times as these can drift.
class Buff {
  constructor(name, info, list, options) {
    this.name = name;
    this.info = info;
    this.options = options;

    // TODO: these should be different ui elements.
    // TODO: or maybe add some buffer between sections?
    this.activeList = list;
    this.cooldownList = list;
    this.readyList = list;

    // tracked auras
    this.active = null;
    this.cooldown = {};
    this.ready = {};

    // Hacky numbers to sort active > ready > cooldowns by adjusting sort keys.
    this.readySortKeyBase = 1000;
    this.cooldownSortKeyBase = 2000;
  }

  addCooldown(source, effectSeconds) {
    if (!this.info.cooldown)
      return;
    if (this.cooldown[source]) {
      // Unexpected use of the same cooldown by the same name.
      this.cooldown[source].removeCallback();
    }

    let cooldownKey = 'c:' + this.name + ':' + source;

    let secondsUntilShow = this.info.cooldown - this.options.BigBuffShowCooldownSeconds;
    secondsUntilShow = Math.min(Math.max(effectSeconds, secondsUntilShow), this.info.cooldown);
    let showSeconds = this.info.cooldown - secondsUntilShow;
    let addReadyCallback = () => {
      this.addReady(source);
    };

    this.cooldown[source] = this.makeAura(cooldownKey, this.cooldownList, showSeconds,
        secondsUntilShow, this.cooldownSortKeyBase, 'grey', '', 0.5, addReadyCallback);
  }

  addReady(source) {
    if (this.ready[source]) {
      // Unexpected use of the same cooldown by the same name.
      this.ready[source].removeCallback();
    }

    // TODO: could consider looking at the party list to make initials unique?
    let txt = '';
    let initials = source.split(' ');
    if (initials.length == 2)
      txt = initials[0][0] + initials[1][0];
    else
      txt = initials[0].slice(0, 3);

    let color = this.info.borderColor;

    let readyKey = 'r:' + this.name + ':' + source;
    this.ready[source] = this.makeAura(readyKey, this.readyList, -1, 0,
        this.readySortKeyBase, color, txt, 0.6);
  }

  makeAura(key, list, seconds, secondsUntilShow,
      adjustSort, textColor, txt, opacity, expireCallback) {
    let aura = {};
    aura.removeCallback = () => {
      list.removeElement(key);
      if (aura.addTimeout) {
        window.clearTimeout(aura.addTimeout);
        aura.addTimeout = null;
      }
      if (aura.removeTimeout) {
        window.clearTimeout(aura.removeTimeout);
        aura.removeTimeout = null;
      }
    };
    aura.addCallback = () => {
      let elem = makeAuraTimerIcon(
          key, seconds, opacity,
          this.options.BigBuffIconWidth, this.options.BigBuffIconHeight,
          txt,
          this.options.BigBuffBarHeight, this.options.BigBuffTextHeight,
          textColor,
          this.options.BigBuffBorderSize,
          this.info.borderColor, this.info.borderColor,
          this.info.icon);
      list.addElement(key, elem, this.info.sortKey + adjustSort);
      aura.addTimeout = null;

      if (seconds > 0) {
        aura.removeTimeout = window.setTimeout(() => {
          aura.removeCallback();
          if (expireCallback)
            expireCallback();
        }, seconds * 1000);
      }
    };
    aura.removeTimeout = null;

    if (secondsUntilShow > 0)
      aura.addTimeout = window.setTimeout(aura.addCallback, secondsUntilShow * 1000);
    else
      aura.addCallback();


    return aura;
  }

  clear() {
    this.onLose();

    let cooldownKeys = Object.keys(this.cooldown);
    for (let i = 0; i < cooldownKeys.length; ++i)
      this.cooldown[cooldownKeys[i]].removeCallback();

    let readyKeys = Object.keys(this.ready);
    for (let i = 0; i < readyKeys.length; ++i)
      this.ready[readyKeys[i]].removeCallback();
  }

  clearCooldown(source) {
    let ready = this.ready[source];
    if (ready)
      ready.removeCallback();
    let cooldown = this.cooldown[source];
    if (cooldown)
      cooldown.removeCallback();
  }

  onGain(seconds, source) {
    this.onLose();
    this.clearCooldown(source);
    this.active = this.makeAura(this.name, this.activeList, seconds, 0, 0, 'white', '', 1);
    this.addCooldown(source, seconds);
  }

  onLose() {
    if (!this.active)
      return;
    this.active.removeCallback();
    this.active = null;
  }
}

class BuffTracker {
  constructor(options, playerName, leftBuffDiv, rightBuffDiv) {
    this.options = options;
    this.playerName = playerName;
    this.leftBuffDiv = leftBuffDiv;
    this.rightBuffDiv = rightBuffDiv;
    this.buffs = {};

    this.buffInfo = {
      potion: {
        gainEffect: EffectId.Medicated,
        loseEffect: EffectId.Medicated,
        useEffectDuration: true,
        icon: '../../resources/icon/status/potion.png',
        borderColor: '#AA41B2',
        sortKey: 0,
        cooldown: 270,
      },
      astralAttenuationWind: {
        mobGainsEffect: EffectId.AstralAttenuation,
        mobLosesEffect: EffectId.AstralAttenuation,
        useEffectDuration: true,
        icon: '../../resources/icon/status/wind.png',
        borderColor: '#9bdec0',
        sortKey: 0,
      },
      astralAttenuationLightning: {
        mobGainsEffect: EffectId.AstralAttenuation,
        mobLosesEffect: EffectId.AstralAttenuation,
        useEffectDuration: true,
        icon: '../../resources/icon/status/lightning.png',
        borderColor: '#e0cb5c',
        sortKey: 0,
      },
      umbralAttenuationEarth: {
        mobGainsEffect: EffectId.UmbralAttenuation,
        mobLosesEffect: EffectId.UmbralAttenuation,
        useEffectDuration: true,
        icon: '../../resources/icon/status/earth.png',
        borderColor: '#96855a',
        sortKey: 0,
      },
      umbralAttenuationWater: {
        mobGainsEffect: EffectId.UmbralAttenuation,
        mobLosesEffect: EffectId.UmbralAttenuation,
        useEffectDuration: true,
        icon: '../../resources/icon/status/water.png',
        borderColor: '#4d8bc9',
        sortKey: 0,
      },
      physicalAttenuation: {
        mobGainsEffect: EffectId.PhysicalAttenuation,
        mobLosesEffect: EffectId.PhysicalAttenuation,
        useEffectDuration: true,
        icon: '../../resources/icon/status/physical.png',
        borderColor: '#fff712',
        sortKey: 0,
      },
      offguard: {
        gainAbility: kAbility.OffGuard,
        durationSeconds: 15,
        icon: '../../resources/icon/status/offguard.png',
        borderColor: '#47bf41',
        sortKey: 1,
        cooldown: 60,
        sharesCooldownWith: ['peculiar'],
      },
      peculiar: {
        gainAbility: kAbility.PeculiarLight,
        durationSeconds: 15,
        icon: '../../resources/icon/status/peculiar-light.png',
        borderColor: '#F28F7B',
        sortKey: 1,
        cooldown: 60,
        sharesCooldownWith: ['offguard'],
      },
      trick: {
        gainAbility: kAbility.TrickAttack,
        durationSeconds: 15,
        icon: '../../resources/icon/status/trick-attack.png',
        // Magenta.
        borderColor: '#FC4AE6',
        sortKey: 1,
        cooldown: 60,
      },
      litany: {
        gainEffect: EffectId.BattleLitany,
        loseEffect: EffectId.BattleLitany,
        useEffectDuration: true,
        icon: '../../resources/icon/status/battle-litany.png',
        // Cyan.
        borderColor: '#099',
        sortKey: 2,
        cooldown: 180,
      },
      embolden: {
        // Embolden is special and has some extra text at the end, depending on embolden stage:
        // Potato Chippy gains the effect of Embolden from Tater Tot for 20.00 Seconds. (5)
        // Instead, use somebody using the effect on you:
        //   16:106C22EF:Tater Tot:1D60:Embolden:106C22EF:Potato Chippy:500020F:4D7: etc etc
        gainAbility: kAbility.Embolden,
        loseEffect: EffectId.Embolden,
        durationSeconds: 20,
        icon: '../../resources/icon/status/embolden.png',
        // Lime.
        borderColor: '#57FC4A',
        sortKey: 3,
        cooldown: 120,
      },
      arrow: {
        gainEffect: EffectId.TheArrow,
        loseEffect: EffectId.TheArrow,
        useEffectDuration: true,
        icon: '../../resources/icon/status/arrow.png',
        // Light Blue.
        borderColor: '#37ccee',
        sortKey: 4,
      },
      balance: {
        gainEffect: EffectId.TheBalance,
        loseEffect: EffectId.TheBalance,
        useEffectDuration: true,
        icon: '../../resources/icon/status/balance.png',
        // Orange.
        borderColor: '#ff9900',
        sortKey: 4,
      },
      bole: {
        gainEffect: EffectId.TheBole,
        loseEffect: EffectId.TheBole,
        useEffectDuration: true,
        icon: '../../resources/icon/status/bole.png',
        // Green.
        borderColor: '#22dd77',
        sortKey: 4,
      },
      ewer: {
        gainEffect: EffectId.TheEwer,
        loseEffect: EffectId.TheEwer,
        useEffectDuration: true,
        icon: '../../resources/icon/status/ewer.png',
        // Light Blue.
        borderColor: '#66ccdd',
        sortKey: 4,
      },
      spear: {
        gainEffect: EffectId.TheSpear,
        loseEffect: EffectId.TheSpear,
        useEffectDuration: true,
        icon: '../../resources/icon/status/spear.png',
        // Dark Blue.
        borderColor: '#4477dd',
        sortKey: 4,
      },
      spire: {
        gainEffect: EffectId.TheSpire,
        loseEffect: EffectId.TheSpire,
        useEffectDuration: true,
        icon: '../../resources/icon/status/spire.png',
        // Yellow.
        borderColor: '#ddd044',
        sortKey: 4,
      },
      ladyOfCrowns: {
        gainEffect: EffectId.LadyOfCrowns,
        loseEffect: EffectId.LadyOfCrowns,
        useEffectDuration: true,
        icon: '../../resources/icon/status/lady-of-crowns.png',
        // Purple.
        borderColor: '#9e5599',
        sortKey: 4,
      },
      lordOfCrowns: {
        gainEffect: EffectId.LordOfCrowns,
        loseEffect: EffectId.LordOfCrowns,
        useEffectDuration: true,
        icon: '../../resources/icon/status/lord-of-crowns.png',
        // Dark Red.
        borderColor: '#9a2222',
        sortKey: 4,
      },
      devilment: {
        gainEffect: EffectId.Devilment,
        loseEffect: EffectId.Devilment,
        durationSeconds: 20,
        icon: '../../resources/icon/status/devilment.png',
        // Dark Green.
        borderColor: '#006400',
        sortKey: 5,
        cooldown: 120,
      },
      standardFinish: {
        gainEffect: EffectId.StandardFinish,
        loseEffect: EffectId.StandardFinish,
        durationSeconds: 60,
        icon: '../../resources/icon/status/standard-finish.png',
        // Green.
        borderColor: '#32CD32',
        sortKey: 6,
      },
      technicalFinish: {
        gainEffect: EffectId.TechnicalFinish,
        loseEffect: EffectId.TechnicalFinish,
        durationSeconds: 20,
        icon: '../../resources/icon/status/technical-finish.png',
        // Dark Peach.
        borderColor: '#E0757C',
        sortKey: 6,
        cooldown: 120,
      },
      battlevoice: {
        gainEffect: EffectId.BattleVoice,
        loseEffect: EffectId.BattleVoice,
        useEffectDuration: true,
        icon: '../../resources/icon/status/battlevoice.png',
        // Red.
        borderColor: '#D6371E',
        sortKey: 7,
        cooldown: 180,
      },
      chain: {
        gainAbility: kAbility.ChainStratagem,
        durationSeconds: 15,
        icon: '../../resources/icon/status/chain-stratagem.png',
        // Blue.
        borderColor: '#4674E5',
        sortKey: 8,
        cooldown: 120,
      },
      lefteye: {
        gainEffect: EffectId.LeftEye,
        loseEffect: EffectId.LeftEye,
        useEffectDuration: true,
        icon: '../../resources/icon/status/dragon-sight.png',
        // Orange.
        borderColor: '#FA8737',
        sortKey: 9,
        cooldown: 120,
      },
      righteye: {
        gainEffect: EffectId.RightEye,
        loseEffect: EffectId.RightEye,
        useEffectDuration: true,
        icon: '../../resources/icon/status/dragon-sight.png',
        // Orange.
        borderColor: '#FA8737',
        sortKey: 10,
        cooldown: 120,
      },
      brotherhood: {
        gainEffect: EffectId.Brotherhood,
        loseEffect: EffectId.Brotherhood,
        useEffectDuration: true,
        icon: '../../resources/icon/status/brotherhood.png',
        // Dark Orange.
        borderColor: '#994200',
        sortKey: 11,
        cooldown: 90,
      },
      devotion: {
        gainEffect: EffectId.Devotion,
        loseEffect: EffectId.Devotion,
        useEffectDuration: true,
        icon: '../../resources/icon/status/devotion.png',
        // Yellow.
        borderColor: '#ffbf00',
        sortKey: 12,
        cooldown: 180,
      },
      divination: {
        gainEffect: EffectId.Divination,
        loseEffect: EffectId.Divination,
        useEffectDuration: true,
        icon: '../../resources/icon/status/divination.png',
        // Dark purple.
        borderColor: '#5C1F58',
        sortKey: 13,
        cooldown: 120,
      },
    };

    let keys = Object.keys(this.buffInfo);
    this.gainEffectMap = {};
    this.loseEffectMap = {};
    this.gainAbilityMap = {};
    this.mobGainsEffectMap = {};
    this.mobLosesEffectMap = {};

    let propToMapMap = {
      gainEffect: this.gainEffectMap,
      loseEffect: this.loseEffectMap,
      gainAbility: this.gainAbilityMap,
      mobGainsEffect: this.mobGainsEffectMap,
      mobLosesEffect: this.mobLosesEffectMap,
    };

    for (let i = 0; i < keys.length; ++i) {
      let buff = this.buffInfo[keys[i]];
      buff.name = keys[i];

      let overrides = this.options.PerBuffOptions[buff.name] || {};
      buff.borderColor = overrides.borderColor || buff.borderColor;
      buff.icon = overrides.icon || buff.icon;
      buff.side = overrides.side || buff.side || 'right';
      buff.sortKey = overrides.sortKey || buff.sortKey;
      buff.hide = overrides.hide === undefined ? buff.hide : overrides.hide;

      for (let prop in propToMapMap) {
        if (!(prop in buff))
          continue;
        let key = buff[prop];
        if (typeof key === 'undefined') {
          console.error('undefined value for key ' + prop + ' for buff ' + buff.name);
          continue;
        }

        let map = propToMapMap[prop];
        map[key] = map[key] || [];
        map[key].push(buff);
      }
    }

    const v520 = {
      // identical with latest patch
      /* example
      trick: {
        durationSeconds: 10,
      },
      */
    };

    let buffOverrides = {
      ko: v520,
      cn: v520,
    };

    for (let key in buffOverrides[this.options.ParserLanguage]) {
      for (let key2 in buffOverrides[this.options.ParserLanguage][key])
        this.buffInfo[key][key2] = buffOverrides[this.options.ParserLanguage][key][key2];
    }
  }

  onUseAbility(id, matches) {
    let buffs = this.gainAbilityMap[id];
    if (!buffs)
      return;

    for (let b of buffs)
      this.onBigBuff(b.name, b.durationSeconds, b, matches.source);
  }

  onGainEffect(buffs, matches) {
    if (!buffs)
      return;
    for (let b of buffs) {
      let seconds = -1;
      if (b.useEffectDuration)
        seconds = parseFloat(matches.duration);
      else if ('durationSeconds' in b)
        seconds = b.durationSeconds;

      this.onBigBuff(b.name, seconds, b, matches.source);
    }
  }

  onLoseEffect(buffs, matches) {
    if (!buffs)
      return;
    for (let b of buffs)
      this.onLoseBigBuff(b.name, b);
  }

  onYouGainEffect(name, matches) {
    this.onGainEffect(this.gainEffectMap[name], matches);
  }

  onYouLoseEffect(name, matches) {
    this.onLoseEffect(this.loseEffectMap[name], matches);
  }

  onMobGainsEffect(name, matches) {
    this.onGainEffect(this.mobGainsEffectMap[name], matches);
  }

  onMobLosesEffect(name, matches) {
    this.onLoseEffect(this.mobLosesEffectMap[name], matches);
  }

  onBigBuff(name, seconds, info, source) {
    if (seconds <= 0)
      return;

    let list = this.rightBuffDiv;
    if (info.side == 'left' && this.leftBuffDiv)
      list = this.leftBuffDiv;

    let buff = this.buffs[name];
    if (!buff) {
      this.buffs[name] = new Buff(name, info, list, this.options);
      buff = this.buffs[name];
    }

    let shareList = info.sharesCooldownWith || [];
    for (let share of shareList) {
      let existingBuff = this.buffs[share];
      if (existingBuff)
        existingBuff.clearCooldown(source);
    }

    buff.onGain(seconds, source);
  }

  onLoseBigBuff(name) {
    let buff = this.buffs[name];
    if (!buff)
      return;
    buff.onLose();
  }

  clear() {
    let keys = Object.keys(this.buffs);
    for (let i = 0; i < keys.length; ++i)
      this.buffs[keys[i]].clear();
  }
}

class Bars {
  constructor(options) {
    this.options = options;
    this.init = false;
    this.me = null;
    this.o = {};
    this.casting = {};
    this.job = '';
    this.hp = 0;
    this.maxHP = 0;
    this.currentShield = 0;
    this.mp = 0;
    this.prevMP = 0;
    this.maxMP = 0;
    this.level = 0;
    this.distance = -1;
    this.whiteMana = -1;
    this.blackMana = -1;
    this.oath = -1;
    this.umbralStacks = 0;
    this.inCombat = false;
    this.combo = 0;
    this.comboTimer = null;

    this.skillSpeed = 0;
    this.spellSpeed = 0;
    this.gcdSkill = () => this.CalcGCDFromStat(this.skillSpeed);
    this.gcdSpell = () => this.CalcGCDFromStat(this.spellSpeed);

    this.presenceOfMind = 0;
    this.shifu = 0;
    this.huton = 0;
    this.lightningStacks = 0;
    this.paeonStacks = 0;
    this.museStacks = 0;
    this.circleOfPower = 0;

    this.comboFuncs = [];
    this.jobFuncs = [];
    this.gainEffectFuncMap = {};
    this.loseEffectFuncMap = {};
    this.statChangeFuncMap = {};
    this.abilityFuncMap = {};

    this.contentType = 0;

    const lang = this.options.ParserLanguage;
    this.countdownStartRegex = LocaleRegex.countdownStart[lang] || LocaleRegex.countdownStart['en'];
    this.countdownCancelRegex = LocaleRegex.countdownCancel[lang] || LocaleRegex.countdownCancel['en'];
  }

  UpdateJob() {
    this.comboFuncs = [];
    this.jobFuncs = [];
    this.gainEffectFuncMap = {};
    this.loseEffectFuncMap = {};
    this.statChangeFuncMap = {};
    this.abilityFuncMap = {};

    this.gainEffectFuncMap[EffectId.WellFed] = (name, matches) => {
      let seconds = parseFloat(matches.duration);
      let now = Date.now(); // This is in ms.
      this.foodBuffExpiresTimeMs = now + (seconds * 1000);
      this.UpdateFoodBuff();
    };

    let container = document.getElementById('jobs-container');
    if (container == null) {
      let root = document.getElementById('container');
      container = document.createElement('div');
      container.id = 'jobs-container';
      root.appendChild(container);
    }
    while (container.childNodes.length)
      container.removeChild(container.childNodes[0]);

    this.o = {};

    let barsLayoutContainer = document.createElement('div');
    barsLayoutContainer.id = 'jobs';
    container.appendChild(barsLayoutContainer);

    barsLayoutContainer.classList.add(this.job.toLowerCase());
    if (Util.isTankJob(this.job))
      barsLayoutContainer.classList.add('tank');
    else if (Util.isHealerJob(this.job))
      barsLayoutContainer.classList.add('healer');
    else if (Util.isCombatJob(this.job))
      barsLayoutContainer.classList.add('dps');
    else if (Util.isCraftingJob(this.job))
      barsLayoutContainer.classList.add('crafting');
    else if (Util.isGatheringJob(this.job))
      barsLayoutContainer.classList.add('gathering');

    let opacityContainer = document.createElement('div');
    opacityContainer.id = 'opacity-container';
    barsLayoutContainer.appendChild(opacityContainer);

    // Holds health/mana.
    let barsContainer = document.createElement('div');
    barsContainer.id = 'bars';
    opacityContainer.appendChild(barsContainer);

    this.o.rightBuffsContainer = document.createElement('div');
    this.o.rightBuffsContainer.id = 'right-side-icons';

    this.o.rightBuffsList = document.createElement('widget-list');
    this.o.rightBuffsContainer.appendChild(this.o.rightBuffsList);

    this.o.rightBuffsList.rowcolsize = 7;
    this.o.rightBuffsList.maxnumber = 7;
    this.o.rightBuffsList.toward = 'right down';
    this.o.rightBuffsList.elementwidth = this.options.BigBuffIconWidth + 2;

    if (this.options.JustBuffTracker) {
      // Just alias these two together so the rest of the code doesn't have
      // to care that they're the same thing.
      this.o.leftBuffsList = this.o.rightBuffsList;
      this.o.rightBuffsList.rowcolsize = 20;
      this.o.rightBuffsList.maxnumber = 20;
      // Hoist the buffs up to hide everything else.
      barsLayoutContainer.appendChild(this.o.rightBuffsContainer);
      barsLayoutContainer.classList.add('justbuffs');
    } else {
      this.o.leftBuffsContainer = document.createElement('div');
      this.o.leftBuffsContainer.id = 'left-side-icons';
      barsContainer.appendChild(this.o.leftBuffsContainer);

      this.o.leftBuffsList = document.createElement('widget-list');
      this.o.leftBuffsContainer.appendChild(this.o.leftBuffsList);

      this.o.leftBuffsList.rowcolsize = 7;
      this.o.leftBuffsList.maxnumber = 7;
      this.o.leftBuffsList.toward = 'left down';
      this.o.leftBuffsList.elementwidth = this.options.BigBuffIconWidth + 2;
    }

    if (Util.isCraftingJob(this.job)) {
      this.o.cpContainer = document.createElement('div');
      this.o.cpContainer.id = 'cp-bar';
      barsContainer.appendChild(this.o.cpContainer);
      this.o.cpBar = document.createElement('resource-bar');
      this.o.cpContainer.appendChild(this.o.cpBar);
      this.o.cpBar.width = window.getComputedStyle(this.o.cpContainer).width;
      this.o.cpBar.height = window.getComputedStyle(this.o.cpContainer).height;
      this.o.cpBar.centertext = 'maxvalue';
      this.o.cpBar.bg = computeBackgroundColorFrom(this.o.cpBar, 'bar-border-color');
      this.o.cpBar.fg = computeBackgroundColorFrom(this.o.cpBar, 'cp-color');
      return;
    } else if (Util.isGatheringJob(this.job)) {
      this.o.gpContainer = document.createElement('div');
      this.o.gpContainer.id = 'gp-bar';
      barsContainer.appendChild(this.o.gpContainer);
      this.o.gpBar = document.createElement('resource-bar');
      this.o.gpContainer.appendChild(this.o.gpBar);
      this.o.gpBar.width = window.getComputedStyle(this.o.gpContainer).width;
      this.o.gpBar.height = window.getComputedStyle(this.o.gpContainer).height;
      this.o.gpBar.centertext = 'maxvalue';
      this.o.gpBar.bg = computeBackgroundColorFrom(this.o.gpBar, 'bar-border-color');
      this.o.gpBar.fg = computeBackgroundColorFrom(this.o.gpBar, 'gp-color');
      return;
    }

    let showHPNumber = this.options.ShowHPNumber.indexOf(this.job) >= 0;
    let showMPNumber = this.options.ShowMPNumber.indexOf(this.job) >= 0;
    let showMPTicker = this.options.ShowMPTicker.indexOf(this.job) >= 0;

    let healthText = showHPNumber ? 'value' : '';
    let manaText = showMPNumber ? 'value' : '';

    this.o.healthContainer = document.createElement('div');
    this.o.healthContainer.id = 'hp-bar';

    if (showMPTicker) {
      this.o.mpTickContainer = document.createElement('div');
      this.o.mpTickContainer.id = 'mp-tick';
      barsContainer.appendChild(this.o.mpTickContainer);

      this.o.mpTicker = document.createElement('timer-bar');
      this.o.mpTickContainer.appendChild(this.o.mpTicker);
      this.o.mpTicker.width = window.getComputedStyle(this.o.mpTickContainer).width;
      this.o.mpTicker.height = window.getComputedStyle(this.o.mpTickContainer).height;
      this.o.mpTicker.bg = computeBackgroundColorFrom(this.o.mpTicker, 'bar-border-color');
      this.o.mpTicker.style = 'fill';
      this.o.mpTicker.loop = true;
    }

    let setup = {
      'BLM': this.setupBlm,
    };
    if (setup[this.job])
      setup[this.job].bind(this)();

    this.validateKeys();

    // Many jobs use the gcd to calculate thresholds and value scaling.
    // Run this initially to set those values.
    this.UpdateJobBarGCDs();
  }

  validateKeys() {
    // Keys in JavaScript are converted to strings, so test string equality
    // here to verify that effects and abilities have been spelled correctly.
    for (const key in this.abilityFuncMap) {
      if (key === 'undefined')
        console.error('undefined key in abilityFuncMap');
    }
    for (const key in this.gainEffectFuncMap) {
      if (key === 'undefined')
        console.error('undefined key in gainEffectFuncMap');
    }
    for (const key in this.loseEffectFuncMap) {
      if (key === 'undefined')
        console.error('undefined key in loseEffectFuncMap');
    }
  }

  addJobBarContainer() {
    let id = this.job.toLowerCase() + '-bar';
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement('div');
      container.id = id;
      document.getElementById('bars').appendChild(container);
    }
    return container;
  }

  addJobBoxContainer() {
    let id = this.job.toLowerCase() + '-boxes';
    let boxes = document.getElementById(id);
    if (!boxes) {
      boxes = document.createElement('div');
      boxes.id = id;
      document.getElementById('bars').appendChild(boxes);
    }
    return boxes;
  }

  addResourceBox(options) {
    let boxes = this.addJobBoxContainer();
    let boxDiv = document.createElement('div');
    if (options.classList) {
      for (let i = 0; i < options.classList.length; ++i)
        boxDiv.classList.add(options.classList[i]);
    }
    boxes.appendChild(boxDiv);

    let textDiv = document.createElement('div');
    boxDiv.appendChild(textDiv);
    textDiv.classList.add('text');

    return textDiv;
  }

  addTimerBar(options) {
    let container = this.addJobBarContainer();

    let timerDiv = document.createElement('div');
    timerDiv.id = options.id;
    let timer = document.createElement('timer-bar');
    container.appendChild(timerDiv);
    timerDiv.appendChild(timer);

    timer.width = window.getComputedStyle(timerDiv).width;
    timer.height = window.getComputedStyle(timerDiv).height;
    timer.toward = 'left';
    timer.bg = computeBackgroundColorFrom(timer, 'bar-border-color');
    if (options.fgColor)
      timer.fg = computeBackgroundColorFrom(timer, options.fgColor);

    return timer;
  }

  addResourceBar(options) {
    let container = this.addJobBarContainer();

    let barDiv = document.createElement('div');
    barDiv.id = options.id;
    let bar = document.createElement('resource-bar');
    container.appendChild(barDiv);
    barDiv.appendChild(bar);

    bar.bg = 'rgba(0, 0, 0, 0)';
    bar.fg = computeBackgroundColorFrom(bar, options.fgColor);
    bar.width = window.getComputedStyle(barDiv).width;
    bar.height = window.getComputedStyle(barDiv).height;
    bar.maxvalue = options.maxvalue;

    return bar;
  }

  setupBlm() {
    this.gainEffectFuncMap[EffectId.CircleOfPower] = () => this.circleOfPower = 1;
    this.loseEffectFuncMap[EffectId.CircleOfPower] = () => this.circleOfPower = 0;

    // It'd be super nice to use grid here.
    // Maybe some day when cactbot uses new cef.
    let stacksContainer = document.createElement('div');
    stacksContainer.id = 'blm-stacks';
    this.addJobBarContainer().appendChild(stacksContainer);

    let heartStacksContainer = document.createElement('div');
    heartStacksContainer.id = 'blm-stacks-heart';
    stacksContainer.appendChild(heartStacksContainer);
    let heartStacks = [];
    for (let i = 0; i < 3; ++i) {
      let d = document.createElement('div');
      heartStacksContainer.appendChild(d);
      heartStacks.push(d);
    }

    let xenoStacksContainer = document.createElement('div');
    xenoStacksContainer.id = 'blm-stacks-xeno';
    stacksContainer.appendChild(xenoStacksContainer);
    let xenoStacks = [];
    for (let i = 0; i < 2; ++i) {
      let d = document.createElement('div');
      xenoStacksContainer.appendChild(d);
      xenoStacks.push(d);
    }

    this.jobFuncs.push((jobDetail) => {
      if (this.umbralStacks != jobDetail.umbralStacks) {
        this.umbralStacks = jobDetail.umbralStacks;
        this.UpdateMPTicker();
      }
      let fouls = jobDetail.foulCount;
      for (let i = 0; i < 2; ++i) {
        if (fouls > i)
          xenoStacks[i].classList.add('active');
        else
          xenoStacks[i].classList.remove('active');
      }
      let hearts = jobDetail.umbralHearts;
      for (let i = 0; i < 3; ++i) {
        if (hearts > i)
          heartStacks[i].classList.add('active');
        else
          heartStacks[i].classList.remove('active');
      }

      let stacks = jobDetail.umbralStacks;
      let seconds = Math.ceil(jobDetail.umbralMilliseconds / 1000.0);
    });
  }

  OnComboChange(skill) {
    for (let i = 0; i < this.comboFuncs.length; ++i)
      this.comboFuncs[i](skill);
  }

  // Source: http://theoryjerks.akhmorning.com/guide/speed/
  CalcGCDFromStat(stat, actionDelay) {
    // default calculates for a 2.50s recast
    actionDelay = actionDelay || 2500;

    // If stats haven't been updated, use a reasonable default value.
    if (stat === 0)
      return actionDelay / 1000;


    let type1Buffs = 0;
    let type2Buffs = 0;
    if (this.job == 'BLM') {
      type1Buffs += this.circleOfPower ? 15 : 0;
    } else if (this.job == 'WHM') {
      type1Buffs += this.presenceOfMind ? 20 : 0;
    } else if (this.job == 'SAM') {
      if (this.shifu) {
        if (this.level > 77)
          type1Buffs += 13;
        else type1Buffs += 10;
      }
    }

    if (this.job == 'NIN') {
      type2Buffs += this.huton ? 15 : 0;
    } else if (this.job == 'MNK') {
      type2Buffs += 5 * this.lightningStacks;
    } else if (this.job == 'BRD') {
      type2Buffs += 4 * this.paeonStacks;
      switch (this.museStacks) {
      case 1:
        type2Buffs += 1;
        break;
      case 2:
        type2Buffs += 2;
        break;
      case 3:
        type2Buffs += 4;
        break;
      case 4:
        type2Buffs += 12;
        break;
      }
    }
    // TODO: this probably isn't useful to track
    const astralUmbralMod = 100;

    const gcdMs = Math.floor(1000 - Math.floor(130 * (stat - kLevelMod[this.level][0]) /
      kLevelMod[this.level][1])) * actionDelay / 1000;
    const a = (100 - type1Buffs) / 100;
    const b = (100 - type2Buffs) / 100;
    const gcdC = Math.floor(Math.floor((a * b) * gcdMs / 10) * astralUmbralMod / 100);
    return gcdC / 100;
  }

  UpdateJobBarGCDs() {
    let f = this.statChangeFuncMap[this.job];
    if (f)
      f();
  }

  UpdateHealth() {
    if (!this.o.healthBar) return;
    this.o.healthBar.value = this.hp;
    this.o.healthBar.maxvalue = this.maxHP;
    this.o.healthBar.extraValue = this.currentShield;

    let percent = (this.hp + this.currentShield) / this.maxHP;

    if (this.maxHP > 0 && percent < this.options.LowHealthThresholdPercent)
      this.o.healthBar.fg = computeBackgroundColorFrom(this.o.healthBar, 'hp-color.low');
    else if (this.maxHP > 0 && percent < this.options.MidHealthThresholdPercent)
      this.o.healthBar.fg = computeBackgroundColorFrom(this.o.healthBar, 'hp-color.mid');
    else
      this.o.healthBar.fg = computeBackgroundColorFrom(this.o.healthBar, 'hp-color');
  }

  UpdateMPTicker() {
    if (!this.o.mpTicker) return;
    let delta = this.mp - this.prevMP;
    this.prevMP = this.mp;

    // Hide out of combat if requested
    if (!this.options.ShowMPTickerOutOfCombat && !this.inCombat) {
      this.o.mpTicker.duration = 0;
      this.o.mpTicker.style = 'empty';
      return;
    }
    this.o.mpTicker.style = 'fill';

    let baseTick = this.inCombat ? kMPCombatRate : kMPNormalRate;
    let umbralTick = 0;
    if (this.umbralStacks == -1) umbralTick = kMPUI1Rate;
    if (this.umbralStacks == -2) umbralTick = kMPUI2Rate;
    if (this.umbralStacks == -3) umbralTick = kMPUI3Rate;

    let mpTick = Math.floor(this.maxMP * baseTick) + Math.floor(this.maxMP * umbralTick);
    if (delta == mpTick && this.umbralStacks <= 0) // MP ticks disabled in AF
      this.o.mpTicker.duration = kMPTickInterval;

    // Update color based on the astral fire/ice state
    let colorTag = 'mp-tick-color';
    if (this.umbralStacks < 0) colorTag = 'mp-tick-color.ice';
    if (this.umbralStacks > 0) colorTag = 'mp-tick-color.fire';
    this.o.mpTicker.fg = computeBackgroundColorFrom(this.o.mpTicker, colorTag);
  }

  UpdateMana() {
    this.UpdateMPTicker();

    if (!this.o.manaBar) return;
    this.o.manaBar.value = this.mp;
    this.o.manaBar.maxvalue = this.maxMP;
    let lowMP = -1;
    let mediumMP = -1;
    let far = -1;

    if (this.job == 'RDM' || this.job == 'BLM' || this.job == 'SMN' || this.job == 'ACN')
      far = this.options.FarThresholdOffence;

    if (this.job == 'DRK') {
      lowMP = this.options.DrkLowMPThreshold;
      mediumMP = this.options.DrkMediumMPThreshold;
    } else if (this.job == 'PLD') {
      lowMP = this.options.PldLowMPThreshold;
      mediumMP = this.options.PldMediumMPThreshold;
    } else if (this.job == 'BLM') {
      lowMP = this.options.BlmLowMPThreshold;
      mediumMP = this.options.BlmMediumMPThreshold;
    }

    if (far >= 0 && this.distance > far)
      this.o.manaBar.fg = computeBackgroundColorFrom(this.o.manaBar, 'mp-color.far');
    else if (lowMP >= 0 && this.mp <= lowMP)
      this.o.manaBar.fg = computeBackgroundColorFrom(this.o.manaBar, 'mp-color.low');
    else if (mediumMP >= 0 && this.mp <= mediumMP)
      this.o.manaBar.fg = computeBackgroundColorFrom(this.o.manaBar, 'mp-color.medium');
    else
      this.o.manaBar.fg = computeBackgroundColorFrom(this.o.manaBar, 'mp-color');
  }

  updateCp() {
    if (!this.o.cpBar) return;
    this.o.cpBar.value = this.cp;
    this.o.cpBar.maxvalue = this.maxCP;
  }

  UpdateGp() {
    if (!this.o.gpBar) return;
    this.o.gpBar.value = this.gp;
    this.o.gpBar.maxvalue = this.maxGP;

    // GP Alarm
    if (this.gp < this.options.GpAlarmPoint) {
      this.gpAlarmReady = true;
    } else if (this.gpAlarmReady && !this.gpPotion && this.gp >= this.options.GpAlarmPoint) {
      this.gpAlarmReady = false;
      let audio = new Audio('../../resources/sounds/PowerAuras/kaching.ogg');
      audio.volume = this.options.GpAlarmSoundVolume;
      audio.play();
    }
  }

  UpdateOpacity() {
    let opacityContainer = document.getElementById('opacity-container');
    if (!opacityContainer)
      return;
    opacityContainer.style.opacity = 1.0;
  }

  UpdateFoodBuff() {
    // Non-combat jobs don't set up the left buffs list.
    if (!this.init || !this.o.leftBuffsList)
      return;

    let CanShowWellFedWarning = function() {
      if (!this.options.HideWellFedAboveSeconds)
        return false;
      if (this.inCombat)
        return false;
      if (this.level < this.options.MaxLevel)
        return true;

      return this.options.WellFedContentTypes.includes(this.contentType);
    };

    // Returns the number of ms until it should be shown. If <= 0, show it.
    let TimeToShowWellFedWarning = function() {
      let nowMs = Date.now();
      let showAtMs = this.foodBuffExpiresTimeMs - (this.options.HideWellFedAboveSeconds * 1000);
      return showAtMs - nowMs;
    };

    window.clearTimeout(this.foodBuffTimer);
    this.foodBuffTimer = null;

    let canShow = CanShowWellFedWarning.bind(this)();
    let showAfterMs = TimeToShowWellFedWarning.bind(this)();

    if (!canShow || showAfterMs > 0) {
      this.o.leftBuffsList.removeElement('foodbuff');
    }
  }

  OnPartyWipe(e) {
    // TODO: add reset for job-specific ui
    if (this.buffTracker)
      this.buffTracker.clear();
  }

  OnInCombatChanged(e) {
    if (this.inCombat == e.detail.inGameCombat)
      return;

    this.inCombat = e.detail.inGameCombat;

    this.UpdateOpacity();
    this.UpdateFoodBuff();
    this.UpdateMPTicker();
  }

  OnChangeZone(e) {
    const zoneInfo = ZoneInfo[e.zoneID];
    this.contentType = zoneInfo ? zoneInfo.contentType : 0;

    this.UpdateFoodBuff();
    if (this.buffTracker)
      this.buffTracker.clear();
  }

  OnPlayerChanged(e) {
    if (this.me !== e.detail.name) {
      this.me = e.detail.name;
      // setup regexes prior to the combo tracker
      setupRegexes(this.me);
    }

    if (!this.init) {
      this.combo = setupComboTracker(this.OnComboChange.bind(this));
      this.init = true;
    }

    let updateJob = false;
    let updateHp = false;
    let updateMp = false;
    let updateCp = false;
    let updateGp = false;
    let updateLevel = false;
    if (e.detail.job != this.job) {
      this.job = e.detail.job;
      // Combos are job specific.
      this.combo.AbortCombo();
      // Update MP ticker as umbral stacks has changed.
      this.umbralStacks = 0;
      this.UpdateMPTicker();
      updateJob = updateHp = updateMp = updateCp = updateGp = true;
      if (!Util.isGatheringJob(this.job))
        this.gpAlarmReady = false;
    }
    if (e.detail.level != this.level) {
      this.level = e.detail.level;
      updateLevel = true;
    }
    if (e.detail.currentHP != this.hp || e.detail.maxHP != this.maxHP ||
      e.detail.currentShield != this.currentShield) {
      this.hp = e.detail.currentHP;
      this.maxHP = e.detail.maxHP;
      this.currentShield = e.detail.currentShield;
      updateHp = true;

      if (this.hp == 0)
        this.combo.AbortCombo(); // Death resets combos.
    }
    if (e.detail.currentMP != this.mp || e.detail.maxMP != this.maxMP) {
      this.mp = e.detail.currentMP;
      this.maxMP = e.detail.maxMP;
      updateMp = true;
    }
    if (e.detail.currentCP != this.cp || e.detail.maxCP != this.maxCP) {
      this.cp = e.detail.currentCP;
      this.maxCP = e.detail.maxCP;
      updateCp = true;
    }
    if (e.detail.currentGP != this.gp || e.detail.maxGP != this.maxGP) {
      this.gp = e.detail.currentGP;
      this.maxGP = e.detail.maxGP;
      updateGp = true;
    }
    if (updateJob) {
      this.UpdateJob();
      // On reload, we need to set the opacity after setting up the job bars.
      this.UpdateOpacity();
      // Set up the buff tracker after the job bars are created.
      this.buffTracker = new BuffTracker(
          this.options, this.me, this.o.leftBuffsList, this.o.rightBuffsList);
    }
    if (updateHp)
      this.UpdateHealth();
    if (updateMp)
      this.UpdateMana();
    if (updateCp)
      this.updateCp();
    if (updateGp)
      this.UpdateGp();
    if (updateLevel)
      this.UpdateFoodBuff();

    if (e.detail.jobDetail) {
      for (let i = 0; i < this.jobFuncs.length; ++i)
        this.jobFuncs[i](e.detail.jobDetail);
    }
  }

  UpdateEnmityTargetData(e) {
    let target = e.Target;

    let update = false;
    if (!target || !target.Name) {
      if (this.distance != -1) {
        this.distance = -1;
        update = true;
      }
    } else if (target.EffectiveDistance != this.distance) {
      this.distance = target.EffectiveDistance;
      update = true;
    }
    if (update) {
      this.UpdateHealth();
      this.UpdateMana();
    }
  }

  OnNetLog(e) {
    if (!this.init)
      return;
    const line = e.line;
    const log = e.rawLine;

    const type = line[0];
    if (type === '26') {
      let m = log.match(kYouGainEffectRegex);
      if (m) {
        const effectId = m.groups.effectId.toUpperCase();
        let f = this.gainEffectFuncMap[effectId];
        if (f)
          f(name, m.groups);
        this.buffTracker.onYouGainEffect(effectId, m.groups);
      }
      m = log.match(kMobGainsEffectRegex);
      if (m) {
        const effectId = m.groups.effectId.toUpperCase();
        this.buffTracker.onMobGainsEffect(effectId, m.groups);
      }
    } else if (type === '30') {
      let m = log.match(kYouLoseEffectRegex);
      if (m) {
        const effectId = m.groups.effectId.toUpperCase();
        let f = this.loseEffectFuncMap[effectId];
        if (f)
          f(name, m.groups);
        this.buffTracker.onYouLoseEffect(effectId, m.groups);
      }
      m = log.match(kMobLosesEffectRegex);
      if (m) {
        const effectId = m.groups.effectId.toUpperCase();
        this.buffTracker.onMobLosesEffect(effectId, m.groups);
      }
    } else if (type === '21' || type === '22') {
      let m = log.match(kYouUseAbilityRegex);
      if (m) {
        let id = m.groups.id;
        this.combo.HandleAbility(id);
        let f = this.abilityFuncMap[id];
        if (f)
          f(id, m.groups);
        this.buffTracker.onUseAbility(id, m.groups);
      } else {
        let m = log.match(kAnybodyAbilityRegex);
        if (m)
          this.buffTracker.onUseAbility(m.groups.id, m.groups);
      }
    }
  }

  OnLogEvent(e) {
    if (!this.init)
      return;

    for (let i = 0; i < e.detail.logs.length; i++) {
      let log = e.detail.logs[i];

      // TODO: only consider this when not in battle.
      if (log[15] == '0') {
        let r = log.match(this.countdownStartRegex);
        if (r != null) {
          let seconds = parseFloat(r.groups.time);
          continue;
        }
        if (log.search(this.countdownCancelRegex) >= 0) {
          continue;
        }
        if (log.search(/:test:jobs:/) >= 0) {
          this.Test();
          continue;
        }
        if (log[16] == 'C') {
          let stats = log.match(kStatsRegex).groups;
          this.skillSpeed = stats.skillSpeed;
          this.spellSpeed = stats.spellSpeed;
          this.UpdateJobBarGCDs();
          continue;
        }
      } else if (log[15] == '1') {
        // TODO: consider flags for missing.
        // flags:damage is 1:0 in most misses.
        if (log[16] == '5' || log[16] == '6') {
          // use of GP Potion
          let cordialRegex = Regexes.ability({ source: this.me, id: '20(017FD|F5A3D|F844F|0420F|0317D)' });
          if (log.match(cordialRegex)) {
            this.gpPotion = true;
            setTimeout(() => {
              this.gpPotion = false;
            }, 2000);
          }
        }
      }
    }
  }

  Test() {
    let logs = [];
    let t = '[10:10:10.000] ';
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Medicated from ' + this.me + ' for 30.2 Seconds.');
    logs.push(t + '15:10000000:Tako Yaki:1D60:Embolden:10000000:' + this.me + ':500020F:4D70000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:42194:42194:10000:10000:0:1000:-655.3301:-838.5481:29.80905:0.523459:42194:42194:10000:10000:0:1000:-655.3301:-838.5481:29.80905:0.523459:00001DE7');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Battle Litany from  for 25 Seconds.');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of The Balance from  for 12 Seconds.');
    logs.push(t + '1A:10000000:Okonomi Yaki gains the effect of Foe Requiem from Okonomi Yaki for 9999.00 Seconds.');
    logs.push(t + '15:1048638C:Okonomi Yaki:8D2:Trick Attack:40000C96:Striking Dummy:20710103:154B:');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Left Eye from That Guy for 15.0 Seconds.');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Right Eye from That Guy for 15.0 Seconds.');
    logs.push(t + '15:1048638C:Tako Yaki:1D0C:Chain Stratagem:40000C96:Striking Dummy:28710103:154B:');
    logs.push(t + '15:1048638C:Tako Yaki:B45:Hypercharge:40000C96:Striking Dummy:28710103:154B:');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Devotion from That Guy for 15.0 Seconds.');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Brotherhood from That Guy for 15.0 Seconds.');
    logs.push(t + '1A:10000000:' + this.me + ' gains the effect of Brotherhood from Other Guy for 15.0 Seconds.');
    let e = { detail: { logs: logs } };
    this.OnLogEvent(e);
  }
}

let gBars;

UserConfig.getUserConfigLocation('jobs', function() {
  addOverlayListener('onPlayerChangedEvent', function(e) {
    gBars.OnPlayerChanged(e);
  });
  addOverlayListener('EnmityTargetData', function(e) {
    gBars.UpdateEnmityTargetData(e);
  });
  addOverlayListener('onPartyWipe', function(e) {
    gBars.OnPartyWipe(e);
  });
  addOverlayListener('onInCombatChangedEvent', function(e) {
    gBars.OnInCombatChanged(e);
  });
  addOverlayListener('ChangeZone', function(e) {
    gBars.OnChangeZone(e);
  });
  addOverlayListener('onLogEvent', function(e) {
    gBars.OnLogEvent(e);
  });
  addOverlayListener('LogLine', (e) => {
    gBars.OnNetLog(e);
  });

  gBars = new Bars(Options);
});
