export const defaultStoreSearchProductFields = [
  "id",
  "title",
  "handle",
  "thumbnail",
  "created_at",
  "updated_at",
];

export const listProductQueryConfig = {
  isList: true,
  defaults: defaultStoreSearchProductFields,
  defaultLimit: 50,
};
