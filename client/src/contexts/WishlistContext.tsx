import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

interface WishlistContextType {
  favorites: number[];
  addFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  totalFavorites: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "portal_das_compras_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Carregar favoritos do localStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
    setLoaded(true);
  }, []);

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Erro ao salvar favoritos:", error);
      }
    }
  }, [favorites, loaded]);

  const addFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFavorite = useCallback((productId: number) => {
    setFavorites(prev => prev.filter(id => id !== productId));
  }, []);

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const isFavorite = useCallback((productId: number) => {
    return favorites.includes(productId);
  }, [favorites]);

  const totalFavorites = favorites.length;

  return (
    <WishlistContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, totalFavorites }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
