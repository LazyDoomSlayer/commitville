# 0006 — Opportunistic mascot conversations

- Status: Accepted
- Date: 2026-11-18
- Extends: 0005 — Shared patrols and cell reservations

## Context

Three mascots already roam the office. The owner requested that they stop and
talk when they meet, rather than only avoiding each other. Encounters must remain
autonomous, readable, deterministic and compatible with their existing routes.

## Decision

`MascotConversationSystem` owns encounter proximity, participants, fictional
lines, speaking turns, facing direction and cooldowns. It runs on the same fixed
50 ms steps as patrol coordination, with no browser dependencies, randomness or
network requests. `mascot-roster.ts` owns IDs and display names shared by these
behaviors and the UI.

Eligible mascots within 2.25 floor-cell units can start a chat after an initial
two-second settling period. A shortest-path check rejects encounters blocked by
furniture. A third nearby eligible mascot can join the group at its start. Stable
candidate ordering rotates between encounters. There is one conversation at a
time, with two rounds of three-second turns and a 25-second cooldown per member.

The coordinator freezes participating patrols in place, preserving their route,
pauses and current segment reservations. Social snapshots override idle pose,
facing and activity without modifying the saved patrol. Nonparticipants continue
to navigate around those reservations. Conversation completion resumes the patrol
without teleporting or resetting it.

Rendering projects the active speaker's head position to the screen. A DOM speech
bubble owned by `src/ui` stays within the camera viewport at different zoom levels;
only one speaker's text appears at a time. The selected mascot's status also shows
that it is chatting. Bubbles are removed when the scene shuts down.

## Consequences

- Pair and three-person conversations emerge from proximity, without player input.
- Tests cover turn-taking, facing, cooldowns, obstacle blocking, patrol freeze and
  resume, plus complete routines and separation with conversations enabled.
- Fixed authored lines keep the public dialogue fictional and offline-capable.
- This is a small social behavior, not a relationship, workday or language-model
  system. Joining an already-running chat and multiple simultaneous groups remain
  outside this first implementation.
- A conversation can pause a mascot mid-segment. Both segment cells remain reserved
  so another character cannot walk into the paused movement corridor.
