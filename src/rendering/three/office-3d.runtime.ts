import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  OfficePopulationSystem,
  MASCOT_IDS,
  MASCOT_NAMES,
  type MascotId,
} from '../../simulation/characters/office-population.system';
import { COWORKERS } from '../../simulation/characters/coworker-roster';
import { bindOfficeControls } from '../../ui/office-camera';
import { createMascotSpeech } from '../../ui/mascot-speech';
import { createOfficeModel } from './office-model';
import { createHumanModel, createMascotModel } from './character-models';

export const createOffice3D = (parent: HTMLElement, onFailure: () => void) => {
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
  });
  // RenderPixelatedPass uses half-float scene/normal buffers. Recover to the
  // legacy view rather than risk an incomplete framebuffer on older GPUs.
  if (!renderer.extensions.has('EXT_color_buffer_float')) {
    renderer.dispose();
    throw new Error('Pixel-art rendering requires float color buffers.');
  }
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.classList.add('office-3d');
  renderer.domElement.title = 'Drag to rotate · right-drag to pan · scroll or pinch to zoom';
  parent.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x172a32);
  const viewHeight = 22;
  const camera = new THREE.OrthographicCamera(-16, 16, 11, -11, 0.1, 160);
  const composer = new EffectComposer(renderer);
  const pixelPass = new RenderPixelatedPass(3, scene, camera, {
    normalEdgeStrength: 0.35,
    depthEdgeStrength: 0.55,
  });
  const outputPass = new OutputPass();
  composer.addPass(pixelPass);
  composer.addPass(outputPass);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.minDistance = 4;
  controls.maxDistance = 70;
  controls.minZoom = 0.35;
  controls.maxZoom = 6;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.screenSpacePanning = false;
  scene.add(new THREE.HemisphereLight(0xe4f4f2, 0x667468, 1.5));
  const sunlight = new THREE.DirectionalLight(0xffe7c2, 2.2);
  sunlight.position.set(5, 22, 10);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, {
    left: -22,
    right: 22,
    top: 22,
    bottom: -22,
    near: 1,
    far: 60,
  });
  sunlight.shadow.normalBias = 0.035;
  sunlight.target.position.set(12, 0, 8);
  scene.add(sunlight, sunlight.target);
  const room = createOfficeModel(scene);
  const people = COWORKERS.map((_, index) => createHumanModel(index));
  const mascots = Object.fromEntries(MASCOT_IDS.map((id) => [id, createMascotModel(id)])) as Record<
    MascotId,
    ReturnType<typeof createMascotModel>
  >;
  people.forEach((person) => scene.add(person.root));
  MASCOT_IDS.forEach((id) => scene.add(mascots[id].root));
  const population = new OfficePopulationSystem();
  const speech = createMascotSpeech();
  let selected: MascotId = 'dnake',
    following = false;
  let disposed = false,
    last = performance.now(),
    frame = 0;
  const abort = new AbortController();
  const fit = () => {
    following = false;
    camera.zoom = window.innerWidth / window.innerHeight < 1 ? 0.4 : 1;
    camera.updateProjectionMatrix();
    controls.target.set(12, 0.5, 8.5);
    camera.position
      .copy(controls.target)
      .add(new THREE.Vector3(19, 24, 27).normalize().multiplyScalar(32));
    controls.update();
  };
  const follow = () => {
    following = true;
    camera.zoom = 2.2;
    camera.updateProjectionMatrix();
    const point = mascots[selected].root.position.clone().add(new THREE.Vector3(0, 0.8, 0));
    controls.target.copy(point);
    camera.position.copy(point).add(new THREE.Vector3(6, 7, 8));
    controls.update();
  };
  const ui = bindOfficeControls({
    select: (id) => {
      selected = id;
      if (following) follow();
    },
    zoom: (steps) => {
      camera.zoom = THREE.MathUtils.clamp(camera.zoom * Math.pow(1.22, steps), 0.35, 6);
      camera.updateProjectionMatrix();
      controls.update();
    },
    fit,
    follow,
  });
  controls.addEventListener('start', () => {
    following = false;
  });
  const resize = () => {
    const width = parent.clientWidth,
      height = parent.clientHeight;
    renderer.setSize(width, height);
    const aspect = width / height;
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    pixelPass.setPixelSize(Math.max(2, Math.floor(height / 360)));
    composer.setSize(width, height);
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize, { signal: abort.signal });
  resize();
  fit();
  const initial = population.snapshot();
  MASCOT_IDS.forEach((id) => mascots[id].update(initial[id], false, 0));
  if (window.innerWidth < 640) follow();
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    abort.abort();
    controls.dispose();
    ui.destroy();
    speech.destroy();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((item) => materials.add(item));
      }
    });
    geometries.forEach((item) => item.dispose());
    materials.forEach((item) => {
      if (item instanceof THREE.MeshBasicMaterial) item.map?.dispose();
      item.dispose();
    });
    sunlight.shadow.dispose();
    pixelPass.dispose();
    outputPass.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
  const fail = () => {
    destroy();
    onFailure();
  };
  renderer.domElement.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      fail();
    },
    { signal: abort.signal },
  );
  const render = (now: number) => {
    if (disposed) return;
    try {
      const delta = document.hidden ? 0 : Math.min(Math.max(0, now - last), 250);
      last = now;
      const states = population.advance(delta);
      people.forEach((person, index) => person.update(states.coworkers[index]!, now));
      MASCOT_IDS.forEach((id) => mascots[id].update(states[id], states[id].talking, now));
      if (following) {
        const next = mascots[selected].root.position.clone().add(new THREE.Vector3(0, 0.8, 0));
        const movement = next.clone().sub(controls.target);
        camera.position.add(movement);
        controls.target.copy(next);
      }
      controls.update();
      // Camera-facing walls become cutaways so orbiting never hides the room.
      room.north.visible = camera.position.z > 0;
      room.west.visible = camera.position.x > 0;
      ui.update({
        target: selected,
        zoom: camera.zoom,
        minimumZoom: 0.35,
        maximumZoom: 6,
        following,
        activity: states[selected].activity,
        walking: states[selected].walking,
        talking: states[selected].talking,
        workers: states.coworkers.filter((p) => p.working).length,
        walkers: states.coworkers.filter((p) => p.walking).length,
      });
      const speaker = MASCOT_IDS.find((id) => states[id].speech);
      if (speaker) {
        const position = mascots[speaker].root.position
          .clone()
          .add(new THREE.Vector3(0, 2.5, 0))
          .project(camera);
        speech.update(
          position.z < 1 && position.z > -1 && Math.abs(position.x) < 1 && Math.abs(position.y) < 1
            ? {
                name: MASCOT_NAMES[speaker],
                text: states[speaker].speech!,
                x: ((position.x + 1) * parent.clientWidth) / 2,
                headY: ((1 - position.y) * parent.clientHeight) / 2,
                left: 12,
                top: 100,
                width: parent.clientWidth - 24,
                bottom: parent.clientHeight - 130,
              }
            : null,
        );
      } else speech.update(null);
      composer.render();
      frame = requestAnimationFrame(render);
    } catch (error) {
      console.error('3D office rendering failed', error);
      fail();
    }
  };
  frame = requestAnimationFrame(render);
  return { destroy };
};
