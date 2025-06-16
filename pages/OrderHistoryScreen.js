import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { gerarListaDeCompras } from '../database/db'; // Importa a função para gerar lista de compras

// Função auxiliar para capitalizar a primeira letra de uma string
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function OrderHistoryScreen({ navigation, route, db }) {
    const { userId } = route.params || {}; // Obtém o userId dos parâmetros de navegação
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrderShoppingList, setSelectedOrderShoppingList] = useState([]);
    const [selectedOrderRecipes, setSelectedOrderRecipes] = useState([]); // Novo estado para as receitas do pedido
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false); // Novo estado para carregamento de detalhes

    useEffect(() => {
        const loadOrders = async () => {
            if (!db) {
                setError('Erro: Instância do banco de dados não disponível.');
                setLoadingOrders(false);
                return;
            }
            if (!userId) {
                setError('Erro: ID do usuário não disponível. Por favor, faça login novamente.');
                setLoadingOrders(false);
                return;
            }

            try {
                // Busca todos os pedidos para o userId logado, ordenados do mais recente para o mais antigo
                const fetchedOrders = await db.getAllAsync(
                    `SELECT id, order_date FROM tb_order WHERE id_user = ? ORDER BY order_date DESC;`,
                    [userId]
                );
                setOrders(fetchedOrders);
                setError('');
            } catch (err) {
                console.error('Erro ao carregar pedidos:', err);
                setError('Não foi possível carregar o histórico de pedidos. Tente novamente.');
            } finally {
                setLoadingOrders(false);
            }
        };

        loadOrders();
    }, [db, userId]); // Recarrega se o DB ou userId mudarem

    const handleViewOrderDetails = async (orderId, orderDate) => { // Agora recebe a data também
        if (!db) {
            setError('Erro: Banco de dados não disponível.');
            return;
        }
        setLoadingOrderDetails(true); // Ativa o loading para os detalhes do modal
        try {
            // 1. Gerar a lista de compras
            const list = await gerarListaDeCompras(db, orderId);
            setSelectedOrderShoppingList(list);

            // 2. Buscar as receitas associadas a este pedido e suas quantidades
            const recipesInOrder = await db.getAllAsync(
                `
                SELECT
                    r.nome AS recipe_name,
                    orp.multiplicador AS quantity
                FROM
                    tb_order_recipe AS orp
                JOIN
                    tb_recipe AS r ON r.id = orp.id_recipe
                WHERE
                    orp.id_order = ?;
                `,
                [orderId]
            );
            setSelectedOrderRecipes(recipesInOrder);

            // Armazena a data do pedido selecionado para exibir no modal
            setSelectedOrderDate(orderDate); // Você pode adicionar um state para isso se quiser exibir a data no modal

            setIsModalVisible(true); // Abre o modal
        } catch (err) {
            console.error('Erro ao carregar detalhes do pedido:', err);
            setError('Não foi possível carregar os detalhes deste pedido.');
        } finally {
            setLoadingOrderDetails(false); // Desativa o loading
        }
    };

    // Adicione um novo estado para a data do pedido selecionado no modal
    const [selectedOrderDate, setSelectedOrderDate] = useState('');

    const renderOrderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleViewOrderDetails(item.id, item.order_date)} // Passa a data do pedido
        >
            <Text style={styles.orderDate}>Data do Pedido: {new Date(item.order_date).toLocaleDateString('pt-BR')}</Text>
            <Text style={styles.orderId}>Pedido #{item.id}</Text>
            <AntDesign name="rightcircleo" size={20} color="#007BFF" style={styles.arrowIcon} />
        </TouchableOpacity>
    );

    if (loadingOrders) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Carregando pedidos...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Seu Histórico de Pedidos</Text>

            {orders.length === 0 ? (
                <Text style={styles.noOrdersText}>Você ainda não fez nenhum pedido.</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContentContainer}
                />
            )}

            {/* Modal para exibir os detalhes do pedido */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Detalhes do Pedido #{selectedOrderRecipes.length > 0 ? orders.find(o => o.order_date === selectedOrderDate)?.id : ''}</Text> {/* Exibe o ID do pedido */}
                        <Text style={styles.modalDate}>Data: {selectedOrderDate ? new Date(selectedOrderDate).toLocaleDateString('pt-BR') : 'N/A'}</Text>
                        
                        {loadingOrderDetails ? (
                            <ActivityIndicator size="large" color="#007BFF" />
                        ) : (
                            <ScrollView style={styles.detailsScroll}>
                                {/* Seção de Receitas no Pedido */}
                                <Text style={styles.sectionTitle}>Receitas:</Text>
                                {selectedOrderRecipes.length > 0 ? (
                                    selectedOrderRecipes.map((item, index) => (
                                        <Text key={index} style={styles.recipeItemText}>
                                            • {capitalizeFirstLetter(item.recipe_name)} (x{item.quantity})
                                        </Text>
                                    ))
                                ) : (
                                    <Text style={styles.noItemsTextSmall}>Nenhuma receita neste pedido.</Text>
                                )}

                                {/* Seção da Lista de Compras */}
                                <Text style={styles.sectionTitle}>Lista de Compras:</Text>
                                {selectedOrderShoppingList.length > 0 ? (
                                    selectedOrderShoppingList.map((item, index) => (
                                        <Text key={index} style={styles.shoppingListItemText}>
                                            {capitalizeFirstLetter(item.nome_ingrediente)}: {item.total_qtd.toFixed(0)}g
                                        </Text>
                                    ))
                                ) : (
                                    <Text style={styles.noItemsTextSmall}>Nenhum item na lista de compras.</Text>
                                )}
                            </ScrollView>
                        )}
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.closeModalButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
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
        marginTop: 20,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    orderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    orderDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    orderId: {
        fontSize: 14,
        color: '#888',
        flex: 1,
        marginLeft: 10,
    },
    arrowIcon: {
        marginLeft: 10,
    },
    noOrdersText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
        marginTop: 50,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fundo semitransparente
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        maxHeight: '80%', // Aumentado um pouco para caber mais conteúdo
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10, // Ajustado para dar espaço para a data
        color: '#333',
    },
    modalDate: {
        fontSize: 16,
        color: '#777',
        marginBottom: 20, // Espaço após a data
    },
    detailsScroll: {
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15, // Espaço entre as seções
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 5,
        width: '100%', // Para a linha sublinhada
    },
    recipeItemText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
        lineHeight: 22,
        textAlign: 'left',
        width: '100%', // Para garantir que o texto não se quebre estranhamente
    },
    shoppingListItemText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        lineHeight: 22,
        textAlign: 'left',
        width: '100%', // Para a linha sublinhada
    },
    noItemsTextSmall: { // Novo estilo para mensagens de "nenhum item" dentro das seções
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 10,
        width: '100%',
    },
    closeModalButton: {
        backgroundColor: '#007BFF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
        marginTop: 10,
    },
    closeModalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
