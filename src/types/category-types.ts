export type CreateCategoryPayload = {
  name: string;
  iconUrl: string;
};

export type UpdateCategoryPayload = {
  name?: string;
  iconUrl: string;
};
