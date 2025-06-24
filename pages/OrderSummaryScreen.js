import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { gerarListaDeCompras } from '../database/db';

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function OrderSummaryScreen({ navigation, route, db }) {
    const { selectedRecipes, clearCart } = useCart();
    const [recipesDetails, setRecipesDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [orderDate, setOrderDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [finalizingOrder, setFinalizingOrder] = useState(false);
    const [shoppingList, setShoppingList] = useState(null);

    const { userId } = route.params || {};

    React.useEffect(() => {
        const loadSelectedRecipesDetails = async () => {
            if (!db) {
                Alert.alert('Erro', 'Banco de dados não disponível.');
                setLoadingDetails(false);
                return;
            }

            const recipeIdsInCart = Object.keys(selectedRecipes).map(Number);
            if (recipeIdsInCart.length === 0) {
                setRecipesDetails([]);
                setLoadingDetails(false);
                return;
            }

            setLoadingDetails(true);
            try {
                const placeholders = recipeIdsInCart.map(() => '?').join(',');
                const query = `SELECT id, nome, rendimento FROM tb_recipe WHERE id IN (${placeholders});`;
                const details = await db.getAllAsync(query, recipeIdsInCart);

                const combinedDetails = details.map(detail => ({
                    ...detail,
                    quantity: selectedRecipes[detail.id]
                }));
                setRecipesDetails(combinedDetails);
            } catch (error) {
                console.error("Erro ao carregar detalhes das receitas selecionadas:", error);
                Alert.alert("Erro", "Não foi possível carregar os detalhes das receitas do carrinho.");
            } finally {
                setLoadingDetails(false);
            }
        };

        loadSelectedRecipesDetails();
    }, [selectedRecipes, db]);

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirmDate = (date) => {
        setOrderDate(date);
        hideDatePicker();
    };


    const handleFinalizeOrder = async () => {
        if (recipesDetails.length === 0) {
            Alert.alert('Carrinho Vazio', 'Por favor, adicione itens ao seu carrinho antes de finalizar o pedido.');
            return;
        }

        if (finalizingOrder) return;
        if (!db) {
            Alert.alert('Erro', 'Banco de dados não disponível para finalizar o pedido.');
            return;
        }

        if (!userId) {
            Alert.alert('Erro', 'ID do usuário não disponível. Por favor, faça login novamente.');
            setFinalizingOrder(false);
            return;
        }

        setFinalizingOrder(true);
        try {
            const orderResult = await db.runAsync(
                `INSERT INTO tb_order (id_user, order_date) VALUES (?, ?);`,
                [userId, orderDate.toISOString().split('T')[0]]
            );
            const orderId = orderResult.lastInsertRowId;

            if (!orderId) {
                throw new Error('Falha ao criar o pedido. ID do pedido não retornado.');
            }

            for (const item of recipesDetails) {
                await db.runAsync(
                    `INSERT INTO tb_order_recipe (id_order, id_recipe, multiplicador) VALUES (?, ?, ?);`,
                    [orderId, item.id, item.quantity]
                );
            }

            const generatedList = await gerarListaDeCompras(db, orderId);
            setShoppingList(generatedList);

            clearCart();

            Alert.alert('Pedido Finalizado!', 'Seu pedido foi salvo e a lista de compras foi gerada.', [
                { text: 'OK', onPress: () => {} }
            ]);

        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao finalizar seu pedido. Tente novamente.');
            setShoppingList(null);
        } finally {
            setFinalizingOrder(false);
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Text style={styles.cartItemName}>{item.nome}</Text>
            <Text style={styles.cartItemQuantity}>x{item.quantity} porções</Text>
        </View>
    );

    if (loadingDetails) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Carregando carrinho...</Text>
            </View>
        );
    }

    if (shoppingList) {
        return (
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Lista de Compras Gerada</Text>
                {shoppingList.length > 0 ? (
                    <FlatList
                        data={shoppingList}
                        keyExtractor={(item, index) => item.nome_ingrediente + index}
                        renderItem={({ item }) => (
                            <View style={styles.shoppingListItem}>
                                <Text style={styles.shoppingListItemText}>
                                    {capitalizeFirstLetter(item.nome_ingrediente)}: {item.total_qtd.toFixed(0)}g
                                </Text>
                            </View>
                        )}
                        contentContainerStyle={styles.listContentContainer}
                    />
                ) : (
                    <Text style={styles.noItemsText}>Nenhum item na lista de compras.</Text>
                )}
                <TouchableOpacity
                    style={styles.backToHomeButton} 
                    onPress={() => {
                        setShoppingList(null); 
                        navigation.navigate('OrderHistory', { userId: userId }); 
                    }}
                >
                    <Text style={styles.backToHomeButtonText}>Ver meus pedidos</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Seu Pedido</Text>

            {recipesDetails.length > 0 ? (
                <FlatList
                    data={recipesDetails}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.listContentContainer}
                />
            ) : (
                <Text style={styles.noItemsText}>Seu carrinho está vazio.</Text>
            )}

            <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Data do Serviço:</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
                    <Text style={styles.datePickerButtonText}>
                        {orderDate ? orderDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                    minimumDate={new Date()}
                />
            </View>

            <TouchableOpacity
                style={styles.finalizeOrderButton}
                onPress={handleFinalizeOrder}
                disabled={finalizingOrder || recipesDetails.length === 0}
            >
                {finalizingOrder ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.finalizeOrderButtonText}>Finalizar Pedido</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        padding: 20,
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
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cartItemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    cartItemQuantity: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },
    noItemsText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
        marginTop: 50,
    },
    datePickerContainer: {
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
        width: '100%',
    },
    datePickerLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    datePickerButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#333',
    },
    finalizeOrderButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    finalizeOrderButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    shoppingListItem: {
        backgroundColor: '#E6F3F5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    shoppingListItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    backToHomeButton: { 
        marginTop: 30,
        backgroundColor: '#007BFF',
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    backToHomeButtonText: { 
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
