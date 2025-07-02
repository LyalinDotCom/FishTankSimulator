'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { GenerateFishBehaviorOutput } from '@/lib/types';

type FishObject = {
    group: THREE.Group;
    velocity: THREE.Vector3;
    bob: number;
};

type PlantObject = {
    mesh: THREE.Mesh;
    baseY: Float32Array;
};

interface FishTankProps {
    behaviors: GenerateFishBehaviorOutput;
    tankDimensions: { width: number; height: number; depth: number; };
    customFishImages: string[];
}

export function FishTank({ behaviors, tankDimensions, customFishImages }: FishTankProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const fishRef = useRef<FishObject[]>([]);
    const plantsRef = useRef<PlantObject[]>([]);
    
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.set(0, 5, 15);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0); 
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xA7D9ED, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -tankDimensions.width;
        directionalLight.shadow.camera.right = tankDimensions.width;
        directionalLight.shadow.camera.top = tankDimensions.height;
        directionalLight.shadow.camera.bottom = -tankDimensions.height;
        scene.add(directionalLight);

        // Tank
        const tankGeometry = new THREE.BoxGeometry(tankDimensions.width, tankDimensions.height, tankDimensions.depth);
        const tankMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xA7D9ED,
            transmission: 0.8,
            roughness: 0.1,
            metalness: 0,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
            ior: 1.333
        });
        const tankMesh = new THREE.Mesh(tankGeometry, tankMaterial);
        scene.add(tankMesh);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(tankDimensions.width, tankDimensions.depth);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xF0F8FF, roughness: 0.8 });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -tankDimensions.height / 2;
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI / 2;

        // Plants
        plantsRef.current = [];
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.7 });
        for (let i = 0; i < 15; i++) {
            const height = Math.random() * 4 + 2;
            const plantGeom = new THREE.CylinderGeometry(0.1, 0.2, height, 8, 20);
            const plant = new THREE.Mesh(plantGeom, plantMaterial);
            plant.position.set(
                (Math.random() - 0.5) * (tankDimensions.width - 2),
                -tankDimensions.height / 2 + height / 2,
                (Math.random() - 0.5) * (tankDimensions.depth - 2)
            );
            plant.castShadow = true;
            scene.add(plant);
            const positionAttribute = plant.geometry.attributes.position;
            plantsRef.current.push({ mesh: plant, baseY: new Float32Array(positionAttribute.array) });
        }
        
        // Animation loop
        const clock = new THREE.Clock();
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();
            const currentCamera = cameraRef.current;
            if (!currentCamera) return;
            
            controls.update();
            
            // Animate plants
            plantsRef.current.forEach(plantObj => {
                const { mesh, baseY } = plantObj;
                const position = mesh.geometry.attributes.position;
                for (let i = 0; i < position.count; i++) {
                    const y = baseY[i * 3 + 1];
                    const sway = Math.sin(elapsedTime * 0.5 + y * 0.5) * (y / (mesh.geometry.parameters.height * 2)) * 0.3;
                    position.setX(i, baseY[i*3] + sway);
                }
                position.needsUpdate = true;
            });
            
            // Animate fish
            const halfW = tankDimensions.width / 2 - 0.5;
            const halfH = tankDimensions.height / 2 - 0.5;
            const halfD = tankDimensions.depth / 2 - 0.5;
            
            fishRef.current.forEach(fish => {
                // Movement
                fish.group.position.add(fish.velocity.clone().multiplyScalar(delta));
                fish.group.position.y += Math.sin(elapsedTime * 2 + fish.bob) * 0.005;

                // Tank boundaries
                if (fish.group.position.x > halfW || fish.group.position.x < -halfW) fish.velocity.x *= -1;
                if (fish.group.position.y > halfH || fish.group.position.y < -halfH) fish.velocity.y *= -1;
                if (fish.group.position.z > halfD || fish.group.position.z < -halfD) fish.velocity.z *= -1;

                fish.velocity.add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(0.1));
                fish.velocity.clampLength(1, 2);

                // Orientation and animation
                if ((fish.group as any).isCustom) {
                    fish.group.lookAt(currentCamera.position);
                } else {
                    fish.group.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), fish.velocity.clone().normalize()), 0.1);
                    
                    const tail = fish.group.children[1];
                    if (tail) {
                        tail.rotation.y = Math.sin(elapsedTime * 8) * 0.5;
                    }
                }
            });

            renderer.render(scene, currentCamera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            const currentCamera = cameraRef.current;
            if (currentCamera) {
                currentCamera.aspect = mount.clientWidth / mount.clientHeight;
                currentCamera.updateProjectionMatrix();
            }
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (mount && renderer.domElement) {
              mount.removeChild(renderer.domElement);
            }
            scene.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else if (child.material) {
                        child.material.dispose();
                    }
                }
            });
        };
    }, [tankDimensions]);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene || !behaviors) return;
        
        // Clear old procedural fish
        const proceduralFish = fishRef.current.filter(fish => !(fish.group as any).isCustom);
        proceduralFish.forEach(fish => {
            scene.remove(fish.group);
            fish.group.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else if (child.material) {
                        child.material.dispose();
                    }
                }
            });
        });
        fishRef.current = fishRef.current.filter(fish => (fish.group as any).isCustom);

        // Add new procedural fish
        behaviors.forEach(behavior => {
            const bodyGeom = new THREE.SphereGeometry(0.2, 16, 8);
            const tailGeom = new THREE.ConeGeometry(0.15, 0.4, 8);
            const fishMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                roughness: 0.4,
                metalness: 0.2
            });

            const body = new THREE.Mesh(bodyGeom, fishMaterial);
            body.castShadow = true;
            
            const tail = new THREE.Mesh(tailGeom, fishMaterial);
            tail.position.z = -0.3;
            tail.rotation.x = Math.PI / 2;

            const group = new THREE.Group();
            group.add(body);
            group.add(tail);
            group.position.set(behavior.startPosition.x, behavior.startPosition.y, behavior.startPosition.z);
            scene.add(group);

            fishRef.current.push({
                group,
                velocity: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize().multiplyScalar(1.5),
                bob: Math.random() * Math.PI * 2,
            });
        });
    }, [behaviors]);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const existingCustomFishCount = fishRef.current.filter(f => (f.group as any).isCustom).length;
        if (customFishImages.length <= existingCustomFishCount) {
            return;
        }

        const newImages = customFishImages.slice(existingCustomFishCount);
        const textureLoader = new THREE.TextureLoader();

        newImages.forEach(imageUrl => {
            textureLoader.load(imageUrl, (texture) => {
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide,
                });

                const aspectRatio = texture.image.width / texture.image.height;
                const fishHeight = 1.5;
                const fishWidth = fishHeight * aspectRatio;

                const geometry = new THREE.PlaneGeometry(fishWidth, fishHeight);
                const plane = new THREE.Mesh(geometry, material);
                
                const group = new THREE.Group();
                group.add(plane);
                (group as any).isCustom = true;

                group.position.set(
                    (Math.random() - 0.5) * tankDimensions.width * 0.5,
                    (Math.random() - 0.5) * tankDimensions.height * 0.5,
                    (Math.random() - 0.5) * tankDimensions.depth * 0.5
                );
                scene.add(group);

                fishRef.current.push({
                    group,
                    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(1),
                    bob: Math.random() * Math.PI * 2,
                });
            });
        });
    }, [customFishImages, tankDimensions]);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
}
