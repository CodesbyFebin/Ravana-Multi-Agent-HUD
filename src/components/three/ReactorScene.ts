import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createHudDialTexture, createContactShadowTexture } from './proceduralTextures.ts';
import { AgentStatus } from '../../lib/types.ts';

// Pre-allocated scratch objects to prevent GC in requestAnimationFrame
const _vec3 = new THREE.Vector3();
const _targetColor = new THREE.Color();
const _currentColor = new THREE.Color();

export interface ReactorSceneConfig {
  container: HTMLDivElement;
  onSelectAgent?: (agentIndex: number) => void;
}

export class ReactorScene {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId = 0;
  private isDestroyed = false;

  // 3D Assembly Groups
  private rootGroup!: THREE.Group;
  private outerChassisGroup!: THREE.Group;
  private telemetryRingMesh!: THREE.Mesh;
  private gimbalPitchRing!: THREE.Mesh;
  private gimbalYawRing!: THREE.Mesh;
  private irisBladesGroup!: THREE.Group;
  private coreSphereMesh!: THREE.Mesh;
  private coreWireframeMesh!: THREE.Mesh;
  private particlesMesh!: THREE.Points;
  private agentNodesGroup!: THREE.Group;
  private agentRayLines!: THREE.LineSegments;
  private contactShadowMesh!: THREE.Mesh;

  // Materials for dynamic state & PBR reaction
  private coreMaterial!: THREE.MeshPhysicalMaterial;
  private wireframeMaterial!: THREE.MeshBasicMaterial;
  private neonRingMaterial!: THREE.MeshStandardMaterial;
  private particlesMaterial!: THREE.PointsMaterial;

  // Reactive state
  private currentState: AgentStatus = 'idle';
  private currentAmplitude = 0;
  private targetAmplitude = 0;
  private clock = new THREE.Clock();

  // Mouse / Touch orbit drag damping
  private targetRotX = 0;
  private targetRotY = 0;
  private currentRotX = 0;
  private currentRotY = 0;
  private isPointerDown = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  constructor(config: ReactorSceneConfig) {
    this.container = config.container;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Check headless environment for performance & playwright safety
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    // Scene setup with cybernetic horizon fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060c14, 0.045);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.2, 7.8);
    this.camera.lookAt(0, 0, 0);

    // WebGLRenderer setup conforming to studio directives
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Studio Environment reflection using RoomEnvironment + PMREMGenerator
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
    pmrem.dispose();

    // Lighting rig: Warm Key + Cool Fill HemisphereLight
    const hemiLight = new THREE.HemisphereLight(0x00e5ff, 0x050c18, 0.9);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xa5f3fc, 2.2);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = !isHeadless;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00ffc8, 3.5, 12);
    rimLight.position.set(-4, -2, -3);
    this.scene.add(rimLight);

    // Build the composite 3-12 part procedural model
    this.buildCyberneticReactorAssembly();

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // Bind interaction events
    this.bindEvents();

    // Start render loop
    this.animate();
  }

  private buildCyberneticReactorAssembly() {
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // 1. Armored Outer Chassis Housing (3 concentric dark metallic rings with radial fins)
    this.outerChassisGroup = new THREE.Group();
    const chassisMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c1622,
      roughness: 0.35,
      metalness: 0.88,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });

    const outerRingGeo = new THREE.TorusGeometry(3.2, 0.16, 24, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, chassisMat);
    outerRingMesh.castShadow = true;
    this.outerChassisGroup.add(outerRingMesh);

    // Radial armored perimeter teeth / bolt insets (8 teeth)
    const finGeo = new THREE.BoxGeometry(0.35, 0.6, 0.25);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const fin = new THREE.Mesh(finGeo, chassisMat);
      fin.position.set(Math.cos(angle) * 3.25, Math.sin(angle) * 3.25, 0);
      fin.rotation.z = angle;
      this.outerChassisGroup.add(fin);
    }
    this.rootGroup.add(this.outerChassisGroup);

    // 2. Counter-Rotating Telemetry HUD Dial Ring (Flat Disc with procedural canvas texture)
    const dialTexture = createHudDialTexture(1024);
    dialTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const telemetryGeo = new THREE.RingGeometry(1.9, 3.0, 64);
    const telemetryMat = new THREE.MeshStandardMaterial({
      map: dialTexture,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.telemetryRingMesh = new THREE.Mesh(telemetryGeo, telemetryMat);
    this.telemetryRingMesh.position.z = 0.04;
    this.rootGroup.add(this.telemetryRingMesh);

    // 3. Dual-Axis Gimbal Gyroscope Rings (Pitch & Yaw)
    const gimbalMat = new THREE.MeshStandardMaterial({
      color: 0x162c3e,
      roughness: 0.25,
      metalness: 0.92,
    });
    const pitchGeo = new THREE.TorusGeometry(2.35, 0.08, 16, 64);
    this.gimbalPitchRing = new THREE.Mesh(pitchGeo, gimbalMat);
    this.rootGroup.add(this.gimbalPitchRing);

    const yawGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 64);
    this.gimbalYawRing = new THREE.Mesh(yawGeo, gimbalMat);
    this.rootGroup.add(this.gimbalYawRing);

    // 4. Luminescent Cyan Neon Energy Track
    this.neonRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffc8,
      emissive: 0x00ffc8,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.2,
    });
    const neonTrackGeo = new THREE.TorusGeometry(1.7, 0.045, 16, 48);
    const neonTrackMesh = new THREE.Mesh(neonTrackGeo, this.neonRingMaterial);
    neonTrackMesh.position.z = 0.06;
    this.rootGroup.add(neonTrackMesh);

    // 5. Mechanical Aperture Iris Blades (8 segmented interlocking wedges)
    this.irisBladesGroup = new THREE.Group();
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0.6);
    bladeShape.lineTo(0.9, 1.4);
    bladeShape.lineTo(0.3, 1.7);
    bladeShape.lineTo(-0.4, 1.2);
    bladeShape.closePath();

    const bladeExtrude = new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    const bladeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1420,
      roughness: 0.28,
      metalness: 0.95,
      clearcoat: 0.6,
    });

    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(bladeExtrude, bladeMat);
      blade.rotation.z = (i * Math.PI * 2) / 8;
      blade.position.z = 0.02 * (i % 2);
      this.irisBladesGroup.add(blade);
    }
    this.rootGroup.add(this.irisBladesGroup);

    // 6. Central Energy Singularity (Translucent Glass Orb + Inner Pulsing Icosahedron)
    this.coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x006650,
      emissiveIntensity: 0.4,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      metalness: 0.1,
      ior: 1.6,
      thickness: 1.2,
    });
    const coreGeo = new THREE.SphereGeometry(0.72, 32, 32);
    this.coreSphereMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
    this.rootGroup.add(this.coreSphereMesh);

    // Inner wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(0.55, 1);
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffc8,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    this.coreWireframeMesh = new THREE.Mesh(icoGeo, this.wireframeMaterial);
    this.rootGroup.add(this.coreWireframeMesh);

    // 7. Swarm Agent Constellation Nodes (10 Orbiting Satellites + Ray Lines)
    this.agentNodesGroup = new THREE.Group();
    const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });

    const rayPositions = new Float32Array(10 * 2 * 3); // 10 lines * 2 points * (x,y,z)
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10;
      const radius = 3.8 + (i % 3) * 0.35;
      const node = new THREE.Mesh(nodeGeo, nodeMat.clone());
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (i % 2 === 0 ? 0.3 : -0.3));
      node.userData = { agentIndex: i, baseAngle: angle, radius, speed: 0.4 + (i % 4) * 0.15 };
      this.agentNodesGroup.add(node);

      // Ray start at origin (0,0,0)
      rayPositions[i * 6 + 0] = 0;
      rayPositions[i * 6 + 1] = 0;
      rayPositions[i * 6 + 2] = 0;
      // Ray end at node pos
      rayPositions[i * 6 + 3] = node.position.x;
      rayPositions[i * 6 + 4] = node.position.y;
      rayPositions[i * 6 + 5] = node.position.z;
    }
    this.rootGroup.add(this.agentNodesGroup);

    const rayGeo = new THREE.BufferGeometry();
    rayGeo.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
    const rayMat = new THREE.LineBasicMaterial({
      color: 0x00ffc8,
      transparent: true,
      opacity: 0.35,
    });
    this.agentRayLines = new THREE.LineSegments(rayGeo, rayMat);
    this.rootGroup.add(this.agentRayLines);

    // 8. Cybernetic Telemetry Particle Field (600 particles)
    const particleCount = 600;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 1.2 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 0] = Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = Math.sin(theta) * r;
      particlePositions[i * 3 + 2] = z;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    this.particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffc8,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.particlesMesh = new THREE.Points(particlesGeo, this.particlesMaterial);
    this.rootGroup.add(this.particlesMesh);

    // 9. Soft Contact Grounding Shadow Disc (Pivoted below hero object)
    const shadowTexture = createContactShadowTexture(512);
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.45,
    });
    this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadowMesh.position.y = -3.8;
    this.contactShadowMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.contactShadowMesh);
  }

  private bindEvents() {
    const el = this.container;

    const onPointerDown = (e: PointerEvent) => {
      this.isPointerDown = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;
      // Clamp tilt
      this.targetRotX = Math.max(-0.6, Math.min(0.6, this.targetRotX));
    };

    const onPointerUp = () => {
      this.isPointerDown = false;
    };

    const onResize = () => {
      if (this.isDestroyed || !this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);
  }

  public setVoiceAmplitude(amp: number) {
    this.targetAmplitude = Math.max(0, Math.min(1, amp));
  }

  public setAgentState(state: AgentStatus) {
    this.currentState = state;
  }

  public resetOrientation() {
    this.targetRotX = 0;
    this.targetRotY = 0;
  }

  private animate = () => {
    if (this.isDestroyed) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Exponential camera / orientation damping (1 - Math.exp(-k * dt))
    const dampFactor = 1 - Math.exp(-8 * delta);
    this.currentRotX += (this.targetRotX - this.currentRotX) * dampFactor;
    this.currentRotY += (this.targetRotY - this.currentRotY) * dampFactor;
    this.rootGroup.rotation.x = this.currentRotX;
    this.rootGroup.rotation.y = this.currentRotY;

    // 2. Amplitude exponential damping
    this.currentAmplitude += (this.targetAmplitude - this.currentAmplitude) * (1 - Math.exp(-12 * delta));

    // 3. Status-dependent color & animation kinetics
    let stateColorHex = 0x00ffc8; // Default idle cyan
    let speedMult = 1.0;
    let coreGlow = 0.4;

    switch (this.currentState) {
      case 'listening':
        stateColorHex = 0x00f0ff;
        speedMult = 1.5;
        coreGlow = 0.95;
        break;
      case 'thinking':
        stateColorHex = 0xffaa00; // Amber
        speedMult = 2.4;
        coreGlow = 0.85;
        break;
      case 'acting':
        stateColorHex = 0x00ff88; // Neon green
        speedMult = 1.8;
        coreGlow = 0.85;
        break;
      case 'debating':
        stateColorHex = 0xd946ef; // Cyber violet
        speedMult = 2.0;
        coreGlow = 0.9;
        break;
      case 'frozen':
        stateColorHex = 0xa5f3fc; // Frosted
        speedMult = 0.05;
        coreGlow = 0.15;
        break;
      case 'idle':
      default:
        stateColorHex = 0x00ffc8;
        speedMult = 0.8;
        coreGlow = 0.4;
        break;
    }

    _targetColor.setHex(stateColorHex);
    _currentColor.lerp(_targetColor, 0.08);

    // Apply color to core, wireframe, and neon track
    this.coreMaterial.color.copy(_currentColor);
    this.wireframeMaterial.color.copy(_currentColor);
    this.neonRingMaterial.emissive.copy(_currentColor);
    this.particlesMaterial.color.copy(_currentColor);

    // 4. Kinetic Rotations of procedural sub-components
    if (this.telemetryRingMesh) {
      this.telemetryRingMesh.rotation.z -= delta * 0.15 * speedMult;
    }
    if (this.outerChassisGroup) {
      this.outerChassisGroup.rotation.z += delta * 0.06 * speedMult;
    }
    if (this.gimbalPitchRing) {
      this.gimbalPitchRing.rotation.x = Math.sin(elapsedTime * 0.8 * speedMult) * 0.35;
      this.gimbalPitchRing.rotation.z += delta * 0.2 * speedMult;
    }
    if (this.gimbalYawRing) {
      this.gimbalYawRing.rotation.y = Math.cos(elapsedTime * 0.7 * speedMult) * 0.35;
      this.gimbalYawRing.rotation.z -= delta * 0.25 * speedMult;
    }
    if (this.coreWireframeMesh) {
      this.coreWireframeMesh.rotation.x += delta * 0.8 * speedMult;
      this.coreWireframeMesh.rotation.y += delta * 1.1 * speedMult;
    }

    // 5. Breathing & Voice Reactive Pulse on Core Singularity
    const breathPulse = Math.sin(elapsedTime * 2.5 * speedMult) * 0.05;
    const voiceScale = 1.0 + breathPulse + this.currentAmplitude * 0.35;
    this.coreSphereMesh.scale.set(voiceScale, voiceScale, voiceScale);
    this.coreWireframeMesh.scale.set(voiceScale, voiceScale, voiceScale);
    this.coreMaterial.emissiveIntensity = coreGlow + this.currentAmplitude * 0.5;

    // 6. Aperture Iris blade expansion
    const irisExpansion = 0.05 + this.currentAmplitude * 0.15 + (this.currentState === 'thinking' ? 0.08 : 0);
    this.irisBladesGroup.rotation.z = Math.sin(elapsedTime * 0.4) * 0.1 + irisExpansion;

    // 7. Swarm Agent orbital kinematics & line rays
    if (this.agentNodesGroup && this.agentRayLines) {
      const rayAttr = this.agentRayLines.geometry.attributes.position as THREE.BufferAttribute;
      const positions = rayAttr.array as Float32Array;

      this.agentNodesGroup.children.forEach((child, idx) => {
        const uData = child.userData;
        const currentAngle = uData.baseAngle + elapsedTime * uData.speed * speedMult;
        child.position.x = Math.cos(currentAngle) * uData.radius;
        child.position.y = Math.sin(currentAngle) * uData.radius;
        child.rotation.x += delta * 1.5;
        child.rotation.y += delta * 2.0;

        // Update ray end position
        positions[idx * 6 + 3] = child.position.x;
        positions[idx * 6 + 4] = child.position.y;
        positions[idx * 6 + 5] = child.position.z;
      });

      rayAttr.needsUpdate = true;
    }

    // 8. Particle vortex
    if (this.particlesMesh) {
      this.particlesMesh.rotation.z += delta * 0.08 * speedMult;
      this.particlesMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);

    // Dispose geometries & materials
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    });

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
