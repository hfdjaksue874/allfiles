
import React, { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const triggerRefresh = () => {
    setShouldRefresh(true);
  };

  const resetRefresh = () => {
    setShouldRefresh(false);
  };

  return (
    <ProductContext.Provider value={{
      shouldRefresh,
      triggerRefresh,
      resetRefresh
    }}>
      {children}
    </ProductContext.Provider>
  );
};
