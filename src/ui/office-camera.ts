import {
  MASCOT_IDS,
  MASCOT_NAMES,
  type MascotId,
} from '../simulation/characters/office-population.system';

export interface OfficeCameraActions {
  select: (id: MascotId) => void;
  zoom: (steps: number) => void;
  fit: () => void;
  follow: () => void;
}

export interface OfficeControlState {
  target: MascotId;
  zoom: number;
  minimumZoom: number;
  following: boolean;
  activity: string;
  walking: boolean;
  talking: boolean;
  workers: number;
  walkers: number;
}

export const bindOfficeControls = (actions: OfficeCameraActions) => {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const zoomOut = document.querySelector<HTMLButtonElement>('#zoom-out');
  const zoomIn = document.querySelector<HTMLButtonElement>('#zoom-in');
  const fit = document.querySelector<HTMLButtonElement>('#fit-office');
  const follow = document.querySelector<HTMLButtonElement>('#follow-mascot');
  const zoomValue = document.querySelector<HTMLOutputElement>('#zoom-value');
  const activity = document.querySelector<HTMLElement>('#dnake-activity');
  const status = document.querySelector<HTMLElement>('#dnake-status');
  const mascotSelect = document.querySelector<HTMLSelectElement>('#mascot-select');
  mascotSelect?.addEventListener(
    'change',
    () => {
      const id = MASCOT_IDS.find((id) => id === mascotSelect.value);
      if (id) actions.select(id);
    },
    options,
  );
  const populationSummary = document.querySelector<HTMLElement>('#population-summary');
  let previous: OfficeControlState | undefined;

  zoomOut?.addEventListener('click', () => actions.zoom(-1), options);
  zoomIn?.addEventListener('click', () => actions.zoom(1), options);
  fit?.addEventListener('click', actions.fit, options);
  follow?.addEventListener('click', actions.follow, options);
  window.addEventListener(
    'keydown',
    (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      )
        return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === '+' || key === '=') actions.zoom(1);
      else if (key === '-') actions.zoom(-1);
      else if (key === '0') actions.fit();
      else if (key === 'f') actions.follow();
      else return;
      event.preventDefault();
    },
    options,
  );

  return {
    update: (state: OfficeControlState): void => {
      if (
        previous &&
        previous.zoom === state.zoom &&
        previous.minimumZoom === state.minimumZoom &&
        previous.following === state.following &&
        previous.activity === state.activity &&
        previous.walking === state.walking &&
        previous.talking === state.talking &&
        previous.target === state.target &&
        previous.workers === state.workers &&
        previous.walkers === state.walkers
      )
        return;
      previous = state;
      if (populationSummary)
        populationSummary.textContent = `10 coworkers · 3 mascots · ${state.workers} working · ${state.walkers} walking`;
      if (mascotSelect) mascotSelect.value = state.target;
      if (follow) {
        follow.textContent = `Follow ${MASCOT_NAMES[state.target]}`;
        follow.title = `Follow ${MASCOT_NAMES[state.target]} (F)`;
      }
      if (zoomValue) zoomValue.value = `${Math.round(state.zoom * 100)}%`;
      zoomOut?.toggleAttribute('disabled', state.zoom <= state.minimumZoom);
      zoomIn?.toggleAttribute('disabled', state.zoom >= 4);
      follow?.setAttribute('aria-pressed', String(state.following));
      if (activity && activity.textContent !== state.activity)
        activity.textContent = state.activity;
      if (status)
        status.textContent = state.talking
          ? 'Chatting'
          : state.walking
            ? 'On rounds'
            : 'Taking a moment';
    },
    destroy: (): void => controller.abort(),
  };
};
