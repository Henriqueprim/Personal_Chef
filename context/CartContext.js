import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
   
    const [selectedRecipes, setSelectedRecipes] = useState({});

    /**
     * Adiciona ou atualiza a quantidade de uma receita no carrinho.
     * @param {number} recipeId - O ID da receita.
     * @param {number} quantity - A quantidade a ser definida para a receita.
     */
    const updateRecipeQuantity = (recipeId, quantity) => {
        setSelectedRecipes(prevRecipes => {
            const newRecipes = { ...prevRecipes };
            if (quantity <= 0) {
                delete newRecipes[recipeId];
            } else {
                newRecipes[recipeId] = quantity;
            }
            return newRecipes;
        });
    };

    /**
     * Retorna a quantidade atual de uma receita no carrinho.
     * @param {number} recipeId - O ID da receita.
     * @returns {number} A quantidade da receita, ou 0 se não estiver no carrinho.
     */
    const getRecipeQuantity = (recipeId) => {
        return selectedRecipes[recipeId] || 0;
    };


    const clearCart = () => {
        setSelectedRecipes({});
    };

    const contextValue = {
        selectedRecipes,
        updateRecipeQuantity,
        getRecipeQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children} 
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
