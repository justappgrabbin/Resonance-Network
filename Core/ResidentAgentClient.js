const DEFAULT_RESIDENT_URL = 'http://127.0.0.1:6969';

class ResidentAgentClient {
  constructor(baseUrl = DEFAULT_RESIDENT_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.lastProbe = null;
  }

  url(path = '/') {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  textUrl() {
    return this.url('/?panel=ground&focus=chat');
  }

  peekUrl() {
    return this.url('/?panel=world');
  }

  async probe(timeoutMs = 1800) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('resident probe timeout')), timeoutMs)
    );
    try {
      const response = await Promise.race([
        fetch(this.url('/'), { method: 'GET' }),
        timeout,
      ]);
      this.lastProbe = {
        online: Boolean(response && response.ok),
        status: response?.status ?? null,
        checkedAt: new Date().toISOString(),
        baseUrl: this.baseUrl,
      };
    } catch (error) {
      this.lastProbe = {
        online: false,
        status: null,
        checkedAt: new Date().toISOString(),
        baseUrl: this.baseUrl,
        error: error?.message || String(error),
      };
    }
    return this.lastProbe;
  }
}

export const residentAgentClient = new ResidentAgentClient();
export { ResidentAgentClient, DEFAULT_RESIDENT_URL };
