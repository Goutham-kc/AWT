import React, { createContext, useState, useEffect, useContext } from 'react';

export interface CartItem {
  listingId: string;
  title: string;
  pricePerDay: number;
  deposit: number;
  startDate: string;
  endDate: string;
  days: number;
  subtotal: number;
  serviceFee: number;
  grandTotal: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  homeCampus: string;
  referralCode: string;
  referralCredits: number;
}

interface AppContextType {
  token: string | null;
  user: User | null;
  cart: CartItem[];
  login: (token: string, user: User) => void;
  logout: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  updateUserCredits: (credits: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load User profile & Cart from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Fetch updated user details if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then(userData => {
          const mappedUser: User = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            institution: userData.institution,
            homeCampus: userData.homeCampus,
            referralCode: userData.referralCode,
            referralCredits: userData.referralCredits
          };
          setUser(mappedUser);
          localStorage.setItem('user', JSON.stringify(mappedUser));
        })
        .catch(() => {
          logout();
        });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

  const addToCart = (item: CartItem) => {
    const updatedCart = [...cart.filter(i => i.listingId !== item.listingId), item];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (listingId: string) => {
    const updatedCart = cart.filter(i => i.listingId !== listingId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const updateUserCredits = (credits: number) => {
    if (user) {
      const updatedUser = { ...user, referralCredits: credits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AppContext.Provider value={{
      token,
      user,
      cart,
      login,
      logout,
      addToCart,
      removeFromCart,
      clearCart,
      updateUserCredits
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
