import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useCart } from '../context/CartContext';
import { AntDesign } from '@expo/vector-icons';

// Função auxiliar para capitalizar a primeira letra de uma string
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const localRecipeImages = {
    'arroz.png': require('../images/arroz.png'),
    'feijao.webp': require('../images/feijao.webp'),
    'carne.webp': require('../images/carne.webp'),
    'frango.png': require('../images/frango.png'),
    'macarrao.png': require('../images/macarrao.png'),
    'brigadeiro.png': require('../images/brigadeiro.png'),
    'bolo_cenoura.webp': require('../images/bolo_cenoura.webp'),
    'pudim.png': require('../images/pudim.png'),
};

export default function RecipeDetailScreen({ route, navigation, db }) {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { updateRecipeQuantity, getRecipeQuantity } = useCart();

    const currentQuantity = getRecipeQuantity(recipeId);

    useEffect(() => {
        const loadRecipeDetails = async () => {
            if (!db) {
                setError('Erro: Instância do banco de dados não disponível.');
                setLoading(false);
                return;
            }
            try {
                const fetchedRecipe = await db.getFirstAsync(
                    `SELECT id, nome, rendimento, descricao, path_imagem FROM tb_recipe WHERE id = ?;`,
                    [recipeId]
                );
                setRecipe(fetchedRecipe);

                const fetchedIngredients = await db.getAllAsync(
                    `
                    SELECT
                        ing.nome AS nome_ingrediente
                    FROM
                        tb_recipe_ingredient AS ri
                    JOIN
                        tb_ingredient AS ing ON ing.id = ri.id_ingredient
                    WHERE
                        ri.id_recipe = ?;
                    `,
                    [recipeId]
                );
                setIngredients(fetchedIngredients);

                setError('');
            } catch (err) {
                console.error('Erro ao carregar detalhes da receita:', err);
                setError('Não foi possível carregar os detalhes da receita. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        loadRecipeDetails();
    }, [db, recipeId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Carregando detalhes da receita...</Text>
            </View>
        );
    }

    if (error || !recipe) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'Receita não encontrada.'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={localRecipeImages[recipe.path_imagem] || { uri: `https://placehold.co/300x200/E0E0E0/A0A0A0?text=Sem+Foto` }}
                style={styles.recipeImage}
            />
            <Text style={styles.recipeTitle}>{recipe.nome}</Text>
            <Text style={styles.recipeDescription}>{recipe.descricao}</Text>
            <Text style={styles.recipeYield}>Rendimento: {recipe.rendimento}</Text>

            <View style={styles.ingredientsContainer}>
                <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
                {ingredients.length > 0 ? (
                    ingredients.map((ing, index) => (
                        <Text key={index} style={styles.ingredientItem}>• {capitalizeFirstLetter(ing.nome_ingrediente)}</Text>
                    ))
                ) : (
                    <Text style={styles.ingredientItem}>Nenhum ingrediente listado.</Text>
                )}
            </View>

            <View style={styles.addToCartContainer}>
                <Text style={styles.addToCartText}>Adicionar ao Carrinho:</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateRecipeQuantity(recipe.id, Math.max(0, currentQuantity - 1))}
                    >
                        <AntDesign name="minuscircleo" size={28} color="#FF6347" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{currentQuantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateRecipeQuantity(recipe.id, currentQuantity + 1)}
                    >
                        <AntDesign name="pluscircleo" size={28} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F5FCFF',
        padding: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#FF0000',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    recipeImage: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    recipeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    recipeDescription: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 22,
    },
    recipeYield: {
        fontSize: 16,
        color: '#777',
        marginBottom: 20,
    },
    ingredientsContainer: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    ingredientsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 5,
    },
    ingredientItem: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    addToCartContainer: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    addToCartText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButton: {
        padding: 10,
    },
    quantityText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 20,
        color: '#333',
    },
});
