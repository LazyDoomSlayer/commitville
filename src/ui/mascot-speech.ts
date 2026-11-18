interface SpeechPresentation {
  name: string;
  text: string;
  x: number;
  headY: number;
  left: number;
  top: number;
  width: number;
  bottom: number;
}

// One live speaker at a time; clamp the bubble to the camera viewport so text
// stays readable while zooming, following a listener or using a narrow display.
export const createMascotSpeech = () => {
  const bubble = document.createElement('div');
  bubble.className = 'mascot-speech';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  const name = document.createElement('strong');
  const line = document.createElement('span');
  bubble.append(name, line);
  bubble.hidden = true;
  document.querySelector('#app')?.append(bubble);
  let previousText = '';
  let previousWidth = 0;
  let height = 0;

  return {
    update: (speech: SpeechPresentation | null): void => {
      if (
        !speech ||
        speech.x < speech.left - 100 ||
        speech.x > speech.left + speech.width + 100 ||
        speech.headY > speech.bottom + 100 ||
        speech.headY < speech.top - 200
      ) {
        bubble.hidden = true;
        return;
      }
      bubble.hidden = false;
      const width = Math.min(250, speech.width - 24);
      const textKey = `${speech.name}:${speech.text}`;
      if (textKey !== previousText || width !== previousWidth) {
        name.textContent = speech.name;
        line.textContent = speech.text;
        bubble.style.width = `${width}px`;
        height = bubble.offsetHeight;
        previousText = textKey;
        previousWidth = width;
      }
      const x = Math.max(
        speech.left + width / 2 + 12,
        Math.min(speech.left + speech.width - width / 2 - 12, speech.x),
      );
      const bottom = Math.max(
        speech.top + height + 8,
        Math.min(speech.bottom - 8, speech.headY - 12),
      );
      bubble.style.left = `${Math.round(x)}px`;
      bubble.style.top = `${Math.round(bottom)}px`;
      bubble.style.setProperty(
        '--speech-tail',
        `${Math.max(14, Math.min(width - 20, speech.x - x + width / 2))}px`,
      );
    },
    destroy: (): void => bubble.remove(),
  };
};
