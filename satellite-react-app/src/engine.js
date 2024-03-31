import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { earthRadius } from "satellite.js/lib/index";
import * as satellite from 'satellite.js/lib/index';
import earthMap from './assets/2_no_clouds_8k.jpg'
import earthBumpMap from './assets/elev_bump_8k.jpg'
import earthSpecularMap from './assets/water_8k.png'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const satelliteSize = 50;
const minutesPerDay = 1440

export class Engine {

    satellites = [];

    //<---------------------------Initialise---------------------------->

    initialise() {
        this.setScene();
        this.setLights();
        this.addObjects();

        this.render();

        window.addEventListener('resize', this.handleWindowResize, false)
    }

    handleWindowResize= () => {
        const width = innerWidth;
        const height = innerHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.render();
    }

    //<---------------------------Scene---------------------------->

    setScene = () => {
        const width = innerWidth;
        const height = innerHeight;

        this.scene = new THREE.Scene();

        this.setCamera(width, height);

        this.renderer = new THREE.WebGLRenderer(
            {
              antialias: true
            }
        );

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        document.body.appendChild(renderer.domElement);
    }

    setCamera = (width, height) => {
        var NEAR = 1e-6, FAR = 1e27;

        this.camera = new THREE.PerspectiveCamera(75, width/height, NEAR, FAR);
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.minDistance = earthRadius + 1
        this.controls.addEventListener('change', () => this.render());
        this.camera.position.z = 15000
        this.camera.lookAt(0,0,0);
    }

    setLights = () => {
        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(0, 59333894, -137112541);

        const ambient = new THREE.AmbientLight(0x151515);
        
        this.scene.add(sun);
        this.scene.add(ambient);
    }

    addObjects = () => {
        this.addEarth();
    }

    render = () => {
        renderer.render(this.scene, this.camera);
    }

    //<---------------------------Scene_Contents---------------------------->


    addEarth = () => {

        var axisTilt = 23.4 * (Math.PI / 180) // tilt in radians
        let axis = new THREE.Vector3( Math.sin( axisTilt ), Math.cos( axisTilt ), 0 ).normalize()
        let earthQuaternion, cloudQuaternion = new THREE.Quaternion()
        var earth_speed = 0.005 * (Math.PI / 180)
        var cloud_speed = 0.007 * (Math.PI / 180)

        const textureLoad = new THREE.TextureLoader();

        const group = new THREE.Group();

        let geometry = new THREE.SphereGeometry(earthRadius, 50, 50);
        let material = new THREE.MeshPhongMaterial({
            map: textureLoad.load('./images/2_no_clouds_8k.jpg'),
            bumpMap: textureLoad.load('./images/elev_bump_8k.jpg'),
            bumpScale: 1,
            specularMap: textureLoad.load('./images/water_8k.png'),
            specular: new THREE.Color(0x804f00),
            shininess: 25
        })

        //earthQuaternion.setFromAxisAngle(axis, earth_speed)
        //cloudQuaternion.setFromAxisAngle(axis, cloud_speed)

        this.earthMesh = new THREE.Mesh(geometry, material);
        

        //this.addEarthClouds();
        //this.addEarthAtmosphere();

        //this.earthMesh.applyQuaternion(earthQuaternion);
        //this.earthCloudMesh.applyQuaternion(cloudQuaternion);

        group.add(this.earthMesh);
        //group.add(this.earthCloudMesh);
        //group.add(this.atmosphereMesh);

        this.earth = group;
        this.scene.add(this.earth);
    }
/*
    addEarthClouds = (textureLoad) => {
        let geometry = new THREE.SphereGeometry(earthRadius + 0.001, 50, 50);
        let material = new THREE.MeshPhongMaterial({
            map: textureLoad.load('./images/fair_clouds_4k.png'),
            transparent: true
        })

        this.earthCloudMesh = new THREE.Mesh(geometry, material);
    }

    addEarthAtmosphere = () => {
        let shader = new THREE.ShaderMaterial({
            uniforms: {
              "c": { type: "f", value: 0.5 },
              "p": { type: "f", value: 6 },
              glowColor: { type: "c", value: new THREE.Color(0.2, 0.5, 0.9) },
              viewVector: { type: "v3", value: camera.position }
            },
            vertexShader: vertexShader,
              fragmentShader: fragmentShader,
            side: THREE.BackSide,
              blending: THREE.AdditiveBlending,
              transparent: true
          })

        this.atmosphereMesh = new THREE.Mesh( new THREE.SphereGeometry(earthRadius-5.7, 32, 32), shader.clone() )
        this.atmosphereMesh.position.set(0, 0, 0)
        this.atmosphereMesh.scale.multiplyScalar(6.2);
    }
    */

    //addSatellite = () => {

    //}

    //<---------------------------Scene_Action---------------------------->

    updateEarthRotation = (date) => {
        const gst = satellite.gstime(date)
        this.earthMesh.setRotationFromEuler(new THREE.Euler(0, gst, 0));

        this.render();
    }

}