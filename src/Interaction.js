import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class Interaction {
    constructor(camera, scene, drawers) {
        this.camera = camera;
        this.scene = scene;
        this.drawers = drawers;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.diamond = null;
        this.findDiamond();

        this.initEvents();
    }

    findDiamond() {
        for (const drawer of this.drawers) {
            drawer.traverse((child) => {
                if (child.userData.isDiamond) {
                    this.diamond = child;
                }
            });
        }
    }

    initEvents() {
        window.addEventListener('click', (event) => this.onClick(event));
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        let hovered = false;
        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                let obj = intersects[i].object;
                while (obj.parent && obj.parent !== this.scene) {
                    if (obj.userData && obj.userData.isDrawer) {
                        hovered = true;
                        break;
                    }
                    obj = obj.parent;
                }
                if (hovered) break;
            }
        }

        document.body.style.cursor = hovered ? 'pointer' : 'default';
    }

    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;

            // Check for Diamond Click
            if (object.userData.isDiamond) {
                window.location.href = 'asgard.html';
                return;
            }

            let targetDrawer = null;
            let obj = object;

            // Traverse up to find the drawer group
            while (obj.parent && obj.parent !== this.scene) {
                if (obj.userData && obj.userData.isDrawer) {
                    targetDrawer = obj;
                    break;
                }
                obj = obj.parent;
            }

            if (targetDrawer) {
                this.toggleDrawer(targetDrawer);
            }
        }
    }

    toggleDrawer(drawer) {
        const isOpen = drawer.userData.isOpen;
        const originalPos = drawer.userData.originalPosition;

        // Close all other drawers
        this.drawers.forEach(d => {
            if (d !== drawer && d.userData.isOpen) {
                this.animateDrawer(d, d.userData.originalPosition, false);
            }
        });

        if (isOpen) {
            this.animateDrawer(drawer, originalPos, false);
            this.resetCamera();
        } else {
            const openPos = originalPos.clone().add(new THREE.Vector3(0, 0, 0.5));
            this.animateDrawer(drawer, openPos, true);
            this.zoomToDrawer(drawer);
        }
    }

    animateDrawer(drawer, targetPos, isOpen) {
        new TWEEN.Tween(drawer.position)
            .to(targetPos, 1000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                drawer.userData.isOpen = isOpen;
            })
            .start();
    }

    zoomToDrawer(drawer) {
        const worldPos = new THREE.Vector3();
        drawer.getWorldPosition(worldPos);

        // Look down into the drawer
        const targetCamPos = worldPos.clone().add(new THREE.Vector3(0, 1.5, 1.5));

        new TWEEN.Tween(this.camera.position)
            .to(targetCamPos, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Tween lookAt target
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).add(this.camera.position);
        const lookAtTarget = { x: currentLookAt.x, y: currentLookAt.y, z: currentLookAt.z };

        new TWEEN.Tween(lookAtTarget)
            .to({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
            })
            .start();
    }

    resetCamera() {
        const targetPos = new THREE.Vector3(1.5, 1.2, 5.5); // Reset to initial position
        new TWEEN.Tween(this.camera.position)
            .to(targetPos, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Reset lookAt to center
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).add(this.camera.position);
        const lookAtTarget = { x: currentLookAt.x, y: currentLookAt.y, z: currentLookAt.z };

        new TWEEN.Tween(lookAtTarget)
            .to({ x: 0, y: 1.2, z: 0 }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
            })
            .start();
    }

    update(delta) {
        TWEEN.update();

        // Sparkle Animation (Rotate Diamond)
        if (this.diamond) {
            this.diamond.rotation.y += delta * 0.5;
            this.diamond.rotation.x += delta * 0.2;
        }
    }
}
