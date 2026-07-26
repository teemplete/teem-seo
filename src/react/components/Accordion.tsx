'use client'

import { useId, useState, type ReactNode } from 'react'

export interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
}: AccordionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const panelId = useId()
  const buttonId = useId()

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div className={['teemseo-accordion', open ? 'is-open' : '', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        id={buttonId}
        className="teemseo-accordion__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <span className="teemseo-accordion__title">{title}</span>
        <span className="teemseo-accordion__chevron" aria-hidden />
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="teemseo-accordion__panel"
        >
          {children}
        </div>
      )}
    </div>
  )
}
