import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const generationsSearchParams = {
  query: parseAsString.withDefault(""),
};

export const generationsSearchParamsCache = createSearchParamsCache(
  generationsSearchParams,
);
