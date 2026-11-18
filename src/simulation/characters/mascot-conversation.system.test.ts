import { describe, expect, it } from 'vitest';

import {
  MascotConversationSystem,
  CONVERSATION_COOLDOWN_MS,
  CONVERSATION_TURN_MS,
} from './mascot-conversation.system';
import { MASCOT_IDS } from './mascot-roster';
import { OfficeMascotsSystem } from './office-mascots.system';
import type { PatrolSnapshot } from './office-patrol.system';

const standing = (x: number, y: number): PatrolSnapshot => ({
  x,
  y,
  direction: 'south',
  walking: false,
  walkingMs: 0,
  activity: 'Taking a break',
});
const meeting = {
  dnake: standing(10.5, 10.5),
  zkteco: standing(11.5, 10.5),
  c3plus: standing(12.5, 10.5),
};

describe('mascot conversations', () => {
  it('includes all nearby friends, faces the other mascots and takes one speaking turn at a time', () => {
    const chats = new MascotConversationSystem();
    chats.advance(2_000, meeting);
    expect(chats.participants()).toHaveLength(3);
    const speakers = new Set<string>();
    for (let turn = 0; turn < 6; turn += 1) {
      const states = MASCOT_IDS.map((id) => ({ id, ...chats.project(id, meeting) }));
      expect(states.filter((state) => state.speech !== null)).toHaveLength(1);
      expect(
        states.every((state) => state.talking && !state.walking && state.walkingMs === 0),
      ).toBe(true);
      speakers.add(states.find((state) => state.speech !== null)!.id);
      expect(chats.project('dnake', meeting).direction).toBe('east');
      expect(chats.project('c3plus', meeting).direction).toBe('west');
      chats.advance(CONVERSATION_TURN_MS, meeting);
    }
    expect([...speakers].sort()).toEqual([...MASCOT_IDS].sort());
    expect(chats.participants()).toEqual([]);
    expect(chats.project('dnake', meeting)).toMatchObject({
      talking: false,
      speech: null,
      activity: 'Taking a break',
    });
  });

  it('does not restart a conversation until the participants have cooled down', () => {
    const chats = new MascotConversationSystem();
    chats.advance(2_000, meeting);
    chats.advance(CONVERSATION_TURN_MS * 6, meeting);
    chats.advance(CONVERSATION_COOLDOWN_MS - 50, meeting);
    expect(chats.participants()).toEqual([]);
    chats.advance(50, meeting);
    expect(chats.participants()).toHaveLength(3);
  });

  it('allows a nearby pair while a distant third mascot stays on its routine', () => {
    const positions = { ...meeting, c3plus: standing(1.5, 8.5) };
    const chats = new MascotConversationSystem();
    chats.advance(2_000, positions);
    expect(chats.participants()).toEqual(['dnake', 'zkteco']);
    expect(chats.project('c3plus', positions)).toMatchObject({ talking: false, speech: null });
  });

  it('does not start a chat through an intervening chair or at a distance', () => {
    const chats = new MascotConversationSystem();
    chats.advance(2_000, {
      dnake: standing(2.5, 4.5),
      zkteco: standing(4.5, 4.5),
      c3plus: standing(12.5, 10.5),
    });
    expect(chats.participants()).toEqual([]);
  });

  it('freezes patrol positions during a chat and resumes movement afterwards', () => {
    const mascots = new OfficeMascotsSystem();
    const start = mascots.advance(2_000);
    expect(MASCOT_IDS.every((id) => start[id].talking)).toBe(true);
    const during = mascots.advance(4_000);
    for (const id of MASCOT_IDS) {
      expect(during[id].x).toBe(start[id].x);
      expect(during[id].y).toBe(start[id].y);
      expect(during[id].walking).toBe(false);
    }
    const after = mascots.advance(16_000);
    expect(MASCOT_IDS.every((id) => !after[id].talking)).toBe(true);
    expect(
      MASCOT_IDS.some((id) => after[id].x !== start[id].x || after[id].y !== start[id].y),
    ).toBe(true);
  });
});
