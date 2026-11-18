import { loadPrivateAssets } from './services/assets/private-assets.service';
import { WorldClock } from './simulation/time/world-clock';
import './styles/main.css';

const clockElement = document.querySelector<HTMLTimeElement>('#world-clock');

if (!clockElement) {
  throw new Error('The application shell is missing a required display element.');
}

const requestedView = new URLSearchParams(window.location.search).get('view');
const view = requestedView === 'flat' ? 'flat' : requestedView === 'angled' ? 'angled' : '3d';
if (view === '3d') {
  const eyebrow = document.querySelector('.hud__eyebrow');
  if (eyebrow) eyebrow.textContent = 'Autonomous 3D office';
}
const privateAssets = view === '3d' ? null : await loadPrivateAssets();
if (view === 'flat') {
  document.querySelector('#population-summary')?.setAttribute('hidden', '');
  document.querySelector('.camera-controls')?.setAttribute('hidden', '');
  document.querySelector('.office-status')?.setAttribute('hidden', '');
}
{
  const credit = document.querySelector<HTMLElement>('#art-credit');
  if (credit && privateAssets) {
    const packs =
      view === 'flat'
        ? Object.values(privateAssets.packs)
        : [privateAssets.packs.pixelwoodValley].filter((pack) => pack !== undefined);
    credit.textContent = `ART: ${packs
      .map((pack) => `${pack.title} · ${pack.creator}`)
      .join(' + ')}`;
    credit.hidden = packs.length === 0;
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
let runtime: { destroy: () => void } | undefined;
const startLegacy = async (legacyView: 'flat' | 'angled') => {
  const eyebrow = document.querySelector('.hud__eyebrow');
  if (eyebrow) eyebrow.textContent = 'Autonomous office simulation';
  const [{ default: Phaser }, { createGameConfig }] = await Promise.all([
    import('phaser'),
    import('./rendering/config/game.config'),
  ]);
  const game = new Phaser.Game(createGameConfig('game', legacyView, privateAssets));
  runtime = { destroy: () => game.destroy(true) };
};
if (view === '3d') {
  const fallback = () => {
    void startLegacy('angled');
  };
  try {
    const { createOffice3D } = await import('./rendering/three/office-3d.runtime');
    runtime = createOffice3D(document.querySelector<HTMLElement>('#game')!, fallback);
  } catch (error) {
    console.error('3D unavailable; starting the angled office', error);
    document.querySelector('#game')?.replaceChildren();
    await startLegacy('angled');
  }
} else await startLegacy(view);

window.addEventListener(
  'pagehide',
  () => {
    window.clearInterval(clockTimer);
    runtime?.destroy();
  },
  { once: true },
);
