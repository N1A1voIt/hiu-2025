import {Component, ElementRef, OnInit, ViewChild, NgZone, AfterViewInit} from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

@Component({
  selector: 'app-child-room',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './child-room.component.html',
  styleUrl: './child-room.component.scss'
})
export class ChildRoomComponent implements OnInit{
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('colorInput') colorInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('debugCanvas') debugCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  private src!: any;
  private gray!: any;
  private thresh!: any;
  private streaming = false;
  private animationId!: number;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  bedModel: THREE.Group | undefined;
  selectedObject: THREE.Object3D | null = null;
  dragStart = new THREE.Vector2();
  isDragging = false;
  rotationAmount = 0;

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
  controlsActive = false;
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

  // Color picker state
  colorPickerVisible = false;

  isModificationMode: boolean = false;

  toggleModificationMode() {
    this.isModificationMode = !this.isModificationMode;
    console.log('Modification mode:', this.isModificationMode ? 'ON' : 'OFF');
  }

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initThree();
    this.loadRoom();

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
      75,
      window.innerWidth / window.innerHeight,
      0.5,
      100
    );
    this.camera.position.set(0, 5, 0); // Starting position at height 5

    // Replace the entire lighting section in your initThree() method with this:
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

    // Add helpers for development
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene?.add(gridHelper);

    window.addEventListener('resize', () => this.onWindowResize());

    // this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  // Add this method to your component
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
      '/assets/glb/full_room.glb', // Updated model path
      (gltf) => {
        this.roomModel = gltf.scene;
        // @ts-ignore
        this.scene?.add(this.roomModel);

        gltf.scene.rotation.set(0, 0, 0); // Reset rotation
        gltf.scene.position.set(0, 0, 0); // Center the model

        // Set camera position and lookAt with updated Y values
        this.camera?.position.set(1, 5, 1); // Equal distance on all axes, with y=5
        this.camera?.lookAt(0, 5, 0); // Looking at y=5

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

  loadBed() {
    const loader = new GLTFLoader();
    loader.load(
        '/assets/glb/bed.glb',
        (gltf) => {
          this.bedModel = gltf.scene;
          this.scene?.add(this.bedModel);

          this.bedModel.position.set(0, 2, 0);
          this.bedModel.castShadow = true;
          this.bedModel.receiveShadow = true;

          // Ajouter le lit à la map des objets
          this.objectsMap.set('bed', this.bedModel);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded for bed');
        },
        (error) => {
          console.error('Error loading model:', error);
        }
    );
  }

  setupRoom() {
    // Process all objects in the room
    // @ts-ignore
    this.loadBed();
    this.roomModel?.traverse((object) => {
      // if (object instanceof THREE.Mesh) {
      //   if (Array.isArray(object.material)) {
      //     object.material.forEach(mat => {
      //       if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
      //         mat.emissive.set(0x111111); // Slight self-illumination
      //         mat.needsUpdate = true;
      //       }
      //     });
      //   } else if (object.material instanceof THREE.MeshStandardMaterial ||
      //       object.material instanceof THREE.MeshPhongMaterial) {
      //     object.material.emissive.set(0x111111);
      //     object.material.needsUpdate = true;
      //   }
      // }

      // Store object by name for later material modifications
      if (object.name) {
        this.objectsMap.set(object.name, object);

        // Log available objects during setup for debugging
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

        // Add to colliders list if it should have collision
        if (object.name.includes('Wall') ||
          object.name.includes('Floor') ||
          object.name.includes('Furniture')) {
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

    this.renderer?.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    document.addEventListener('mouseup', () => this.onMouseUp());

    // Ajouter un gestionnaire pour la rotation avec les touches R et T
    document.addEventListener('keydown', (event) => {
      if (this.isModificationMode && this.selectedObject) {
        if (event.code === 'KeyR') {
          this.rotateBed(-Math.PI / 16); // Rotation dans le sens anti-horaire
        } else if (event.code === 'KeyT') {
          this.rotateBed(Math.PI / 16); // Rotation dans le sens horaire
        }
      }
    });
  }

  // Explicitly handle the click to start exploring
  startExploring() {
    console.log('Starting exploration');
    if (!this.colorPickerVisible && this.controls) {
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

  onWindowResize() {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer?.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseDown(event: MouseEvent) {
    if (!this.isModificationMode) return;

    // Convertir les coordonnées de la souris en coordonnées normalisées (-1 à 1)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Lancer un rayon depuis la caméra
    this.raycaster.setFromCamera(this.mouse, this.camera!);

    // Vérifier si le lit est touché
    const intersects = this.raycaster.intersectObject(this.bedModel!, true);

    if (intersects.length > 0) {
      // Désactiver les contrôles de caméra pendant le déplacement
      if (this.controls?.isLocked) {
        this.controls.unlock();
      }

      // @ts-ignore
      this.selectedObject = this.bedModel;
      this.isDragging = true;
      this.dragStart.set(event.clientX, event.clientY);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isModificationMode || !this.isDragging || !this.selectedObject) return;

    // Calculer le déplacement de la souris
    const deltaX = (event.clientX - this.dragStart.x) * 0.01;
    const deltaZ = (event.clientY - this.dragStart.y) * 0.01;

    // Déplacer l'objet dans le plan XZ en fonction de l'orientation de la caméra
    this.moveObjectInCameraPlane(deltaX, deltaZ);

    // Mettre à jour le point de départ pour le prochain mouvement
    this.dragStart.set(event.clientX, event.clientY);
  }

  onMouseUp() {
    this.isDragging = false;
    this.selectedObject = null;
  }

  moveObjectInCameraPlane(deltaX: number, deltaZ: number) {
    if (!this.selectedObject || !this.camera) return;

    // Obtenir les vecteurs de direction de la caméra
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; // Restreindre au plan XZ
    forward.normalize();

    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    // Calculer le vecteur de déplacement
    const movement = new THREE.Vector3()
        .addScaledVector(right, deltaX)
        .addScaledVector(forward, -deltaZ);

    // Appliquer le déplacement
    this.selectedObject.position.add(movement);
  }

  rotateBed(angle: number) {
    if (!this.bedModel) return;

    // Appliquer la rotation autour de l'axe Y
    this.bedModel.rotation.y += angle;

    // Mettre à jour la rotation totale pour référence
    this.rotationAmount = (this.rotationAmount + angle) % (Math.PI * 2);
  }

  // Check for collisions with walls and objects
  checkCollisions(position: THREE.Vector3): boolean {
    // Simple collision detection using raycasting
    const playerHeight = 1.7;
    const playerRadius = 0.5; // Increased radius for better collision detection

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

  // Toggle color picker visibility
  toggleColorPicker(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.ngZone.run(() => {
      this.colorPickerVisible = !this.colorPickerVisible;

      // If controls are active, deactivate them when showing color picker
      if (this.colorPickerVisible && this.controlsActive) {
        this.controls?.unlock();
      }
    });
  }

  // Change the floor color
  changeFloorColor(color: string) {
    console.log('Changing floor color to:', color);
    this.setObjectColor('SM_Floor', color);
  }

  // Method to change object material colors
  setObjectColor(objectName: string, color: THREE.Color | number | string) {
    const object = this.objectsMap.get(objectName);

    if (object && object instanceof THREE.Mesh) {
      // Check if material is an array
      if (Array.isArray(object.material)) {
        object.material.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.color.set(color);
          }
        });
      }
      // Single material
      else if (object.material instanceof THREE.MeshStandardMaterial) {
        object.material.color.set(color);
      }
    } else {
      // Try finding objects that contain the name (for objects like "SM_Floor_01", etc.)
      const floorObjects = Array.from(this.objectsMap.keys())
        .filter(key => key.includes(objectName));

      if (floorObjects.length > 0) {
        console.log('Found floor objects:', floorObjects);
        floorObjects.forEach(key => {
          const obj = this.objectsMap.get(key);
          if (obj && obj instanceof THREE.Mesh) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.color.set(color);
                }
              });
            } else if (obj.material instanceof THREE.MeshStandardMaterial) {
              obj.material.color.set(color);
            }
          }
        });
      } else {
        console.warn(`Object "${objectName}" not found or is not a mesh`);
      }
    }
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

      // Clear before rendering
      this.renderer?.clear();

      // Render scene
      this.renderer?.render(this.scene!, this.camera!);
    };

    animateLoop();
  }

  protected readonly Math = Math;
}
