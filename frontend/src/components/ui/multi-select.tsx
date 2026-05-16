import * as React from "react"
import { X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectContextType {
  values: string[]
  onValuesChange: (values: string[]) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const MultiSelectContext = React.createContext<MultiSelectContextType>({
  values: [],
  onValuesChange: () => {},
  open: false,
  setOpen: () => {},
})

interface MultiSelectProps {
  values: string[]
  onValuesChange: (values: string[]) => void
  children: React.ReactNode
}

const MultiSelect = ({ values, onValuesChange, children }: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false)
  return (
    <MultiSelectContext.Provider value={{ values, onValuesChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </MultiSelectContext.Provider>
  )
}

interface MultiSelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
}

const MultiSelectTrigger = React.forwardRef<HTMLDivElement, MultiSelectTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const { open, setOpen } = React.useContext(MultiSelectContext)
    return (
      <div
        ref={ref}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>
    )
  }
)
MultiSelectTrigger.displayName = "MultiSelectTrigger"

const MultiSelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { values } = React.useContext(MultiSelectContext)
  if (values.length === 0) {
    return <span className="text-muted-foreground">{placeholder}</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium"
        >
          {value}
        </span>
      ))}
    </div>
  )
}

const MultiSelectContent = ({ children }: { children: React.ReactNode }) => {
  const { open } = React.useContext(MultiSelectContext)
  if (!open) return null
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
      <div className="p-1">{children}</div>
    </div>
  )
}

const MultiSelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

interface MultiSelectItemProps {
  value: string
  children: React.ReactNode
}

const MultiSelectItem = ({ value, children }: MultiSelectItemProps) => {
  const { values, onValuesChange } = React.useContext(MultiSelectContext)
  const isSelected = values.includes(value)

  const toggle = () => {
    if (isSelected) {
      onValuesChange(values.filter((v) => v !== value))
    } else {
      onValuesChange([...values, value])
    }
  }

  return (
    <div
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent"
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded-sm border border-primary flex items-center justify-center",
          isSelected && "bg-primary text-primary-foreground"
        )}
      >
        {isSelected && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {children}
    </div>
  )
}

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
}