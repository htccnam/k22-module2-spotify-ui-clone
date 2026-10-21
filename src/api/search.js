import { University } from "lucide-react";
import { api } from "./client";

export const searchApi = {
  trending: (limit = 10) =>
    api.get("api/search/trending", { params: { limit } }),
  universal: (q, { type = "all", limit = 6, offset = 0 } = {}) =>
    api.get("/api/search", { params: { q, type, limit, offset } }),
};
