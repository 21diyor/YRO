"use client"

import createGlobe, { type COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Uzbekistan border — approximate polygon traced clockwise from NW
const UZBEKISTAN_BORDER: COBEOptions["markers"] = [
  // NW — Karakalpakstan / Aral Sea
  { location: [42.8, 57.5], size: 0.04 },
  { location: [42.8, 59.0], size: 0.04 },
  { location: [42.5, 61.0], size: 0.04 },
  // N — Kazakhstan border
  { location: [42.0, 63.0], size: 0.04 },
  { location: [41.8, 64.5], size: 0.04 },
  { location: [41.5, 66.0], size: 0.04 },
  // NE — towards Tashkent
  { location: [41.0, 67.5], size: 0.04 },
  { location: [41.3, 68.5], size: 0.04 },
  { location: [41.6, 69.5], size: 0.04 },
  // E — Fergana Valley / Kyrgyzstan border
  { location: [41.0, 70.5], size: 0.04 },
  { location: [40.5, 71.0], size: 0.04 },
  { location: [39.9, 70.8], size: 0.04 },
  // SE — Tajikistan border
  { location: [39.2, 70.2], size: 0.04 },
  { location: [38.5, 69.5], size: 0.04 },
  { location: [38.0, 68.5], size: 0.04 },
  // S — Afghanistan / Turkmenistan border
  { location: [37.3, 67.5], size: 0.04 },
  { location: [37.2, 66.0], size: 0.04 },
  { location: [37.5, 64.5], size: 0.04 },
  // SW — Turkmenistan border
  { location: [38.0, 63.8], size: 0.04 },
  { location: [39.0, 63.2], size: 0.04 },
  { location: [40.0, 62.0], size: 0.04 },
  { location: [40.5, 60.8], size: 0.04 },
  // W — back north to Karakalpakstan
  { location: [41.2, 59.5], size: 0.04 },
  { location: [42.0, 58.2], size: 0.04 },
]

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [1.0, 0.52, 0.1],
  glowColor: [1, 1, 1],
  markers: UZBEKISTAN_BORDER,
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"))
    return () => globe.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(e.clientX - pointerInteractionMovement.current)
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  )
}
