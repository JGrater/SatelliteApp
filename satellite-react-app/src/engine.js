import * as THREE from 'three'
import * as Telemetry from './telemetry';
import * as Shaders from './shaders';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { earthRadius } from "satellite.js/lib/constants";
import * as satellite from 'satellite.js/lib/index';
import earthMap from './assets/Earth/2_no_clouds_16k.jpg'
import earthBumpMap from './assets/Earth/elev_bump_16k.jpg'
import earthSeaMap from './assets/Earth/water_16k.png'
import cloudMap from './assets/Earth/africa_clouds_8k.png'

const satelliteSize = 50;
const minutesPerDay = 1440

export class Engine {

    // EarthRadius = 6378.135km 
    stations = [];
    referenceFrame = 1;
    el = null;

    //<---------------------------Initialise---------------------------->

    initialise(container, options = {}) {
        this.el = container;
        console.log(this.el)
        this.raycaster = new THREE.Raycaster();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.setScene();
        this.setLights();
        this.addObjects();

        this.render();

        window.addEventListener('resize', this.handleWindowResize)
    }

    dispose() {
        window.removeEventListener('resize', this.handleWindowResize);

        this.raycaster = null;
        this.el = null;

        this.controls.dispose();
    }

    handleWindowResize= () => {
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.render();
    }

    setReferenceFrame = (type) => {
        this.referenceFrame = type;
    }

    //<---------------------------Scene---------------------------->

    setScene = () => {
        this.scene = new THREE.Scene();
        
        this.renderer = new THREE.WebGLRenderer({
            logarithmicDepthBuffer: true,
            antialias: true,
        });

        this.setCamera();

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new THREE.Color(0x000000));
        this.el.appendChild(this.renderer.domElement)
    }

    setCamera = () => {
        const NEAR = 1e-6, FAR = 1e100;
        this.camera = new THREE.PerspectiveCamera(54, this.width/this.height, NEAR, FAR);
        this.controls = new OrbitControls(this.camera, this.el);
        this.controls.enablePan = false;
        this.controls.addEventListener('change', () => this.render())
        this.controls.minDistance = earthRadius + 1
        this.camera.position.z = earthRadius * 2;
        this.camera.position.x = earthRadius * 2;
        this.camera.lookAt(0,0,0);
    }

    setLights = () => {
        const sun = new THREE.DirectionalLight(0xffffff, 3);
        //sun.position.set(0, 59333894, -137112541);
        sun.position.set(0, 0, -149400000);
        const ambient = new THREE.AmbientLight(0x363636);
        
        this.scene.add(sun);
        this.scene.add(ambient);
    }

    addObjects = () => {
        this.addEarth();
    }

    render = () => {
        this.renderer.render(this.scene, this.camera);
    }

    //<---------------------------Scene_Contents---------------------------->

    addEarth = () => {
        var axisTilt = this.degreesToRadians(23.4)
        var earthSpeed = this.degreesToRadians(0.005)

        const textureLoader = new THREE.TextureLoader();
        const group = new THREE.Group();

        const geometry = new THREE.SphereGeometry(earthRadius, 50, 50);
        geometry.clearGroups();
        geometry.addGroup( 0, Infinity, 0 );
        geometry.addGroup( 0, Infinity, 1 );

        const land_material = new THREE.MeshPhongMaterial({
            map: textureLoader.load(earthMap),
            bumpMap: textureLoader.load(earthBumpMap),
            bumpScale: 1,
            shininess: 25,
            color: new THREE.Color(0xCCCCCC)
        })
        const sea_material = new THREE.MeshPhongMaterial({
            specularMap: textureLoader.load(earthSeaMap),
            specular: new THREE.Color(0x7a5c2b),
            alphaMap: textureLoader.load(earthSeaMap),
            shininess: 25,
            color: new THREE.Color(0x156289),
            transparent: true,
        })

        var materials = [
            land_material,
            sea_material
        ]

        this.earthMesh = new THREE.Mesh(geometry, materials);
        this.earthCloudMesh = this.getEarthCloud(textureLoader);
        this.earthCloudMesh.scale.setScalar(1.003)
        this.earthAtmosphereMesh = this.getEarthAtmosphere();
        this.earthAtmosphereMesh.scale.setScalar(1.015)

        group.add(this.earthMesh);
        group.add(this.earthCloudMesh);
        group.add(this.earthAtmosphereMesh);

        group.rotation.z = axisTilt

        this.earth = group;
        this.scene.add(this.earth);
    }

    getEarthCloud = (textureLoader) => {
        let geometry = new THREE.SphereGeometry(earthRadius, 50, 50);
        let material = new THREE.MeshPhongMaterial({
            map: textureLoader.load(cloudMap),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8
        })
        return new THREE.Mesh(geometry, material);
    }

    getEarthAtmosphere = () => {
        let geometry = new THREE.SphereGeometry(earthRadius, 50, 50);
        return new THREE.Mesh( geometry, Shaders.getAtmosphereShader() )
    }

    addSatellite = (station, color, size) => {
        const sat = this.getSatellite(color, size);
        const pos = this.getSatellitePosition(station, new Date());
        sat.position.set(pos.x, pos.y, pos.z);
        station.mesh = sat;

        this.stations.push(station);
        this.earth.add(sat);
        this.render();
    }

    getSatellite = (color, size) => {
        // Input or default
        color = color || 0xFF0000;
        size = size || 50;

        let geometry = new THREE.SphereGeometry(25, 50, 50);
        let material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: false,
            depthTest: true
        })
        return new THREE.Mesh(geometry, material);
    }

    getSatellitePosition = (station, date) => {
        date = date || new Date();
        return Telemetry.getPositionFromTle(station, date, this.referenceFrame);
    }

    //<---------------------------Scene_Action---------------------------->

    updateScene = (date) => {
        if (!this.stations) return;

        this.stations.forEach(station => {
            this.updateSatellitePosition(station, date);
        });

        if (this.referenceFrame === 2) {
            this.updateEarthRotation(date);
        }
        else {
            this.render();
        }
    }

    updateSatellitePosition = (station, date) => {
        //date = date || TargetDate;

        const pos = Telemetry.getPositionFromTle(station, date, this.referenceFrame);
        if (!pos) return;

        station.mesh.position.set(pos.x, pos.y, pos.z);
    }

    updateEarthRotation = (date) => {
        const gst = satellite.gstime(date)
        this.earthMesh.setRotationFromEuler(new THREE.Euler(0, gst, 0));

        this.render();
    }

    degreesToRadians = (degrees) => {
        return degrees * (Math.PI / 180)
    }

}