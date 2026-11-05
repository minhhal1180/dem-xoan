import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { StereoEffect } from 'three/addons/effects/StereoEffect.js'
import { hasOrientationData, screenAngle } from './sensors'
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
    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 70)
    camera.position.set(0, 1.65, 6)
    const stereo = new StereoEffect(renderer)
    stereo.setEyeSeparation(0.064)
    const textures: THREE.Texture[] = []
    let disposed = false
    const loader = new THREE.TextureLoader()
    function artwork(name: string, ready: (texture: THREE.Texture) => void) {
      const texture = loader.load(
        `${import.meta.env.BASE_URL}media/generated/${name}.webp`,
        (loaded) => {
          if (disposed) {
            loaded.dispose()
            return
          }
          loaded.colorSpace = THREE.SRGBColorSpace
          ready(loaded)
        },
        undefined,
        () => {
          if (!disposed) onError()
        },
      )
      textures.push(texture)
    }
    // Generated artwork is an illustrated environment, not a heritage reconstruction.
    artwork('environment', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      scene.background = texture
      scene.backgroundRotation.y = Math.PI / 2
    })
    for (const [name, x] of [
      ['kep', -2.4],
      ['dao', 2.4],
    ] as const) {
      artwork(name, (texture) => {
        const guide = new THREE.Mesh(
          new THREE.PlaneGeometry(1.8, 2.7),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            alphaTest: 0.02,
          }),
        )
        guide.position.set(x, 1.35, 0.5)
        scene.add(guide)
      })
    }
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
      moved = false,
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
      if (!hasOrientationData(e) || e.alpha === null || e.beta === null || e.gamma === null) return
      const deg = THREE.MathUtils.degToRad
      sensorEuler.set(deg(e.beta), deg(e.alpha), -deg(e.gamma), 'YXZ')
      rawQuat = new THREE.Quaternion()
        .setFromEuler(sensorEuler)
        .multiply(q1)
        .multiply(screenQuat.setFromAxisAngle(axis, -deg(screenAngle())))
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
      moved = false
      px = e.clientX
      py = e.clientY
      renderer.domElement.setPointerCapture(e.pointerId)
    }
    function move(e: PointerEvent) {
      if (!drag || mode === 'cardboard') return
      if (Math.abs(e.clientX - px) + Math.abs(e.clientY - py) > 2) moved = true
      yaw -= (e.clientX - px) * 0.004
      pitch = Math.max(-0.6, Math.min(0.6, pitch - (e.clientY - py) * 0.004))
      px = e.clientX
      py = e.clientY
    }
    function up(e: PointerEvent) {
      drag = false
      if (mode === 'cardboard' || moved) return
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
      disposed = true
      scene.background = null
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
      aria-label="Sân đình 3D với tranh nền và nhân vật minh họa AI."
    >
      <span className="scene-caption">
        MINH HỌA AI · {mode === 'cardboard' ? 'NHÌN VÀO NÚT TRONG 1,5 GIÂY' : 'KÉO ĐỂ NHÌN QUANH'}
      </span>
      {fps !== null && <span className="scene-fps">{fps} FPS</span>}
    </div>
  )
}
