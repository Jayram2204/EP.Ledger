'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SealAnimationProps {
  isSealing: boolean
  onComplete: () => void
  children: React.ReactNode
}

export default function SealAnimation({ isSealing, onComplete, children }: SealAnimationProps) {
  const controls = useAnimation()
  const [showStamp, setShowStamp] = useState(false)

  useEffect(() => {
    let mounted = true

    if (isSealing) {
      const sequence = async () => {
        // 1. Compress / thicken over 400ms (suggesting weight settling)
        // We use easeOut rather than linear to give a physical deceleration
        await controls.start({
          scale: 0.97,
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
          y: 4, 
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        })

        if (!mounted) return

        // 2. Trigger the stamp element
        setShowStamp(true)

        // 3. Hold for 200ms while the stamp animates in
        await new Promise(resolve => setTimeout(resolve, 300))

        if (!mounted) return
        
        // 4. Soft fade/settle into a locked visual state
        await controls.start({
          scale: 0.99,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          y: 0,
          transition: { duration: 0.3, ease: 'easeOut' }
        })

        if (!mounted) return
        
        // Wait a beat before notifying completion
        await new Promise(resolve => setTimeout(resolve, 200))
        if (!mounted) return
        
        onComplete()
      }
      sequence()
    }
    
    return () => { mounted = false }
  }, [isSealing, controls, onComplete])

  return (
    <motion.div 
      animate={controls}
      initial={{ scale: 1, boxShadow: '0 0px 0px rgba(0,0,0,0)', y: 0 }}
      className="relative w-full h-full flex flex-col items-center"
      style={{ originY: 0.5, originX: 0.5 }}
    >
      {children}
      
      {showStamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 bg-parchment/40 backdrop-blur-[2px] rounded-2xl"
        >
          {/* Circular seal element with spring physics overshoot */}
          <motion.div
            initial={{ scale: 2.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 1
            }}
            className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center drop-shadow-2xl text-[#B8895F]"
          >
            {/* Organic wax seal shape */}
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
              <path d="M51.1,4.5c10.4-2.8,22.5-0.1,30.8,6.8c7.5,6.2,12.4,14.8,14.7,24.2c2.6,10.4,1,21.5-3.3,31.2c-4.4,9.9-11.8,18.2-20.9,24.1c-9.7,6.3-21.4,9.6-32.6,7.5c-11.1-2-21.4-8-29.3-15.9c-8.2-8.3-12.8-19.8-12-31.6c0.8-11.6,6.3-22.2,14-30.8C20.6,11.2,30.8,4.7,42,2.7C45,2.1,48.1,5.4,51.1,4.5z" />
              <text x="50" y="52" fontFamily="var(--font-newsreader), serif" fontStyle="italic" fontSize="46" fill="#F7F5F0" opacity="0.9" textAnchor="middle" dominantBaseline="middle">E</text>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
