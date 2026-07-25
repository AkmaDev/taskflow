import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpClient, HttpError, HttpTimeoutError } from "../src/http/client.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("HttpClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envoie une requête GET vers baseUrl + path", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));
    const client = new HttpClient("https://api.test");

    const result = await client.get<{ id: number }>("/tasks/1");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/tasks/1");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET" });
    expect(result).toEqual({ id: 1 });
  });

  it("envoie le corps en JSON pour POST", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new HttpClient("https://api.test");

    await client.post("/tasks", { text: "Réviser" });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ text: "Réviser" }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("supporte PUT et DELETE", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ ok: true })));
    const client = new HttpClient("https://api.test");

    await client.put("/tasks/1", { done: true });
    await client.delete("/tasks/1");

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "PUT" });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "DELETE" });
  });

  it("lève une HttpError typée quand le statut n'est pas 2xx", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "introuvable" }, 404));
    const client = new HttpClient("https://api.test");

    await expect(client.get("/tasks/99")).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
      body: { message: "introuvable" },
    });
  });

  it("lève une HttpTimeoutError quand la requête dépasse le délai imparti", async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    const client = new HttpClient("https://api.test");

    await expect(client.get("/lent", { timeoutMs: 5 })).rejects.toBeInstanceOf(HttpTimeoutError);
  });

  it("applique les interceptors enregistrés avant l'envoi", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new HttpClient("https://api.test");
    client.use((request) => ({
      ...request,
      headers: { ...request.headers, Authorization: "Bearer token" },
    }));

    await client.get("/protege");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token");
  });
});

describe("HttpError", () => {
  it("expose le statut et le corps de la réponse", () => {
    const error = new HttpError("échec", 500, { detail: "boom" });
    expect(error.status).toBe(500);
    expect(error.body).toEqual({ detail: "boom" });
  });
});
