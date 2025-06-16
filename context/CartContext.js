import React, { createContext, useState, useContext } from 'react';

// Cria o Contexto do Carrinho. Este será usado para fornecer e consumir o estado do carrinho.
export const CartContext = createContext();

// Componente Provedor do Carrinho. Ele envolverá a parte da sua árvore de componentes
// que precisa ter acesso ao estado do carrinho.
export const CartProvider = ({ children }) => {
    // Estado para armazenar as receitas selecionadas no carrinho.
    // O formato será um objeto onde a chave é o id da receita e o valor é a quantidade selecionada.
    // Ex: { '1': 2, '5': 1 } significa 2 porções da receita ID 1 e 1 porção da receita ID 5.
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
                // Se a quantidade for 0 ou menos, remove a receita do carrinho
                delete newRecipes[recipeId];
            } else {
                // Caso contrário, atualiza a quantidade
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

    /**
     * Limpa o carrinho, removendo todas as receitas selecionadas.
     */
    const clearCart = () => {
        setSelectedRecipes({});
    };

    // O valor fornecido pelo contexto. Inclui o estado e as funções para manipulá-lo.
    const contextValue = {
        selectedRecipes,
        updateRecipeQuantity,
        getRecipeQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children} {/* Renderiza os componentes filhos que terão acesso ao contexto */}
        </CartContext.Provider>
    );
};

// Hook personalizado para facilitar o consumo do contexto em componentes funcionais.
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
