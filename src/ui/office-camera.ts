export interface OfficeCameraActions {
  zoom: (steps: number) => void;
  fit: () => void;
  follow: () => void;
}

export interface OfficeControlState {
  zoom: number;
  minimumZoom: number;
  following: boolean;
  activity: string;
  walking: boolean;
}

export const bindOfficeControls = (actions: OfficeCameraActions) => {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const zoomOut = document.querySelector<HTMLButtonElement>('#zoom-out');
  const zoomIn = document.querySelector<HTMLButtonElement>('#zoom-in');
  const fit = document.querySelector<HTMLButtonElement>('#fit-office');
  const follow = document.querySelector<HTMLButtonElement>('#follow-dnake');
  const zoomValue = document.querySelector<HTMLOutputElement>('#zoom-value');
  const activity = document.querySelector<HTMLElement>('#dnake-activity');
  const status = document.querySelector<HTMLElement>('#dnake-status');
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
        previous.walking === state.walking
      )
        return;
      previous = state;
      if (zoomValue) zoomValue.value = `${Math.round(state.zoom * 100)}%`;
      zoomOut?.toggleAttribute('disabled', state.zoom <= state.minimumZoom);
      zoomIn?.toggleAttribute('disabled', state.zoom >= 4);
      follow?.setAttribute('aria-pressed', String(state.following));
      if (activity && activity.textContent !== state.activity)
        activity.textContent = state.activity;
      if (status) status.textContent = state.walking ? 'On rounds' : 'Taking a moment';
    },
    destroy: (): void => controller.abort(),
  };
};
