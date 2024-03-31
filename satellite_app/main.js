import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer(
  {
    antialias: true
  }
)

const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 6.137600184552919

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement)

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(6.371, 32, 32), 
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('./images/2_no_clouds_8k.jpg'),
    bumpMap: new THREE.TextureLoader().load('./images/elev_bump_8k.jpg'),
    bumpScale: 1,
    specularMap: new THREE.TextureLoader().load('./images/water_8k.png'),
    specular: new THREE.Color(0x804f00),
    shininess: 25
  })
)

const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(6.372, 64, 64), 
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('./images/fair_clouds_4k.png'),
    transparent: true
  })
)

const atmosphereShader = new THREE.ShaderMaterial({
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

const atmosphere = new THREE.Mesh( new THREE.SphereGeometry(1.3, 32, 32), atmosphereShader.clone() )
atmosphere.position.set(earth.position.x, earth.position.y, earth.position.z)
atmosphere.scale.multiplyScalar(6.2);

const iss = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

scene.add(iss);

/*
const starfield = new THREE.Mesh(
  new THREE.SphereGeometry(90, 64, 64),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('./images/starfield.jpg'),
    side: THREE.BackSide
  })
)
*/

var axisTilt = 23.4 * (Math.PI / 180) // tilt in radians
var earthAxis = new THREE.Vector3( Math.sin( axisTilt ), Math.cos( axisTilt ), 0 ).normalize()
var earth_quaternion = new THREE.Quaternion()
var cloud_quaternion = new THREE.Quaternion()
var earth_speed = 0.005 * (Math.PI / 180)
var cloud_speed = 0.007 * (Math.PI / 180)

earth_quaternion.setFromAxisAngle(earthAxis, earth_speed)
cloud_quaternion.setFromAxisAngle(earthAxis, cloud_speed)

earth.applyMatrix4( new THREE.Matrix4().makeRotationZ( - axisTilt ) )
clouds.applyMatrix4( new THREE.Matrix4().makeRotationZ( - axisTilt ) )

scene.add(earth)
scene.add(clouds)
scene.add(atmosphere)
//scene.add(starfield)

camera.position.z = 12

// Add a light source
const ambientLight = new THREE.AmbientLight(0x151515)
scene.add(ambientLight)

var light = new THREE.DirectionalLight(0xffffff, 3)
light.position.set(5,3,5);
scene.add(light);

window.addEventListener('resize', onWindowResize, false)

animate()

function updateSatellitePosition() {

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render()
}

function animate() {
  stats.begin()
  controls.update()
  earth.applyQuaternion(earth_quaternion)
  clouds.applyQuaternion(cloud_quaternion)
  atmosphere.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( camera.position, atmosphere.position );
  stats.end()
  requestAnimationFrame(animate)
  updateSatellitePosition();
  renderer.render(scene, camera)
}