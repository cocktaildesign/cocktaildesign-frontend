// Константы Sample Sale / Уценка.
// Принадлежность определяем только по точному moyskladId, не по названию.

export const SAMPLE_SALE_MOYSKLAD_ID = "b4121850-6ab7-11ef-0a80-01fa00116171";

// slug категории в Strapi: ms- + первые 8 символов moyskladId
export const SAMPLE_SALE_CATEGORY_SLUG = `ms-${SAMPLE_SALE_MOYSKLAD_ID.slice(0, 8)}`;

export const UTSENKA_COLLECTION_SLUG = "utsenka";
export const UTSENKA_COLLECTION_HREF = `/catalog/collection/${UTSENKA_COLLECTION_SLUG}`;
export const UTSENKA_LABEL = "Уценка";
