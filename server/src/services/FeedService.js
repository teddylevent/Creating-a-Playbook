const { v4: uuidv4 } = require('uuid');
const { pick, randInt } = require('../utils/random');

/**
 * Generates human-like social feed posts for bots.
 * Tone is driven by personality traits.
 */
class FeedService {
  constructor(store) {
    this.store = store;
    this.store.feed = this.store.feed || [];
  }

  // ── Post Generation ──

  generatePreMatchPost(bot, opponentName) {
    const tone = this._getTone(bot);
    const templates = {
      high_toxic_confident: [
        `${opponentName}? Should be an easy 3 points. Don't waste my time.`,
        `I've already prepared my victory speech for after we demolish ${opponentName}.`,
        `${opponentName} should just forfeit now and save themselves the embarrassment.`,
      ],
      high_confident: [
        `Ready for ${opponentName}. We've been preparing all week. Let's go.`,
        `${opponentName} is a good team but we're better. Simple as that.`,
        `Feeling great about tomorrow's match against ${opponentName}. We're in form.`,
      ],
      high_emotional: [
        `This match against ${opponentName} means EVERYTHING. The boys are fired up!! 🔥`,
        `Can't sleep. Tomorrow we face ${opponentName}. This is what it's all about.`,
        `${opponentName}... I have a feeling this will be one to remember.`,
      ],
      neutral: [
        `${opponentName} up next. We'll see what happens.`,
        `Preparing for ${opponentName}. Focused on our game plan.`,
        `Match day approaching. ${opponentName} is a decent side.`,
      ],
      low_confident: [
        `${opponentName} are strong this season. We'll need to be at our best.`,
        `Tough fixture against ${opponentName} coming up. Cautiously optimistic.`,
        `We respect ${opponentName}. It's going to be a battle.`,
      ],
      secretive: [
        `Match day.`,
        `...`,
        `Preparations complete.`,
      ],
    };
    const pool = templates[tone] || templates.neutral;
    return this._createPost(bot, 'preMatch', pick(pool));
  }

  generatePostMatchPost(bot, matchResult) {
    const tone = this._getTone(bot);
    const isHome = matchResult.homeTeamId === bot.id;
    const won = (isHome && matchResult.winner === 'home') || (!isHome && matchResult.winner === 'away');
    const drew = matchResult.winner === 'draw';
    const score = isHome
      ? `${matchResult.score.home}-${matchResult.score.away}`
      : `${matchResult.score.away}-${matchResult.score.home}`;
    const opponent = isHome ? matchResult.awayTeamName : matchResult.homeTeamName;

    let templates;
    if (won) {
      templates = {
        high_toxic_confident: [
          `${score} against ${opponent}. Too easy. Next.`,
          `Another W. ${opponent} never stood a chance. ${score}.`,
          `I told you all. ${score}. ${opponent} got schooled today.`,
        ],
        high_confident: [
          `Great result! ${score} against ${opponent}. The team executed perfectly.`,
          `${score}. Solid performance against ${opponent}. Proud of the boys.`,
        ],
        high_emotional: [
          `WE DID IT!! ${score}!! What a performance against ${opponent}!! YESSSS!`,
          `I'm crying tears of joy. ${score} against ${opponent}. Beautiful football.`,
        ],
        neutral: [
          `${score} against ${opponent}. Good result for us.`,
          `Job done. ${score} vs ${opponent}.`,
        ],
        secretive: [
          `${score}.`,
          `Result noted.`,
        ],
      };
    } else if (drew) {
      templates = {
        high_toxic_confident: [
          `${score} draw with ${opponent}. We deserved more. Ref was blind.`,
          `${score}. ${opponent} got lucky today. We dominated.`,
        ],
        high_confident: [
          `${score} draw. Not our best but we'll take a point against ${opponent}.`,
        ],
        high_emotional: [
          `${score}... gutted. We were SO close against ${opponent}. 😤`,
          `A draw. ${score}. I can't accept this. We need to do better.`,
        ],
        neutral: [
          `${score} draw with ${opponent}. Fair result.`,
        ],
        secretive: [`${score}.`],
      };
    } else {
      templates = {
        high_toxic_confident: [
          `${score} loss to ${opponent}. Whatever. We'll destroy them next time.`,
          `${score}. Fluke result. ${opponent} got lucky and they know it.`,
        ],
        high_confident: [
          `Tough loss. ${score} against ${opponent}. We'll bounce back stronger.`,
        ],
        high_emotional: [
          `${score}... I'm devastated. ${opponent} outplayed us today. This hurts.`,
          `Heartbroken. ${score} to ${opponent}. I need to rethink everything.`,
        ],
        neutral: [
          `${score} loss to ${opponent}. Back to the training ground.`,
        ],
        low_confident: [
          `${score}. ${opponent} deserved it. We have a lot of work to do.`,
          `Not good enough. ${score} loss. Need to improve.`,
        ],
        secretive: [`...`],
      };
    }

    const pool = templates[tone] || templates.neutral;
    return this._createPost(bot, 'postMatch', pick(pool));
  }

  generateRivalryPost(bot, rivalName) {
    const tone = this._getTone(bot);
    const templates = {
      high_toxic_confident: [
        `${rivalName} thinks they're something special. I'll show them what special looks like.`,
        `Rent free in ${rivalName}'s head. Love it.`,
        `${rivalName}? More like ${rivalName.slice(0, 3)}... nah, not worth the effort.`,
      ],
      high_confident: [
        `${rivalName} better be ready. This rivalry is just getting started.`,
        `Respect to ${rivalName} but when we meet, only one team walks away happy.`,
      ],
      high_emotional: [
        `Every time I see ${rivalName} I feel the fire burning. This is PERSONAL.`,
        `${rivalName}... the one fixture I circle on the calendar. Bring it.`,
      ],
      neutral: [
        `${rivalName} is a tough opponent. Looking forward to facing them.`,
      ],
      secretive: [`Noted.`],
    };
    const pool = templates[tone] || templates.neutral;
    return this._createPost(bot, 'rivalry', pick(pool));
  }

  generateTradePost(bot, tradeSummary) {
    const tone = this._getTone(bot);
    const { gave, received, with: partner } = tradeSummary;
    const templates = {
      high_toxic_confident: [
        `Just fleeced ${partner}. Gave them ${gave}, got ${received}. Business.`,
        `${received} joins us from ${partner}. Upgrade. Simple.`,
      ],
      high_confident: [
        `Pleased to welcome ${received} from ${partner}. Good deal for both sides.`,
        `Done deal: ${received} in, ${gave} out. Strengthening the squad.`,
      ],
      high_emotional: [
        `Bittersweet. ${gave} leaves but ${received} arrives. Onwards and upwards!`,
        `Welcome ${received}!! So excited about this signing from ${partner}!`,
      ],
      neutral: [
        `Trade completed with ${partner}. ${received} joins.`,
      ],
      secretive: [`Squad update.`],
    };
    const pool = templates[tone] || templates.neutral;
    return this._createPost(bot, 'trade', pick(pool));
  }

  generateRandomPost(bot) {
    const tone = this._getTone(bot);
    const templates = {
      high_toxic_confident: [
        `Everyone's talking about their "process". My process is winning.`,
        `Some managers need a masterclass. I'm available for a fee.`,
        `Woke up feeling dangerous. League isn't ready.`,
        `The gap between my team and everyone else is growing. You love to see it.`,
      ],
      high_confident: [
        `Training session was elite today. The team is gelling.`,
        `Good morning. Another day closer to the title.`,
        `Reviewing film from last week. Found some things to exploit.`,
      ],
      high_emotional: [
        `This league is EVERYTHING to me. I live and breathe football.`,
        `Had an incredible training session! The passion in this team is unreal!`,
        `Some days you just feel it. Today is one of those days. 💪`,
      ],
      neutral: [
        `Training done for the day. Solid work.`,
        `Watching some film. Preparing for what's next.`,
        `The league table is shaping up interestingly.`,
      ],
      low_confident: [
        `Need to find some answers. The form hasn't been great.`,
        `Working hard in training. Hope it translates.`,
      ],
      secretive: [
        `Working.`,
        `...`,
        `👀`,
      ],
    };
    const pool = templates[tone] || templates.neutral;
    return this._createPost(bot, 'random', pick(pool));
  }

  // ── Tone Derivation ──

  _getTone(bot) {
    const { confidence, toxicity, emotionality, secrecy } = bot.traits.social;

    if (secrecy > 75) return 'secretive';
    if (toxicity > 60 && confidence > 65) return 'high_toxic_confident';
    if (confidence > 70) return 'high_confident';
    if (emotionality > 65) return 'high_emotional';
    if (confidence < 40) return 'low_confident';
    return 'neutral';
  }

  _createPost(bot, type, content) {
    const post = {
      id: uuidv4(),
      botId: bot.id,
      teamName: bot.teamName,
      managerName: bot.managerName,
      personalityLabel: bot.personalityLabel,
      type,
      content,
      createdAt: new Date().toISOString(),
    };
    this.store.feed.unshift(post);
    // Keep feed at manageable size
    if (this.store.feed.length > 200) {
      this.store.feed = this.store.feed.slice(0, 200);
    }
    return post;
  }

  getFeed(limit = 50) {
    return this.store.feed.slice(0, limit);
  }

  getFeedByBot(botId, limit = 20) {
    return this.store.feed.filter(p => p.botId === botId).slice(0, limit);
  }
}

module.exports = FeedService;
