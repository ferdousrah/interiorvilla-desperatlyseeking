import React from 'react'

type FormatNode =
  | { type: 'text'; value: string }
  | { type: 'link'; href: string; children: FormatNode[] }
  | { type: 'bold'; children: FormatNode[] }
  | { type: 'underline'; children: FormatNode[] }
  | { type: 'italic'; children: FormatNode[] }

// Order matters: links first, then bold (**), then underline (__ or _),
// then italic (*). Double-char markers are listed before single-char ones
// so they win when both could match at the same position.
const PATTERN =
  /\[([^\]]+)\]\(([^)]+)\)|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|_([\s\S]+?)_|\*([\s\S]+?)\*/g

function isSafeHref(href: string): boolean {
  if (href.startsWith('/') || href.startsWith('#')) return true
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return true
  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function parse(input: string): FormatNode[] {
  const nodes: FormatNode[] = []
  let lastIndex = 0
  const re = new RegExp(PATTERN.source, 'g')
  let match: RegExpExecArray | null
  while ((match = re.exec(input)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: input.slice(lastIndex, match.index) })
    }
    if (match[1] !== undefined) {
      nodes.push({ type: 'link', href: match[2] ?? '', children: parse(match[1]) })
    } else if (match[3] !== undefined) {
      nodes.push({ type: 'bold', children: parse(match[3]) })
    } else if (match[4] !== undefined) {
      nodes.push({ type: 'underline', children: parse(match[4]) })
    } else if (match[5] !== undefined) {
      nodes.push({ type: 'underline', children: parse(match[5]) })
    } else if (match[6] !== undefined) {
      nodes.push({ type: 'italic', children: parse(match[6]) })
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < input.length) {
    nodes.push({ type: 'text', value: input.slice(lastIndex) })
  }
  return nodes
}

function renderNodes(nodes: FormatNode[], linkCls: string): React.ReactNode {
  return nodes.map((n, i) => {
    switch (n.type) {
      case 'text':
        return <React.Fragment key={i}>{n.value}</React.Fragment>
      case 'bold':
        return <strong key={i}>{renderNodes(n.children, linkCls)}</strong>
      case 'underline':
        return <u key={i}>{renderNodes(n.children, linkCls)}</u>
      case 'italic':
        return <em key={i}>{renderNodes(n.children, linkCls)}</em>
      case 'link': {
        if (!isSafeHref(n.href)) {
          return <React.Fragment key={i}>{renderNodes(n.children, linkCls)}</React.Fragment>
        }
        const external = /^https?:\/\//.test(n.href)
        return (
          <a
            key={i}
            href={n.href}
            className={linkCls}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {renderNodes(n.children, linkCls)}
          </a>
        )
      }
    }
  })
}

type FormattedTextProps = {
  text: string | null | undefined
  className?: string
  linkClassName?: string
}

export function FormattedText({ text, className, linkClassName }: FormattedTextProps) {
  if (!text) return null
  const linkCls = linkClassName ?? 'text-primary underline hover:text-primary/80'
  return <span className={className}>{renderNodes(parse(text), linkCls)}</span>
}

export function stripFormatting(text: string | null | undefined): string {
  if (!text) return ''
  let out = text
  // Repeatedly strip the innermost markers until no more match — handles nesting.
  for (let i = 0; i < 5; i++) {
    const next = out
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
      .replace(/__([\s\S]+?)__/g, '$1')
      .replace(/\*([\s\S]+?)\*/g, '$1')
      .replace(/_([\s\S]+?)_/g, '$1')
    if (next === out) break
    out = next
  }
  return out
}
