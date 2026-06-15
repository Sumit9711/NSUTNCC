import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function AchievementsParticles({ sectionRef, progress }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    camera.position.z = 30

    const particleCount = 120
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const radius = 15 + Math.random() * 25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.cos(phi)
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 20
      sizes[i] = 0.02 + Math.random() * 0.06
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      color: 0xc9a84c,
      size: 0.12,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const ringGeo = new THREE.TorusGeometry(8, 0.03, 16, 60)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.z = -15
    ring.position.y = -2
    scene.add(ring)

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(12, 0.02, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0x5faf5f, transparent: true, opacity: 0.05, wireframe: true })
    )
    ring2.position.z = -25
    ring2.position.x = 5
    scene.add(ring2)

    let mouseX = 0, mouseY = 0
    const handleMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)

    const handleResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)

      particles.rotation.x += 0.0003
      particles.rotation.y += 0.0005

      ring.rotation.x += 0.002
      ring.rotation.z += 0.001
      ring2.rotation.y += 0.001
      ring2.rotation.x += 0.001

      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.02
      camera.lookAt(0, 0, -10)

      renderer.render(scene, camera)
    }
    animate()

    sceneRef.current = { scene, camera, renderer, particles, ring, ring2, material }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
      geometry.dispose()
      material.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    const { material, particles } = sceneRef.current
    const opacity = 0.15 + Math.abs(progress) * 0.25
    material.opacity = Math.min(opacity, 0.5)
    particles.rotation.z = progress * 0.5
  }, [progress])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  )
}
