async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export interface UploadedAsset {
  id: string;
  name: string;
  storedName: string;
  size: number;
  sha256: string;
  createdAt: string;
}

export const northStarApi = {
  getWorkspace: () => json<any>("/api/northstar/workspace"),
  saveWorkspace: (state: unknown, version = 1) =>
    json<any>("/api/northstar/workspace", {
      method: "PUT",
      body: JSON.stringify({ state, version }),
    }),
  uploadArchive: async (file: File): Promise<UploadedAsset> => {
    const response = await fetch("/api/northstar/assets", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": file.type || "application/zip",
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: file,
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  },
};
