'use client'
import { useEffect, useRef } from 'react'

const SYMBOLS = ['$', '₹', '€', '£', '¥', '₿', '$', '$', '₹']
const COIN_COLORS = ['#facc15', '#fbbf24', '#34d399', '#a78bfa', '#f472b6', '#818cf8']
const BILL_COLORS = ['#4f46e5', '#6366f1', '#7c3aed', '#5b21b6']

function rand(a: number, b: number) { return Math.random() * (b - a) + a }

export function CashAnimation({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let spawnTimer: ReturnType<typeof setTimeout> | null = null
    let destroyed = false

    const spawnSymbol = () => {
      const el = document.createElement('div')
      el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      const size = rand(11, 24)
      const x = rand(1, 96)
      el.style.cssText = `position:absolute;left:${x}%;top:108%;font-size:${size}px;color:rgba(167,139,250,0.72);pointer-events:none;will-change:transform,opacity;`
      container.appendChild(el)
      return el
    }

    const spawnBill = () => {
      const el = document.createElement('div')
      const w = rand(28, 50); const h = w * 0.44
      const x = rand(2, 90)
      const color = BILL_COLORS[Math.floor(Math.random() * BILL_COLORS.length)]
      const s = document.createElement('span')
      s.textContent = '$'
      s.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(255,255,255,0.4);font-size:${h * 0.6}px;font-weight:500;`
      el.appendChild(s)
      el.style.cssText = `position:absolute;left:${x}%;top:110%;width:${w}px;height:${h}px;background:${color};border-radius:3px;opacity:0;pointer-events:none;border:1px solid rgba(255,255,255,0.15);will-change:transform,opacity;`
      container.appendChild(el)
      return el
    }

    const spawnCoin = () => {
      const el = document.createElement('div')
      const size = rand(7, 16); const x = rand(2, 95)
      const color = COIN_COLORS[Math.floor(Math.random() * COIN_COLORS.length)]
      el.style.cssText = `position:absolute;left:${x}%;top:110%;width:${size}px;height:${size}px;background:${color};border-radius:50%;opacity:0;pointer-events:none;will-change:transform,opacity;`
      container.appendChild(el)
      return el
    }

    const animate = async () => {
      const animeModule: any = await import('animejs')
      const anime = animeModule.default || animeModule

      const animateSymbol = (el: HTMLElement) => {
        anime({
          targets: el,
          translateY: [-(rand(380, 540))],
          translateX: [(rand(-55, 55))],
          rotate: [(rand(-280, 280))],
          opacity: [
            { value: 0, duration: 0 },
            { value: 0.85, duration: 350 },
            { value: 0.85, duration: rand(1600, 2400) },
            { value: 0, duration: 350 }
          ],
          duration: rand(2800, 4400),
          easing: 'easeInOutSine',
          complete: () => { el.remove() }
        })
      }

      const animateBill = (el: HTMLElement) => {
        anime({
          targets: el,
          translateY: [-(rand(360, 520))],
          translateX: [(rand(-40, 40))],
          rotate: [(rand(-18, 18))],
          opacity: [
            { value: 0, duration: 0 },
            { value: 0.6, duration: 500 },
            { value: 0.6, duration: rand(1200, 2000) },
            { value: 0, duration: 500 }
          ],
          duration: rand(2800, 4200),
          easing: 'easeOutCubic',
          complete: () => { el.remove() }
        })
      }

      const animateCoin = (el: HTMLElement) => {
        anime({
          targets: el,
          translateY: [-(rand(300, 500))],
          translateX: [(rand(-30, 30))],
          opacity: [
            { value: 0, duration: 0 },
            { value: 0.9, duration: 280 },
            { value: 0.9, duration: rand(800, 1600) },
            { value: 0, duration: 280 }
          ],
          duration: rand(1800, 3200),
          easing: 'easeOutQuad',
          complete: () => { el.remove() }
        })
      }

      // Initial burst
      for (let i = 0; i < 18; i++) {
        setTimeout(() => {
          if (destroyed) return
          animateSymbol(spawnSymbol())
          if (Math.random() > 0.5) animateCoin(spawnCoin())
          if (Math.random() > 0.65) animateBill(spawnBill())
        }, i * 120)
      }

      // Continuous spawn loop
      const loop = () => {
        if (destroyed) return
        const r = Math.random()
        if (r < 0.5) animateSymbol(spawnSymbol())
        else if (r < 0.75) animateCoin(spawnCoin())
        else animateBill(spawnBill())
        spawnTimer = setTimeout(loop, rand(70, 200))
      }
      loop()
    }

    animate()

    return () => {
      destroyed = true
      if (spawnTimer) clearTimeout(spawnTimer)
      container.innerHTML = ''
    }
  }, [containerRef])

  return null
}
