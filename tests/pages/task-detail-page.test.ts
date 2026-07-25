import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskDetailPage } from "../../src/pages/task-detail-page.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("TaskDetailPage", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche un état de chargement puis les données de la tâche distante", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1, title: "Réviser", completed: true, userId: 4 }));
    const container = document.createElement("div");

    new TaskDetailPage({ id: "1" }).mount(container);

    expect(container.textContent).toContain("Chargement");

    await flushMicrotasks();

    expect(fetchMock.mock.calls[0][0]).toBe("https://jsonplaceholder.typicode.com/todos/1");
    expect(container.querySelector("h2")?.textContent).toBe("Réviser");
    expect(container.textContent).toContain("terminée");
    expect(container.textContent).toContain("Utilisateur #4");
  });

  it("affiche un message d'erreur quand la requête échoue", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "introuvable" }, 404));
    const container = document.createElement("div");

    new TaskDetailPage({ id: "999" }).mount(container);
    await flushMicrotasks();

    expect(container.querySelector(".field-error")?.textContent).toBe("Impossible de charger cette tâche distante.");
  });
});
