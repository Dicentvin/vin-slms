import * as React from "react"
import { cn } from "@/lib/utils"

function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

function FieldLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />
}

function FieldError({ errors }: { errors: any[] }) {
  const error = errors?.[0]
  if (!error) return null
  return (
    <p className="text-sm font-medium text-destructive">
      {error?.message ?? "Invalid value"}
    </p>
  )
}

export { Field, FieldLabel, FieldGroup, FieldError }