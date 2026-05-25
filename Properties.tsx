import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const EXCLUDED = new Set(["title", "tags", "aliases", "cssclasses", "publish", "draft", "date", "created", "modified", "description"])

function parseValue(val: unknown): string {
  if (val === null || val === undefined) return ""
  if (val instanceof Date) return val.toLocaleDateString("pt-BR")
  if (Array.isArray(val)) return val.map(parseValue).filter(Boolean).join(", ")
  const s = String(val)
  return s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_: string, link: string, label: string) => label || link)
}

const Properties: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const fm = fileData.frontmatter as Record<string, unknown> | undefined
  if (!fm) return null

  const entries = Object.entries(fm).filter(([key, val]) => {
    if (EXCLUDED.has(key.toLowerCase())) return false
    if (val === null || val === undefined || val === "" || val === "Sem valor") return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  })

  if (entries.length === 0) return null

  return (
    <div class="properties-block">
      <p class="properties-title">Propriedades</p>
      <table class="properties-table">
        <tbody>
          {entries.map(([key, val]) => {
            const display = parseValue(val)
            if (!display) return null
            return (
              <tr>
                <td class="prop-key">{key}</td>
                <td class="prop-value">{display}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

Properties.displayName = "Properties"
export default (() => Properties) satisfies QuartzComponentConstructor
