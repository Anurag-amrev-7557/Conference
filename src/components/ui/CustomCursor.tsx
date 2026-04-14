import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false)

  const cursorX = useSpring(0, { stiffness: 800, damping: 40, mass: 0.2 })
  const cursorY = useSpring(0, { stiffness: 800, damping: 40, mass: 0.2 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isLink = target.closest('a') || target.closest('button') || target.closest('input')
      setIsHovered(!!isLink)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleHover)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleHover)
    }
  }, [isHovered, cursorX, cursorY])

  return (
    <motion.div
      className="fixed top-0 left-0 w-3 h-3 rounded-full bg-accent pointer-events-none z-[9999] hidden md:block shadow-[0_0_20px_rgba(0,82,204,0.3)]"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%"
      }}
      animate={{
        scale: isHovered ? 8 : 1,
        opacity: isHovered ? 0.4 : 0.8,
        backgroundColor: isHovered ? "rgba(0, 82, 204, 0.3)" : "#0052cc"
      }}
      transition={{ 
        scale: { type: "spring", stiffness: 200, damping: 25, mass: 0.5 },
        opacity: { duration: 0.3 }
      }}
    />
  )
}


