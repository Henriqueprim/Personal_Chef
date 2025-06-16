import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { AntDesign } from '@expo/vector-icons';

// IMPORTAR TODAS AS SUAS IMAGENS LOCAIS AQUI
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

export default function HomeScreen({ navigation, route, db }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { updateRecipeQuantity, getRecipeQuantity, selectedRecipes } = useCart();

    const { userId } = route.params || {};

    // useLayoutEffect é ideal para configurar opções de navegação
    // pois ele é executado de forma síncrona após as renderizações, antes da tela ser pintada.
    useLayoutEffect(() => {
        // console.log("DEBUG HOME: useLayoutEffect disparado. userId:", userId); // Log para verificar se está rodando
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        // console.log("DEBUG HOME: Botão de Histórico Pressionado. userId:", userId); // Log ao clicar
                        navigation.navigate('OrderHistory', { userId: userId });
                    }}
                    style={{ marginRight: 15 }}
                    // hitSlop aumenta a área clicável sem alterar o visual do ícone, pode ajudar na interação
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <AntDesign name="profile" size={24} color="#007BFF" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, userId]); // Dependências: navigation é estável, userId pode mudar no login

    useEffect(() => {
        const loadRecipes = async () => {
            if (!db) {
                setError('Erro: Instância do banco de dados não disponível.');
                setLoading(false);
                return;
            }
            try {
                const fetchedRecipes = await db.getAllAsync(`SELECT id, nome, rendimento, descricao, path_imagem FROM tb_recipe;`);
                setRecipes(fetchedRecipes);
                setError('');
            } catch (err) {
                console.error('Erro ao carregar receitas:', err);
                setError('Não foi possível carregar as receitas. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        loadRecipes();
    }, [db]);

    const renderRecipeCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id, userId: userId })}
        >
            <Image
                source={localRecipeImages[item.path_imagem] || { uri: `https://placehold.co/100x100/E0E0E0/A0A0A0?text=Sem+Foto` }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardYield}>{item.rendimento}</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateRecipeQuantity(item.id, Math.max(0, getRecipeQuantity(item.id) - 1))}
                    >
                        <AntDesign name="minuscircleo" size={24} color="#FF6347" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{getRecipeQuantity(item.id)}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateRecipeQuantity(item.id, getRecipeQuantity(item.id) + 1)}
                    >
                        <AntDesign name="pluscircleo" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Carregando receitas...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Nossas Receitas</Text>
            <FlatList
                data={recipes}
                renderItem={renderRecipeCard}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={styles.listContentContainer}
            />
            {Object.keys(selectedRecipes).length > 0 && (
                <TouchableOpacity
                    style={styles.viewCartButton}
                    onPress={() => navigation.navigate('OrderSummary', { userId: userId })}
                >
                    <Text style={styles.viewCartButtonText}>Ver Carrinho ({Object.keys(selectedRecipes).length})</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop: 20,
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
    },
    errorText: {
        fontSize: 18,
        color: '#FF0000',
        textAlign: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 80,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    cardYield: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    quantityButton: {
        padding: 5,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#333',
    },
    viewCartButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#007BFF',
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    viewCartButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
