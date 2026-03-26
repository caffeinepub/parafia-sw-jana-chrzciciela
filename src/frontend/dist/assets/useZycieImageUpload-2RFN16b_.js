import { Y as useInternetIdentity, r as reactExports, aV as loadConfig, aW as HttpAgent, aX as StorageClient } from "./index-aJFlCKTC.js";
function useZycieImageUpload() {
  const { identity } = useInternetIdentity();
  const [uploading, setUploading] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const upload = async (file) => {
    var _a;
    setUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();
      const agentOptions = {
        host: config.backend_host
      };
      if (identity) {
        agentOptions.identity = identity;
      }
      const agent = new HttpAgent(agentOptions);
      if ((_a = config.backend_host) == null ? void 0 : _a.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {
        });
      }
      const storage = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent
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
export {
  useZycieImageUpload as u
};
