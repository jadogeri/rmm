// packages/constants/src/endpoints.ts

export namespace API_ENDPOINTS {
  const TICKETS_BASE = 'tickets';

  // Mark your properties as readonly
  export const TICKETS = {
    BASE: TICKETS_BASE,
    BY_ID: (id: string) => `${TICKETS_BASE}/${id}`,
    ALL_FILTERED: `${TICKETS_BASE}?%24top=5&%24orderby=CreatedDate+desc`,
  } as const; // 👈 Keep 'as const' to make properties deeply frozen and readonly
}
