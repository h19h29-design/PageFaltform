export interface ApiEnvelope<TData> {
  ok: boolean;
  data?: TData;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationInput {
  page: number;
  pageSize: number;
}

export interface TenantScopedRequest {
  tenantId: string;
}

export function createSuccessEnvelope<TData>(data: TData): ApiEnvelope<TData> {
  return {
    ok: true,
    data
  };
}

export function createErrorEnvelope(
  code: string,
  message: string
): ApiEnvelope<never> {
  return {
    ok: false,
    error: {
      code,
      message
    }
  };
}

