import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'

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
controls.minDistance = 1.137600184552919

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement)

const surface = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32), 
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('./images/2_no_clouds_8k.jpg'),
    bumpMap: new THREE.TextureLoader().load('./images/elev_bump_8k.jpg'),
    bumpScale: 1,
    specularMap: new THREE.TextureLoader().load('./images/water_8k.png'),
    specular: new THREE.Color('grey')
  })
)


const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(1.01, 32, 32), 
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('./images/fair_clouds_4k.png'),
    transparent: true
  })
)

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



surface.applyMatrix4( new THREE.Matrix4().makeRotationZ( - axisTilt ) )
clouds.applyMatrix4( new THREE.Matrix4().makeRotationZ( - axisTilt ) )

scene.add(surface)
scene.add(clouds)
//scene.add(starfield)

camera.position.z = 2

// Add a light source
const ambientLight = new THREE.AmbientLight(0x151515)
scene.add(ambientLight)

var light = new THREE.DirectionalLight(0xffffff, 2)
light.position.set(5,3,5);
scene.add(light);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render()
}


function animate() {
  stats.begin()
  controls.update()
  surface.applyQuaternion(earth_quaternion)
  clouds.applyQuaternion(cloud_quaternion)
  stats.end()
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
