import { isClient } from "@/constants/global.constants";
import { AppType } from "@/types/server-types/hono-app.types";
import { hc } from "hono/client";

export const getBaseUrl = () => {
  if (isClient) {
    return `${window.location.protocol}//${window.location.host}/`;
  } else {
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/";
  }
};

const client = hc<AppType>(getBaseUrl());
export const honoClient = client.api;
