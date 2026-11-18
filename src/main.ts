import Phaser from 'phaser';

import { loadPrivateAssets } from './services/assets/private-assets.service';
import { createGameConfig } from './rendering/config/game.config';
import { WorldClock } from './simulation/time/world-clock';
import './styles/main.css';

const clockElement = document.querySelector<HTMLTimeElement>('#world-clock');

if (!clockElement) {
  throw new Error('The application shell is missing a required display element.');
}

const view = new URLSearchParams(window.location.search).get('view') === 'flat' ? 'flat' : 'angled';
const privateAssets = view === 'flat' ? await loadPrivateAssets() : null;
if (view === 'flat') {
  document.querySelector('.camera-controls')?.setAttribute('hidden', '');
  document.querySelector('.office-status')?.setAttribute('hidden', '');
  const credit = document.querySelector<HTMLElement>('#art-credit');
  if (credit && privateAssets) {
    credit.textContent = `ART: ${Object.values(privateAssets.packs)
      .map((pack) => `${pack.title} · ${pack.creator}`)
      .join(' + ')}`;
    credit.hidden = false;
  }
}

const worldClock = new WorldClock({
  startDay: 0,
  startMinute: 8 * 60,
  gameMinutesPerRealSecond: 2,
});

const updateClock = (): void => {
  const snapshot = worldClock.advance(1_000);
  clockElement.textContent = worldClock.format(snapshot);
  clockElement.dateTime = `P${snapshot.dayNumber}DT${snapshot.hour}H${snapshot.minute}M`;
};

clockElement.textContent = worldClock.format(worldClock.snapshot());

const clockTimer = window.setInterval(updateClock, 1_000);
const game = new Phaser.Game(createGameConfig('game', view, privateAssets));

window.addEventListener(
  'pagehide',
  () => {
    window.clearInterval(clockTimer);
    game.destroy(true);
  },
  { once: true },
);
