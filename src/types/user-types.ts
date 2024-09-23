export type UpdateUserPayload = {
  displayName?: string;
  phoneNumber?: string;
};

export type ChangePasswordPayload = {
  newPassword: string;
};
