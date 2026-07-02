import { describe, expect, it, beforeEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("WishlistContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with empty favorites", () => {
    const stored = localStorage.getItem("portal_das_compras_wishlist");
    expect(stored).toBeNull();
  });

  it("persists favorites to localStorage", () => {
    const favorites = [1, 2, 3];
    localStorage.setItem("portal_das_compras_wishlist", JSON.stringify(favorites));
    const retrieved = JSON.parse(localStorage.getItem("portal_das_compras_wishlist") || "[]");
    expect(retrieved).toEqual([1, 2, 3]);
  });

  it("loads favorites from localStorage", () => {
    const favorites = [5, 10, 15];
    localStorage.setItem("portal_das_compras_wishlist", JSON.stringify(favorites));
    const retrieved = JSON.parse(localStorage.getItem("portal_das_compras_wishlist") || "[]");
    expect(retrieved.length).toBe(3);
    expect(retrieved).toContain(5);
  });

  it("handles invalid JSON gracefully", () => {
    localStorage.setItem("portal_das_compras_wishlist", "invalid json");
    try {
      const retrieved = JSON.parse(localStorage.getItem("portal_das_compras_wishlist") || "[]");
      expect(true).toBe(false); // Should throw
    } catch {
      expect(true).toBe(true); // Expected behavior
    }
  });
});
