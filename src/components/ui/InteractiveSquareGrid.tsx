import React, { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"

export function InteractiveSquareGrid() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [activeCell, setActiveCell] = useState<number | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    
    // Optimized O(1) detection logic
    const handleMouseMove = (e: MouseEvent) => {
      const cellSize = 60
      const col = Math.floor(e.clientX / cellSize)
      const row = Math.floor(e.clientY / cellSize)
      const cols = Math.ceil(window.innerWidth / cellSize)
      const index = row * cols + col
      
      // Only update if we've actually moved to a new cell
      setActiveCell(prev => prev !== index ? index : prev)
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const { rows, cols } = useMemo(() => {
    const cellSize = 60
    return {
      rows: Math.ceil(dimensions.height / cellSize),
      cols: Math.ceil(dimensions.width / cellSize)
    }
  }, [dimensions])

  if (dimensions.width === 0) return null

  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none perspective-1000 overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 60px)`,
        gridTemplateRows: `repeat(${rows}, 60px)`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <Square i={i} key={i} isActive={i === activeCell} />
      ))}
    </div>
  )
}

const Square = React.memo(({ i, isActive }: { i: number, isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 0 }}
      animate={{ 
        opacity: 1,
        // The Inward Vertical Flap
        rotateX: isActive ? 180 : 0,
        backgroundColor: isActive ? "rgba(0, 82, 204, 0.25)" : "rgba(0, 82, 204, 0)"
      }}
      transition={{ 
        opacity: { duration: 0.8, delay: Math.min(i * 0.001, 1.2) },
        rotateX: { 
          type: "spring", 
          stiffness: 60, 
          damping: 15,
          mass: 1
        },
        backgroundColor: { duration: 0.4 }
      }}
      className="w-[60px] h-[60px] border-[0.5px] border-border/15"
      style={{ transformStyle: "preserve-3d" }}
    />
  )
})

Square.displayName = "Square"
