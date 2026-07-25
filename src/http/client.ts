/** Erreur levée quand le serveur répond avec un statut HTTP en dehors de 2xx. */
export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Erreur levée quand la requête dépasse le délai imparti. */
export class HttpTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`La requête a dépassé le délai de ${timeoutMs} ms.`);
    this.name = "HttpTimeoutError";
  }
}

interface PendingRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/** Transforme une requête avant son envoi (auth, logging, en-têtes communs…) — un point d'extension façon Strategy. */
export type HttpInterceptor = (request: PendingRequest) => PendingRequest;

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/** Client HTTP basé sur fetch : GET/POST/PUT/DELETE, timeout, erreurs typées et interceptors de requête. */
export class HttpClient {
  private readonly interceptors: HttpInterceptor[] = [];

  constructor(
    private readonly baseUrl = "",
    private readonly defaultTimeoutMs = 8000,
  ) {}

  /** Enregistre un interceptor exécuté sur chaque requête, avant l'envoi. */
  use(interceptor: HttpInterceptor): void {
    this.interceptors.push(interceptor);
  }

  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("PUT", path, body, options);
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  private async request<T>(method: string, path: string, body: unknown, options?: HttpRequestOptions): Promise<T> {
    let pending: PendingRequest = {
      url: `${this.baseUrl}${path}`,
      method,
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    };

    for (const interceptor of this.interceptors) {
      pending = interceptor(pending);
    }

    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(pending.url, {
        method: pending.method,
        headers: pending.headers,
        body: pending.body,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new HttpTimeoutError(timeoutMs);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const payload = await this.parseBody(response);

    if (!response.ok) {
      throw new HttpError(`Requête ${method} ${pending.url} échouée avec le statut ${response.status}`, response.status, payload);
    }

    return payload as T;
  }

  private async parseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    const text = await response.text();
    return text === "" ? undefined : text;
  }
}
