import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { StereoEffect } from 'three/addons/effects/StereoEffect.js'
import type { DisplayMode, Phase } from '../types'

export type SceneCommand = 'sample' | 'record' | 'replay' | 'recenter' | 'exit'
interface Props {
  mode: DisplayMode
  phase: Phase
  caption: string
  onCommand: (command: SceneCommand) => void
  onError: () => void
}
export default function Courtyard({ mode, phase, caption, onCommand, onError }: Props) {
  const host = useRef<HTMLDivElement>(null),
    commands = useRef(onCommand),
    current = useRef({ phase, caption })
  const [fps, setFps] = useState<number | null>(null)
  commands.current = onCommand
  current.current = { phase, caption }
  useEffect(() => {
    const container = host.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' })
    } catch {
      onError()
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor('#122c35')
    container.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#122c35', 15, 48)
    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 70)
    camera.position.set(0, 1.65, 6)
    const stereo = new StereoEffect(renderer)
    stereo.setEyeSeparation(0.064)
    scene.add(new THREE.HemisphereLight('#d9e9e6', '#473626', 2.7))
    const warm = new THREE.PointLight('#ffc47a', 60, 17)
    warm.position.set(0, 4, 0)
    scene.add(warm)
    const mat = (color: string) => new THREE.MeshLambertMaterial({ color })
    const wood = mat('#966b46'),
      roof = mat('#34545a'),
      brick = mat('#846755')
    function box(
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material,
    ) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
      mesh.position.set(x, y, z)
      scene.add(mesh)
      return mesh
    }
    box(30, 0.15, 30, 0, -0.15, -2, mat('#384b4d'))
    const grid = new THREE.GridHelper(28, 28, '#6b7970', '#4b6260')
    grid.position.y = -0.06
    scene.add(grid)
    box(12, 0.4, 5, 0, 0.1, -4, brick)
    box(10, 3, 3, 0, 1.8, -5, mat('#3a3a30'))
    for (const x of [-4.6, -2.2, 2.2, 4.6]) box(0.22, 3.2, 0.24, x, 1.8, -3.1, wood)
    const r1 = box(12, 0.22, 5.2, 0, 3.55, -4.5, roof)
    r1.rotation.x = 0.04
    const ridge = new THREE.Mesh(new THREE.ConeGeometry(7, 1.6, 4), roof)
    ridge.rotation.y = Math.PI / 4
    ridge.scale.z = 0.55
    ridge.position.set(0, 4.2, -4.5)
    scene.add(ridge)
    box(3, 0.18, 2.3, 0, 4.9, -4.5, roof)
    for (const x of [-3.5, 3.5])
      for (let j = 0; j < 7; j++) box(0.055, 2, 0.06, x - 0.7 + j * 0.22, 1.85, -3.48, wood)
    box(1.8, 2.8, 0.12, 0, 1.65, -3.46, mat('#14292d'))
    box(3, 0.33, 0.08, 0, 3.05, -3.1, mat('#b8935b'))
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 12),
      new THREE.MeshBasicMaterial({ color: '#ead3a0' }),
    )
    moon.position.set(9, 9, -17)
    scene.add(moon)
    const stars = new Float32Array(90)
    for (let i = 0; i < 30; i++) {
      stars[i * 3] = Math.sin(i * 127.1) * 22
      stars[i * 3 + 1] = 6 + (i % 9)
      stars[i * 3 + 2] = -10 - (i % 7) * 3
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(stars, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#d2d9ba', size: 0.06 })))
    for (const x of [-5, -2.5, 2.5, 5]) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 8),
        new THREE.MeshBasicMaterial({ color: '#db9b57' }),
      )
      lantern.scale.y = 1.4
      lantern.position.set(x, 3.2, 0)
      scene.add(lantern)
      box(0.025, 0.7, 0.025, x, 3.75, 0, wood)
    }
    function person(x: number, color: string) {
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.25, 10), mat(color))
      body.position.set(x, 0.7, -1)
      scene.add(body)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), mat('#d5af82'))
      head.position.set(x, 1.55, -1)
      scene.add(head)
      const hat = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        mat('#25383a'),
      )
      hat.position.set(x, 1.64, -1)
      scene.add(hat)
      const arm = box(0.13, 0.65, 0.14, x + 0.35, 1, -1, mat(color))
      arm.rotation.z = 0.8
    }
    person(-0.7, '#c08051')
    person(0.7, '#a75248')
    const textures: THREE.CanvasTexture[] = []
    function label(text: string, width = 1024, height = 160) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#17333d'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = '#9a8867'
      ctx.lineWidth = 4
      ctx.strokeRect(3, 3, width - 6, height - 6)
      ctx.fillStyle = '#f4ead6'
      ctx.font = `500 ${height * 0.27}px "Segoe UI", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, width / 2, height / 2, width - 40)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      textures.push(texture)
      return texture
    }
    const statusMat = new THREE.MeshBasicMaterial({
      map: label(current.current.caption),
      depthTest: false,
    })
    const statusPanel = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 0.55), statusMat)
    statusPanel.position.set(0, 2.45, 1.2)
    scene.add(statusPanel)
    const buttons: THREE.Mesh[] = []
    const entries: [SceneCommand, string, number, number][] = [
      ['sample', 'Nghe mẫu', -1.3, 1.25],
      ['record', 'Đến lượt bạn', 0, 1.25],
      ['replay', 'Nghe bản thu', 1.3, 1.25],
      ['recenter', 'Căn hướng', -0.65, 0.68],
      ['exit', 'Thoát kính', 0.65, 0.68],
    ]
    for (const [command, text, x, y] of entries) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.18, 0.42),
        new THREE.MeshBasicMaterial({ map: label(text, 512, 160) }),
      )
      mesh.position.set(x, y, 1.3)
      mesh.userData.command = command
      buttons.push(mesh)
      scene.add(mesh)
    }
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.009, 0.013, 24),
      new THREE.MeshBasicMaterial({ color: '#f7d28e', depthTest: false }),
    )
    reticle.position.set(0, 0, -1)
    camera.add(reticle)
    scene.add(camera)
    reticle.visible = mode === 'cardboard'
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2()
    let target: THREE.Object3D | null = null,
      dwell = 0,
      lastFired = '',
      lastCaption = '',
      frame = 0,
      last = performance.now(),
      fpsStart = last,
      frameCount = 0,
      yaw = 0,
      pitch = 0,
      drag = false,
      px = 0,
      py = 0
    let rawQuat: THREE.Quaternion | null = null,
      offset: THREE.Quaternion | null = null,
      lastSensor = performance.now()
    const sensorEuler = new THREE.Euler(),
      screenQuat = new THREE.Quaternion(),
      q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)),
      axis = new THREE.Vector3(0, 0, 1)
    function orientation(e: DeviceOrientationEvent) {
      if (e.alpha === null || e.beta === null || e.gamma === null) return
      const deg = THREE.MathUtils.degToRad
      sensorEuler.set(deg(e.beta), deg(e.alpha), -deg(e.gamma), 'YXZ')
      rawQuat = new THREE.Quaternion()
        .setFromEuler(sensorEuler)
        .multiply(q1)
        .multiply(screenQuat.setFromAxisAngle(axis, -deg(screen.orientation?.angle || 0)))
      if (!offset) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(rawQuat)
        offset = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          Math.atan2(forward.x, -forward.z),
        )
      }
      lastSensor = performance.now()
    }
    if (mode === 'cardboard') window.addEventListener('deviceorientation', orientation)
    function fire(command: SceneCommand) {
      if (command === 'recenter') {
        offset = null
        return
      }
      commands.current(command)
    }
    function down(e: PointerEvent) {
      drag = true
      px = e.clientX
      py = e.clientY
      renderer.domElement.setPointerCapture(e.pointerId)
    }
    function move(e: PointerEvent) {
      if (!drag || mode === 'cardboard') return
      yaw -= (e.clientX - px) * 0.004
      pitch = Math.max(-0.6, Math.min(0.6, pitch - (e.clientY - py) * 0.004))
      px = e.clientX
      py = e.clientY
    }
    function up(e: PointerEvent) {
      drag = false
      if (mode === 'cardboard') return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(buttons)[0]
      if (hit) fire(hit.object.userData.command)
    }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    function resize() {
      const w = container.clientWidth,
        h = container.clientHeight
      renderer.setSize(w, h)
      stereo.setSize(w, h)
      camera.aspect = mode === 'cardboard' ? w / 2 / h : w / h
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    function animate(now: number) {
      const dt = Math.min(100, now - last)
      last = now
      frameCount++
      if (now - fpsStart > 2500) {
        setFps(Math.round((frameCount * 1000) / (now - fpsStart)))
        frameCount = 0
        fpsStart = now
      }
      if (mode === 'cardboard' && rawQuat && offset)
        camera.quaternion.copy(offset).multiply(rawQuat)
      else camera.rotation.set(pitch, yaw, 0, 'YXZ')
      if (mode === 'cardboard') {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
        const hit = raycaster.intersectObjects(buttons)[0]?.object || null
        const enabled =
          current.current.phase === 'ready' ||
          current.current.phase === 'feedback' ||
          hit?.userData.command === 'exit' ||
          hit?.userData.command === 'recenter'
        if (hit !== target) {
          target = hit
          dwell = 0
          lastFired = ''
        }
        if (target && enabled && now - lastSensor < 1500) {
          dwell += dt
          reticle.scale.setScalar(1 + Math.min(dwell / 1500, 1) * 0.5)
          if (dwell >= 1500 && lastFired !== target.uuid) {
            lastFired = target.uuid
            fire(target.userData.command)
          }
        } else reticle.scale.setScalar(1)
      }
      if (lastCaption !== current.current.caption) {
        lastCaption = current.current.caption
        const old = statusMat.map
        statusMat.map = label(lastCaption)
        statusMat.needsUpdate = true
        old?.dispose()
      }
      if (mode === 'cardboard') stereo.render(scene, camera)
      else renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    const lost = (e: Event) => {
      e.preventDefault()
      onError()
    }
    renderer.domElement.addEventListener('webglcontextlost', lost)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('deviceorientation', orientation)
      renderer.domElement.removeEventListener('pointerdown', down)
      renderer.domElement.removeEventListener('pointermove', move)
      renderer.domElement.removeEventListener('pointerup', up)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose()
          const mats = Array.isArray(object.material) ? object.material : [object.material]
          mats.forEach((m) => m.dispose())
        }
      })
      textures.forEach((t) => t.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [mode, onError])
  return (
    <div
      className={`courtyard ${mode === 'cardboard' ? 'stereo' : ''}`}
      ref={host}
      role="img"
      aria-label="Sân đình 3D. Nhân vật hướng dẫn minh họa."
    >
      <span className="scene-caption">
        KHÔNG GIAN MINH HỌA ·{' '}
        {mode === 'cardboard' ? 'NHÌN VÀO NÚT TRONG 1,5 GIÂY' : 'KÉO ĐỂ NHÌN QUANH'}
      </span>
      {fps !== null && <span className="scene-fps">{fps} FPS</span>}
    </div>
  )
}
