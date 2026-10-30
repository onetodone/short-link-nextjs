import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

export function AccountField({
  id,
  label,
  description,
  error,
  value,
  onValueChange,
  ...inputProps
}: Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  id: string
  name: string
  label: string
  description?: string
  error?: string
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  )
}
