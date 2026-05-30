'use client'
import { type ReactNode } from 'react'

interface SectionHeadProps {
  eyebrow: string
  title: ReactNode
  sub?: string
  center?: boolean
}

export default function SectionHead({ eyebrow, title, sub, center }: SectionHeadProps) {
  return (
    <div className={`sec-head${center ? ' center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="sec-title">{title}</h2>
      {sub && <p className="sec-sub">{sub}</p>}
    </div>
  )
}
