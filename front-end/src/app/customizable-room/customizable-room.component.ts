import {Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {NgIf} from '@angular/common';
import * as THREE from 'three';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {EditComponent} from "../components/edit/edit.component";
import {FermerComponent} from "../components/fermer/fermer.component";
import {PenSquareComponent} from "../components/pen-square/pen-square.component";
import {MenuBurgerComponent} from "../components/menu-burger/menu-burger.component";
import {ActionBtnComponent} from "../action-btn/action-btn.component";
import {BrainComponent} from "../components/brain/brain.component";

@Component({
  selector: 'app-customizable-room',
  standalone: true,
  imports: [
    NgIf,
    ActionBtnComponent,
    EditComponent,
    FermerComponent,
    PenSquareComponent,
    MenuBurgerComponent,
    ActionBtnComponent
  ],
  templateUrl: './customizable-room.component.html',
  styleUrl: './customizable-room.component.scss'
})
export class CustomizableRoomComponent {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement> | undefined;

  // Three.js properties
  scene: THREE.Scene | undefined;
  camera: THREE.PerspectiveCamera | undefined;
  renderer: THREE.WebGLRenderer | undefined;
  controls: PointerLockControls | undefined;

  // Room props
  roomModel: THREE.Group | undefined;
  colliders: THREE.Mesh[] = [];
  objectsMap = new Map<string, THREE.Object3D>(); // For quick access to modifiable objects

  // Movement
  controlsActive = true;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  velocity = new THREE.Vector3();
  cameraYawLimits = { min: -Math.PI / 2, max: Math.PI / 2 }; // Limit to -90° to 0°

  // Vectors for movement calculations
  moveDirection = new THREE.Vector3();
  forward = new THREE.Vector3();
  right = new THREE.Vector3();

  // View constraints (walls the camera is facing)
  frontWall: THREE.Mesh | undefined;
  rightWall: THREE.Mesh | undefined;

  // Edit mode
  isModificationMode: boolean = false;
  selectedObject: THREE.Object3D | null = null;
  isDragging = false;
  dragStart = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  camHeight: number = 8;

  toggleModificationMode = () => {
    this.isModificationMode = !this.isModificationMode;
    console.log('Modification mode:', this.isModificationMode ? 'ON' : 'OFF');

    // If we're exiting modification mode, deselect the object
    if (!this.isModificationMode) {
      this.selectedObject = null;
    }

    // Toggle controls based on the mode
    if (this.isModificationMode) {
      this.controls?.unlock();
    }
  }

  rotateObject(angle: number) {
    if (!this.selectedObject) return;

    // Apply rotation around the Y axis
    this.selectedObject.rotation.y += angle;
  }

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initThree();
    this.loadRoom();

    // Load additional models after the room is initialized
    this.loadInitialModels();

    this.setupEventListeners();

    // Run animation loop outside Angular's change detection
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup - using perspective for first person view
    this.camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.5,
        100
    );
    this.camera.position.set(0, this.camHeight, 0); // Starting position at height 5

    // Lighting setup with shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Reduced ambient light intensity
    this.scene?.add(ambientLight);

    // Add directional light (sun-like) for main shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    // Configure shadow properties for better quality
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.0005;

    // For directional light, set up the shadow camera frustum
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene?.add(directionalLight);

    // Add a few point lights for more dynamic lighting
    const pointLights = [
      { position: [0, 7, 0], intensity: 1.2, distance: 20, shadowMapSize: 1024 },
      { position: [5, 5, 5], intensity: 0.8, distance: 15, shadowMapSize: 1024 },
      { position: [-5, 5, -5], intensity: 0.8, distance: 15, shadowMapSize: 1024 }
    ];

    pointLights.forEach(light => {
      const pointLight = new THREE.PointLight(
          0xffffff,
          light.intensity,
          light.distance
      );
      pointLight.position.set(light.position[0], light.position[1], light.position[2]);
      pointLight.castShadow = true;
      pointLight.shadow.mapSize.width = light.shadowMapSize;
      pointLight.shadow.mapSize.height = light.shadowMapSize;
      pointLight.shadow.bias = -0.0005;
      this.scene?.add(pointLight);
    });

    // Add a subtle hemisphere light for better global illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040, 0.6);
    hemiLight.position.set(0, 10, 0);
    this.scene?.add(hemiLight);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef?.nativeElement,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add this to your initThree() method
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    this.controls = new PointerLockControls(this.camera, this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  updateMaterialsForLighting() {
    if (!this.roomModel) return;

    // Debug info
    console.log("Updating materials for lighting...");

    this.roomModel.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        console.log(`Processing mesh: ${object.name}`);

        // Helper function to update a material
        const updateMaterial = (material: THREE.Material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            // Make sure material receives light properly
            material.roughness = 0.7;
            material.metalness = 0.1;

            // Add emissive property to ensure minimum visibility
            material.emissive.set(0x202020);

            // Ensure the material updates
            material.needsUpdate = true;

            console.log(`Updated material for ${object.name}`);
          } else if (material instanceof THREE.MeshBasicMaterial) {
            // Convert to MeshStandardMaterial to respond to lighting
            const color = material.color.clone();
            const newMaterial = new THREE.MeshStandardMaterial({
              color: '#0ff1f0',
              roughness: 0.7,
              metalness: 0.1,
              emissive: new THREE.Color(0x202020)
            });
            return newMaterial;
          }
          return material;
        };

        // Handle both single materials and material arrays
        if (Array.isArray(object.material)) {
          object.material = object.material.map(updateMaterial);
        } else if (object.material) {
          object.material = updateMaterial(object.material);
        }

        // Ensure object receives shadows
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    console.log("Material update complete");
  }

  loadRoom() {
    const loader = new GLTFLoader();
    loader.load(
        '/assets/glb/room_rock.glb', // Updated model path
        (gltf) => {
          this.roomModel = gltf.scene;
          // @ts-ignore
          this.scene?.add(this.roomModel);

          gltf.scene.rotation.set(0, 0, 0); // Reset rotation
          gltf.scene.position.set(0, 0, 0); // Center the model

          // Set camera position and lookAt with updated Y values
          this.camera?.position.set(1, this.camHeight, 1);
          this.camera?.lookAt(0, this.camHeight, 0);

          // Process the model to set up colliders and identify walls
          this.setupRoom();
          this.updateMaterialsForLighting();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
        }
    );
  }

  loadModel(modelName: string, position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
            scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
            rotation: THREE.Euler = new THREE.Euler(0, 0, 0)) {

    const loader = new GLTFLoader();
    const modelPath = `/assets/glb/${modelName}.glb`;

    loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;

          // Apply position, scale and rotation
          model.position.copy(position);
          model.scale.copy(scale);
          model.rotation.copy(rotation);

          // Set a unique name for the entire model to make it identifiable
          model.name = `${modelName}_${Date.now()}`;

          // Apply shadows to all meshes in the model
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;

              // Add mesh to colliders array if it's not a wall (we don't want to move walls)
              if (!object.name.includes('Wall') && !object.name.includes('Floor')) {
                this.colliders.push(object);
              }

              // Store in objectsMap for later material modifications
              if (object.name) {
                this.objectsMap.set(object.name, object);
                console.log(`Added object: ${object.name} from model: ${modelName}`);
              }
            }
          });

          // Store the whole model in our objectsMap for selection
          this.objectsMap.set(model.name, model);

          // Add to scene
          this.scene?.add(model);
          console.log(`Loaded model: ${modelName} at position:`, position);
        },
        (xhr) => {
          console.log(`${modelName}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (error) => {
          console.error(`Error loading model ${modelName}:`, error);
        }
    );
  }

  setupRoom() {
    this.scene?.traverse((object) => {
      // Store object by name for later material modifications
      if (object.name) {
        this.objectsMap.set(object.name, object);
        console.log('Found object:', object.name);
      }

      // Set up colliders for walls and furniture
      if (object instanceof THREE.Mesh) {
        // Identify walls for camera constraints
        if (object.name === 'FrontWall') {
          this.frontWall = object;
        }
        else if (object.name === 'RightWall') {
          this.rightWall = object;
        }

        // Only add walls and floors to colliders, movable objects will be added separately
        if (object.name.includes('Wall') || object.name.includes('Floor')) {
          this.colliders.push(object);
        }
      }
    });
  }

  setupEventListeners() {
    // Handle pointer lock changes
    this.controls?.addEventListener('lock', () => {
      this.ngZone.run(() => {
        this.controlsActive = true;
      });
    });

    this.controls?.addEventListener('unlock', () => {
      this.ngZone.run(() => {
        this.controlsActive = false;
      });
    });

    // Keyboard controls
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));

    // Mouse events for object selection and manipulation
    this.renderer?.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    document.addEventListener('mouseup', () => this.onMouseUp());

    // Keyboard shortcuts for rotation in edit mode
    document.addEventListener('keydown', (event) => {
      if (this.isModificationMode && this.selectedObject) {
        if (event.code === 'KeyR') {
          this.rotateObject(-Math.PI / 16); // Rotate counterclockwise
        } else if (event.code === 'KeyT') {
          this.rotateObject(Math.PI / 16); // Rotate clockwise
        }
      }
    });
  }

  // Explicitly handle the click to start exploring
  startExploring() {
    console.log('Starting exploration');
    if (!this.isModificationMode && this.controls) {
      this.controls.lock();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.controlsActive) return;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (!this.controlsActive) return;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  onMouseDown(event: MouseEvent) {
    if (!this.isModificationMode) return;

    // Convert mouse coordinates to normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set up the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera!);

    // Find intersected objects (excluding walls and floor)
    const intersects = this.raycaster.intersectObjects(this.scene!.children, true)
        .filter(intersect => {
          // Check if the object or its parent has a name that doesn't include 'Wall' or 'Floor'
          let obj = intersect.object;
          while (obj) {
            if (obj.name && (obj.name.includes('Wall') || obj.name.includes('Floor'))) {
              return false;
            }
            obj = obj.parent!;
          }
          return true;
        });

    if (intersects.length > 0) {
      // Find the parent model of the clicked object
      let selectedObj = intersects[0].object;

      // Walk up the parent chain to find the root model
      while (selectedObj.parent && selectedObj.parent !== this.scene) {
        selectedObj = selectedObj.parent;
      }

      // If it's not a wall or floor, we can select it
      if (!selectedObj.name?.includes('Wall') && !selectedObj.name?.includes('Floor')) {
        this.selectedObject = selectedObj;
        this.isDragging = true;
        this.dragStart.set(event.clientX, event.clientY);
        console.log('Selected object:', this.selectedObject.name);
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isModificationMode || !this.isDragging || !this.selectedObject) return;

    // Calculate mouse movement
    const deltaX = (event.clientX - this.dragStart.x) * 0.01;
    const deltaZ = (event.clientY - this.dragStart.y) * 0.01;

    // Move object in the camera plane
    this.moveObjectInCameraPlane(deltaX, deltaZ);

    // Update drag start position
    this.dragStart.set(event.clientX, event.clientY);
  }

  onMouseUp() {
    this.isDragging = false;
    // Note: We don't clear the selectedObject here so we can still rotate it
  }

  moveObjectInCameraPlane(deltaX: number, deltaZ: number) {
    if (!this.selectedObject || !this.camera) return;

    // Get camera direction vectors
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; // Restrict to XZ plane
    forward.normalize();

    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    // Calculate movement vector
    const movement = new THREE.Vector3()
        .addScaledVector(right, deltaX)
        .addScaledVector(forward, -deltaZ);

    // Apply movement
    this.selectedObject.position.add(movement);
  }

  onWindowResize() {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer?.setSize(window.innerWidth, window.innerHeight);
  }

  // Check for collisions with walls and objects
  checkCollisions(position: THREE.Vector3): boolean {
    // Simple collision detection using raycasting
    const playerHeight = this.camHeight;
    const playerRadius = 1;

    // Rays in different directions from player position
    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(1, 0, 1).normalize(),
      new THREE.Vector3(-1, 0, 1).normalize(),
      new THREE.Vector3(1, 0, -1).normalize(),
      new THREE.Vector3(-1, 0, -1).normalize()
    ];

    const raycaster = new THREE.Raycaster();

    for (const direction of directions) {
      raycaster.set(
          new THREE.Vector3(position.x, position.y - playerHeight / 2, position.z),
          direction
      );

      const intersects = raycaster.intersectObjects(this.colliders);
      if (intersects.length > 0 && intersects[0].distance < playerRadius) {
        return true; // Collision detected
      }
    }

    return false; // No collision
  }

  // Restrict camera rotation to prevent seeing beyond walls
  constrainCameraView() {
    if (!this.camera) return;

    // Get the current camera rotation
    const rotation = new THREE.Euler().setFromQuaternion(this.camera.quaternion);

    // Clamp the y-rotation (yaw) within the allowed range
    if (rotation.y < this.cameraYawLimits.min) {
      rotation.y = this.cameraYawLimits.min;
      this.camera.quaternion.setFromEuler(rotation);
    } else if (rotation.y > this.cameraYawLimits.max) {
      rotation.y = this.cameraYawLimits.max;
      this.camera.quaternion.setFromEuler(rotation);
    }
  }

  loadInitialModels() {
    // Use setTimeout to ensure the room is fully loaded first
    setTimeout(() => {
      // Load furniture at specified positions
      this.loadModel('couch', new THREE.Vector3(5, 2, 5));
      this.loadModel('bed', new THREE.Vector3(5, 2, 15));
      // this.loadModel('desk', new THREE.Vector3(-5, 0, 5), new THREE.Vector3(1, 1, 1), new THREE.Euler(0, Math.PI/2, 0));
      // this.loadModel('chair', new THREE.Vector3(-5, 0, 7));
    }, 1000); // 1-second delay to ensure the room is loaded
  }

  animate() {
    const clock = new THREE.Clock();

    const animateLoop = () => {
      requestAnimationFrame(animateLoop);

      const delta = clock.getDelta();

      // Handle movement
      if (this.controls && this.controls.isLocked) {
        this.moveDirection.set(0, 0, 0);

        if (this.moveForward) this.moveDirection.z += 1;
        if (this.moveBackward) this.moveDirection.z -= 1;
        if (this.moveLeft) this.moveDirection.x -= 1;
        if (this.moveRight) this.moveDirection.x += 1;

        this.moveDirection.normalize();

        this.forward.setFromMatrixColumn(this.camera!.matrix, 0);
        this.forward.crossVectors(this.camera!.up, this.forward);

        this.right.setFromMatrixColumn(this.camera!.matrix, 0);

        const moveX = this.right.clone().multiplyScalar(this.moveDirection.x);
        const moveZ = this.forward.clone().multiplyScalar(this.moveDirection.z);

        const move = moveX.add(moveZ).multiplyScalar(5 * delta); // Adjust speed here

        const newPosition = this.camera!.position.clone().add(move);

        if (!this.checkCollisions(newPosition)) {
          this.camera!.position.copy(newPosition);
        }
      }

      // Highlight selected object in edit mode
      if (this.isModificationMode && this.selectedObject) {
        // We could add visual cues here to highlight the selected object
      }

      // Clear before rendering
      this.renderer?.clear();

      // Render scene
      this.renderer?.render(this.scene!, this.camera!);
    };

    animateLoop();
  }

  protected readonly FermerComponent = FermerComponent;
  protected readonly PenSquareComponent = PenSquareComponent;
  protected readonly BrainComponent = BrainComponent;
  protected readonly EditComponent = EditComponent;
  protected readonly alert = alert;
}
