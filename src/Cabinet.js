import * as THREE from 'three';

export class Cabinet {
    constructor(scene) {
        this.scene = scene;
        this.drawers = [];
        this.createCabinet();
    }

    createCabinet() {
        // Dimensions
        const width = 2.0;
        const height = 2.5;
        const depth = 0.8;
        const cols = 4;
        const rows = 6;

        // Materials - Darker, richer wood to match the library shelves (Right side)
        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x352015, // Warm dark mahogany/oak
            roughness: 0.4,
            metalness: 0.2,
        });
        const innerMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 }); // Darker inside
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 });

        // Create Hollow Body Group
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = height / 2;
        this.scene.add(bodyGroup);

        const thickness = 0.05;

        // Back Panel
        const backGeo = new THREE.BoxGeometry(width, height, thickness);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.z = -depth / 2 + thickness / 2;
        back.castShadow = true;
        back.receiveShadow = true;
        bodyGroup.add(back);

        // Side Panels
        const sideGeo = new THREE.BoxGeometry(thickness, height, depth);
        const left = new THREE.Mesh(sideGeo, woodMat);
        left.position.x = -width / 2 + thickness / 2;
        left.castShadow = true;
        left.receiveShadow = true;
        bodyGroup.add(left);

        const right = new THREE.Mesh(sideGeo, woodMat);
        right.position.x = width / 2 - thickness / 2;
        right.castShadow = true;
        right.receiveShadow = true;
        bodyGroup.add(right);

        // Top/Bottom Panels
        const tbGeo = new THREE.BoxGeometry(width - thickness * 2, thickness, depth);
        const top = new THREE.Mesh(tbGeo, woodMat);
        top.position.y = height / 2 - thickness / 2;
        top.castShadow = true;
        top.receiveShadow = true;
        bodyGroup.add(top);

        const bottom = new THREE.Mesh(tbGeo, woodMat);
        bottom.position.y = -height / 2 + thickness / 2;
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        bodyGroup.add(bottom);

        // Shelves (Dividers)
        const shelfGeo = new THREE.BoxGeometry(width - thickness * 2, 0.02, depth - 0.05);
        const drawerHeight = (height - thickness * 2) / rows;

        for (let i = 1; i < rows; i++) {
            const shelf = new THREE.Mesh(shelfGeo, innerMat);
            shelf.position.y = -height / 2 + thickness + i * drawerHeight;
            shelf.receiveShadow = true;
            bodyGroup.add(shelf);
        }

        // Drawers
        const drawerW = (width - thickness * 2) / cols;
        const drawerH = drawerHeight;
        const drawerD = depth - thickness;

        const startX = -width / 2 + thickness + drawerW / 2;
        const startY = height / 2 - thickness - drawerH / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Create Hollow Drawer Group
                const dGroup = new THREE.Group();

                // Dimensions for the drawer box
                const dw = drawerW - 0.02; // Gap
                const dh = drawerH - 0.02;
                const dd = drawerD - 0.02;
                const dThick = 0.02;

                // Front Face
                const frontGeo = new THREE.BoxGeometry(dw, dh, dThick);
                const front = new THREE.Mesh(frontGeo, woodMat);
                front.position.z = dd / 2 - dThick / 2;
                front.castShadow = true;
                front.receiveShadow = true;
                dGroup.add(front);

                // Bottom
                const botGeo = new THREE.BoxGeometry(dw, dThick, dd - dThick);
                const bot = new THREE.Mesh(botGeo, innerMat);
                bot.position.y = -dh / 2 + dThick / 2;
                bot.position.z = -dThick / 2;
                bot.receiveShadow = true;
                dGroup.add(bot);

                // Back
                const bkGeo = new THREE.BoxGeometry(dw, dh, dThick);
                const bk = new THREE.Mesh(bkGeo, innerMat);
                bk.position.z = -dd / 2 + dThick / 2;
                bk.receiveShadow = true;
                dGroup.add(bk);

                // Sides
                const sGeo = new THREE.BoxGeometry(dThick, dh, dd - dThick * 2);
                const l = new THREE.Mesh(sGeo, innerMat);
                l.position.x = -dw / 2 + dThick / 2;
                l.receiveShadow = true;
                dGroup.add(l);

                const rt = new THREE.Mesh(sGeo, innerMat);
                rt.position.x = dw / 2 - dThick / 2;
                rt.receiveShadow = true;
                dGroup.add(rt);

                // Handle & Label
                const handleGeo = new THREE.TorusGeometry(0.03, 0.01, 8, 16, Math.PI);
                const handle = new THREE.Mesh(handleGeo, handleMat);
                handle.position.set(0, 0, dd / 2 + 0.01);
                handle.rotation.z = Math.PI / 2;
                handle.castShadow = true;
                dGroup.add(handle);

                const plateGeo = new THREE.PlaneGeometry(0.08, 0.05);
                const plate = new THREE.Mesh(plateGeo, handleMat);
                plate.position.set(0, 0.05, dd / 2 + 0.01);
                dGroup.add(plate);

                // Add Contents
                if (r === 0 && c === 0) {
                    this.addDiamond(dGroup, dw, dh, dd);
                } else if (r === 0 && c === 1) {
                    this.addToyCar(dGroup, dw, dh, dd);
                } else {
                    this.addRandomContent(dGroup, dw, dh, dd);
                }

                // Positioning
                const posX = startX + c * drawerW;
                const posY = startY - r * drawerH;
                // Align front of drawer with front of body
                const zOffset = (depth / 2) - (dd / 2);

                dGroup.position.set(posX, posY, zOffset);

                dGroup.userData = {
                    isDrawer: true,
                    isOpen: false,
                    originalPosition: dGroup.position.clone(),
                    id: `drawer_${r}_${c}`
                };

                bodyGroup.add(dGroup);
                this.drawers.push(dGroup);
            }
        }
    }

    addRandomContent(group, w, h, d) {
        const type = Math.random();

        if (type < 0.4) {
            // Book
            const bookGeo = new THREE.BoxGeometry(w * 0.5, 0.04, d * 0.6);
            const bookMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const book = new THREE.Mesh(bookGeo, bookMat);
            book.position.y = -h / 2 + 0.04;
            book.position.z = -0.02;
            book.rotation.y = (Math.random() - 0.5) * 0.3;
            book.castShadow = true;
            group.add(book);
        } else if (type < 0.7) {
            // Scroll
            const scrollGeo = new THREE.CylinderGeometry(0.03, 0.03, w * 0.6, 8);
            const scrollMat = new THREE.MeshStandardMaterial({ color: 0xffffee });
            const scroll = new THREE.Mesh(scrollGeo, scrollMat);
            scroll.position.y = -h / 2 + 0.03;
            scroll.rotation.z = Math.PI / 2;
            scroll.rotation.y = (Math.random() - 0.5) * 0.5;
            scroll.castShadow = true;
            group.add(scroll);
        } else {
            // Gem / Orb
            const orbGeo = new THREE.IcosahedronGeometry(0.05, 0);
            const orbMat = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0x550000,
                roughness: 0.1,
                metalness: 0.8
            });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.y = -h / 2 + 0.05;
            orb.castShadow = true;
            group.add(orb);
        }
    }

    addDiamond(group, w, h, d) {
        // Large Beautiful Diamond
        // Using Icosahedron for more facets, and larger size
        const geometry = new THREE.IcosahedronGeometry(0.12, 0);

        // MeshPhysicalMaterial for realistic gem appearance (Diamond properties)
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.5, // Glass-like transparency
            thickness: 1.0, // Volume thickness
            ior: 2.4, // Diamond Index of Refraction
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            emissive: 0x222222, // Slight inner glow
            attenuationColor: 0xffffff,
            attenuationDistance: 0.5
        });

        const diamond = new THREE.Mesh(geometry, material);
        diamond.position.y = -h / 2 + 0.12; // Adjust height for new size
        diamond.castShadow = true;

        // Mark it for interaction
        diamond.userData = { isDiamond: true };

        group.add(diamond);
    }

    addToyCar(group, w, h, d) {
        const carGroup = new THREE.Group();

        // Car Body (Sporty Red)
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.03, 0.06);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd90429, metalness: 0.6, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.025;
        body.castShadow = true;
        carGroup.add(body);

        // Car Cabin (Black/Glass)
        const cabinGeo = new THREE.BoxGeometry(0.05, 0.025, 0.045);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.1 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.y = 0.05;
        cabin.position.x = -0.01;
        cabin.castShadow = true;
        carGroup.add(cabin);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.015, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

        const positions = [
            [-0.04, 0.018, 0.03], // Back Left
            [0.04, 0.018, 0.03],  // Front Left
            [-0.04, 0.018, -0.03], // Back Right
            [0.04, 0.018, -0.03]   // Front Right
        ];

        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(...pos);
            wheel.rotation.x = Math.PI / 2;
            wheel.castShadow = true;
            carGroup.add(wheel);
        });

        // Headlights
        const lightGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.01, 8);
        const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffaa, emissiveIntensity: 2 });

        const lLight = new THREE.Mesh(lightGeo, lightMat);
        lLight.rotation.z = Math.PI / 2;
        lLight.position.set(0.06, 0.03, 0.02);
        carGroup.add(lLight);

        const rLight = new THREE.Mesh(lightGeo, lightMat);
        rLight.rotation.z = Math.PI / 2;
        rLight.position.set(0.06, 0.03, -0.02);
        carGroup.add(rLight);


        // Position in drawer
        carGroup.position.y = -h / 2;
        carGroup.rotation.y = Math.PI / 8; // Angled slightly

        group.add(carGroup);
    }
}
