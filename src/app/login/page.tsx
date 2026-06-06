'use client'
import { useEffect, useRef, useCallback } from 'react'
import { LoginBranding } from '@/components/login/LoginBranding'
import { LoginCard } from '@/components/login/LoginCard'
import { CashAnimation } from '@/components/login/CashAnimation'

export default function LoginPage() {
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const logoMainRef = useRef<HTMLDivElement>(null)
  const logoRRef = useRef<HTMLDivElement>(null)
  const logoBRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const underlineRef = useRef<HTMLDivElement>(null)
  const logoCenterRef = useRef<HTMLDivElement>(null)
  const splitOverlayRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  const runAnimation = useCallback(async () => {
    const animeModule: any = await import('animejs')
    const anime = animeModule.default || animeModule

    const logoMain = logoMainRef.current
    const logoR = logoRRef.current
    const logoB = logoBRef.current
    const tagline = taglineRef.current
    const underline = underlineRef.current
    const logoCenter = logoCenterRef.current
    const splitOverlay = splitOverlayRef.current
    const divider = dividerRef.current
    const leftContent = leftContentRef.current
    const rightContent = rightContentRef.current
    const bg = bgRef.current

    if (!logoMain || !logoR || !logoB || !tagline || !underline ||
        !logoCenter || !splitOverlay || !divider || !leftContent ||
        !rightContent || !bg) return

    // Reset all elements
    anime.set([logoMain, logoR, logoB, tagline], { opacity: 0, translateX: 0, translateY: 0 })
    anime.set(underline, { width: '0px' })
    anime.set(logoCenter, { opacity: 1 })
    anime.set(splitOverlay, { opacity: 0 })
    anime.set(divider, { opacity: 0, scaleY: 0 })
    anime.set(leftContent, { opacity: 0, translateX: -40 })
    anime.set(rightContent, { opacity: 0, translateX: 40 })
    bg.style.background = 'radial-gradient(ellipse at 30% 50%, #2d1b6b 0%, #1a0a3d 35%, #06030f 70%, #000 100%)'

    const tl = anime.timeline({ easing: 'easeOutExpo' })

    // Glitch flicker entrance
    tl.add({
      targets: logoMain,
      opacity: [
        { value: 0, duration: 0 },
        { value: 1, duration: 55 },
        { value: 0, duration: 55 },
        { value: 1, duration: 55 },
        { value: 0.2, duration: 35 },
        { value: 1, duration: 70 },
      ],
      duration: 380,
    })
    // RGB color split layers
    .add({
      targets: [logoR, logoB],
      opacity: [
        { value: 0, duration: 0 },
        { value: 0.9, duration: 45 },
        { value: 0, duration: 45 },
        { value: 0.75, duration: 35 },
        { value: 0, duration: 75 },
      ],
      translateX: (_el: any, i: number) => i === 0 ? [5, -4, 6, 0] : [-6, 4, -5, 0],
      duration: 380,
    }, '-=380')
    // Underline draw
    .add({
      targets: underline,
      width: ['0px', '110px'],
      duration: 480,
      easing: 'easeOutQuart',
    })
    // Tagline fade in
    .add({
      targets: tagline,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 380,
    }, '-=280')
    // Pause, then glitch burst before transition
    .add({
      targets: logoMain,
      translateX: [0, -7, 9, -5, 0],
      translateY: [0, 3, -2, 1, 0],
      duration: 280,
      easing: 'linear',
      delay: 900,
    })
    .add({
      targets: [logoR, logoB],
      opacity: [0, 0.75, 0],
      translateX: (_el: any, i: number) => i === 0 ? [9, -7] : [-9, 6],
      duration: 280,
      easing: 'linear',
    }, '-=280')
    // Background radial shifts left
    .add({
      duration: 600,
      update: (anim: any) => {
        const p = anim.progress / 100
        const x = 30 - (p * 20)
        if (bg) bg.style.background = `radial-gradient(ellipse at ${x}% 50%, #2d1b6b 0%, #1a0a3d 35%, #06030f 70%, #000 100%)`
      },
    }, '-=100')
    // Fade out center logo
    .add({
      targets: logoCenter,
      opacity: [1, 0],
      duration: 320,
      easing: 'easeInQuad',
      delay: 100,
    })
    // Split overlay gradient tint fades in
    .add({
      targets: splitOverlay,
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutQuad',
    }, '-=200')
    // Divider line draws in
    .add({
      targets: divider,
      opacity: [0, 1],
      scaleY: [0, 1],
      duration: 500,
      easing: 'easeOutQuart',
    }, '-=400')
    // Left content slides in
    .add({
      targets: leftContent,
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 600,
      easing: 'easeOutQuart',
    }, '-=350')
    // Right content slides in simultaneously
    .add({
      targets: rightContent,
      opacity: [0, 1],
      translateX: [40, 0],
      duration: 600,
      easing: 'easeOutQuart',
    }, '-=600')
  }, [])

  useEffect(() => {
    const timer = setTimeout(runAnimation, 300)
    return () => clearTimeout(timer)
  }, [runAnimation])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#06030f',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* Full-screen gradient background */}
      <div ref={bgRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 50%, #2d1b6b 0%, #1a0a3d 35%, #06030f 70%, #000 100%)',
      }} />

      {/* Scanlines overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)',
      }} />

      {/* Cash particles — full screen */}
      <div ref={particleContainerRef} style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        <CashAnimation containerRef={particleContainerRef} />
      </div>

      {/* Gradient split overlay */}
      <div ref={splitOverlayRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        opacity: 0,
        background: 'linear-gradient(90deg, rgba(79,70,229,0.55) 0%, rgba(79,70,229,0.15) 45%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.88) 100%)',
      }} />

      {/* Divider line */}
      <div ref={dividerRef} style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: '1px',
        background: 'linear-gradient(180deg, transparent, rgba(167,139,250,0.4), transparent)',
        zIndex: 8,
        opacity: 0,
        transformOrigin: 'center',
      }} />

      {/* Phase 1 — Centered glitch logo */}
      <div ref={logoCenterRef} style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{ position: 'relative' }}>
          <div ref={logoMainRef} style={{
            fontSize: '5rem',
            fontWeight: 500,
            color: 'white',
            letterSpacing: '-0.02em',
            opacity: 0,
            position: 'relative',
            zIndex: 3,
          }}>
            Invoxa
          </div>
          <div ref={logoRRef} style={{
            fontSize: '5rem',
            fontWeight: 500,
            color: '#f472b6',
            letterSpacing: '-0.02em',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            zIndex: 2,
            clipPath: 'inset(0 0 55% 0)',
          }}>
            Invoxa
          </div>
          <div ref={logoBRef} style={{
            fontSize: '5rem',
            fontWeight: 500,
            color: '#38bdf8',
            letterSpacing: '-0.02em',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            zIndex: 2,
            clipPath: 'inset(45% 0 0 0)',
          }}>
            Invoxa
          </div>
        </div>
        <div ref={taglineRef} style={{
          color: '#a78bfa',
          fontSize: '0.8rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginTop: '0.6rem',
          opacity: 0,
        }}>
          Financial Operations Platform
        </div>
        <div ref={underlineRef} style={{
          width: '0px',
          height: '2px',
          background: 'linear-gradient(90deg, #a78bfa, #34d399)',
          marginTop: '0.4rem',
          borderRadius: '2px',
        }} />
      </div>

      {/* Phase 2 — Left branding panel */}
      <div ref={leftContentRef} style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        zIndex: 9,
        opacity: 0,
      }}>
        <LoginBranding />
      </div>

      {/* Phase 2 — Right login panel */}
      <div ref={rightContentRef} style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        zIndex: 9,
        opacity: 0,
      }}>
        <LoginCard />
      </div>

    </div>
  )
}
