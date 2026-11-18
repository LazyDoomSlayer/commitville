import { findOfficePath } from '../office/office-layout';
import { MASCOT_IDS, MASCOT_NAMES, type MascotId } from './mascot-roster';
import type { PatrolDirection, PatrolSnapshot } from './office-patrol.system';

type Positions = Record<MascotId, PatrolSnapshot>;
export interface SocialSnapshot extends PatrolSnapshot {
  readonly talking: boolean;
  readonly speech: string | null;
}

export const CONVERSATION_TURN_MS = 3_000;
export const CONVERSATION_COOLDOWN_MS = 25_000;
const DIALOGUE: Record<MascotId, readonly string[]> = {
  dnake: [
    'Anyone up for a coffee break?',
    'I like keeping the door open for good ideas.',
    'Good chat. See you on the next round!',
  ],
  zkteco: [
    'All my lights say it is a good day.',
    'A coffee connection sounds perfect.',
    'Stay connected, friends!',
  ],
  c3plus: [
    'Count me in. I could use a little recharge.',
    'You two always brighten my circuits.',
    'Back to the office circuit!',
  ],
};

interface Conversation {
  readonly participants: readonly MascotId[];
  readonly lines: readonly { speaker: MascotId; text: string }[];
  elapsedMs: number;
}

// Owns proximity, conversation timing, turns and cooldowns; it never moves a
// patrol or consumes randomness. The coordinator pauses participants in place.
export class MascotConversationSystem {
  private active: Conversation | null = null;
  private ageMs = 0;
  private encounter = 0;
  private readonly cooldown = { dnake: 0, zkteco: 0, c3plus: 0 };

  advance(elapsedMs: number, positions: Positions): void {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
      throw new RangeError('Elapsed time must be non-negative and finite.');
    this.ageMs += elapsedMs;
    for (const id of MASCOT_IDS) this.cooldown[id] = Math.max(0, this.cooldown[id] - elapsedMs);
    if (this.active) {
      this.active.elapsedMs += elapsedMs;
      if (this.active.elapsedMs >= this.active.lines.length * CONVERSATION_TURN_MS) {
        for (const id of this.active.participants) this.cooldown[id] = CONVERSATION_COOLDOWN_MS;
        this.active = null;
      }
      return;
    }
    if (this.ageMs < 2_000) return;
    const eligible = MASCOT_IDS.filter((id) => this.cooldown[id] === 0);
    // Rotate the first candidate after each encounter so the same pair does
    // not always get priority when multiple characters arrive together.
    const candidates = eligible
      .slice(this.encounter % Math.max(1, eligible.length))
      .concat(eligible.slice(0, this.encounter % Math.max(1, eligible.length)));
    for (const first of candidates) {
      const second = candidates.find(
        (id) => id !== first && this.nearby(positions[first], positions[id]),
      );
      if (!second) continue;
      const participants = [first, second];
      for (const id of candidates) {
        if (
          !participants.includes(id) &&
          participants.some((other) => this.nearby(positions[other], positions[id]))
        )
          participants.push(id);
      }
      const lines = [0, 1].flatMap((round) =>
        participants.map((speaker) => ({
          speaker,
          text: DIALOGUE[speaker][(round + this.encounter) % DIALOGUE[speaker].length]!,
        })),
      );
      this.active = { participants, lines, elapsedMs: 0 };
      this.encounter += 1;
      return;
    }
  }

  participants(): readonly MascotId[] {
    return this.active ? [...this.active.participants] : [];
  }

  project(id: MascotId, positions: Positions): SocialSnapshot {
    const state = positions[id];
    const chat = this.active;
    if (!chat || !chat.participants.includes(id)) return { ...state, talking: false, speech: null };
    const line = chat.lines[Math.floor(chat.elapsedMs / CONVERSATION_TURN_MS)]!;
    const target =
      line.speaker === id ? chat.participants.find((other) => other !== id)! : line.speaker;
    const dx = positions[target].x - state.x;
    const dy = positions[target].y - state.y;
    const direction: PatrolDirection =
      Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : dy > 0 ? 'south' : 'north';
    return {
      ...state,
      walking: false,
      walkingMs: 0,
      direction,
      talking: true,
      activity: `Chatting with ${chat.participants
        .filter((other) => other !== id)
        .map((other) => MASCOT_NAMES[other])
        .join(' and ')}`,
      speech: line.speaker === id ? line.text : null,
    };
  }

  private nearby(a: PatrolSnapshot, b: PatrolSnapshot): boolean {
    const distance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    if (distance < 0.9 || distance > 2.25) return false;
    const start = { x: Math.floor(a.x), y: Math.floor(a.y) };
    const goal = { x: Math.floor(b.x), y: Math.floor(b.y) };
    const directSteps = Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
    // Nearby on screen is not enough: reject chats through a desk or cabinet.
    return directSteps > 0 && findOfficePath(start, goal).length === directSteps;
  }
}
