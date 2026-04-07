/**
 * App-specific useActor wrapper.
 * Bridges @caffeineai/core-infrastructure's useActor (which takes a createActor fn)
 * with this app's generated createActor from backend.ts.
 */
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { type backendInterface, createActor } from "../backend";

export function useActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  return _useActor(createActor) as {
    actor: backendInterface | null;
    isFetching: boolean;
  };
}
