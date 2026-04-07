import { loadConfig } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

export function useZycieImageUpload() {
  const { identity } = useInternetIdentity();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();
      const agentOptions: Record<string, unknown> = {
        host: config.backend_host,
      };
      if (identity) {
        agentOptions.identity = identity;
      }
      const agent = new HttpAgent(agentOptions);
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storage = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storage.putFile(bytes, (pct) => setProgress(pct));
      const url = await storage.getDirectURL(hash);
      return url;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { upload, uploading, progress };
}
