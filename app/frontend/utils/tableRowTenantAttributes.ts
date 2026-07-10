import type { HTMLAttributes } from 'react'

type TenantScopedRecord = {
  tenantId?: string | number | null
}

export const getTenantRowAttributes = (record?: TenantScopedRecord | null): HTMLAttributes<HTMLElement> => {
  if (record == null) return {}

  const { tenantId } = record

  if (tenantId === undefined) return {}

  const value = tenantId === null ? 'TTE' : String(tenantId)

  return { 'data-tenant-id': value } as HTMLAttributes<HTMLElement>
}
