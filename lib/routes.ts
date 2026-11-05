import type { Href } from "expo-router";

export function workoutSessionHref(id: string): Href {
  return { pathname: "/workout/[id]", params: { id } } as unknown as Href;
}

export const workoutCompleteHref = "/workout/complete" as Href;
export const workoutHistoryHref = "/workout/history" as Href;

export function workoutCompleteHrefWithSummary(params: {
  title: string;
  duration: string;
  sets: string;
  volume: string;
}): Href {
  return {
    pathname: "/workout/complete",
    params,
  } as unknown as Href;
}
