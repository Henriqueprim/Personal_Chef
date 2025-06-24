import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { openDatabaseAsync } from 'expo-sqlite';
import { criarTabelas, popularBanco } from './database/db';

LogBox.ignoreLogs(['Warning: Text strings must be rendered within a <Text> component.']);


import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import HomeScreen from './pages/HomeScreen'; 
import RecipeDetailScreen from './pages/RecipeDetailScreen';
import OrderSummaryScreen from './pages/OrderSummaryScreen';
import OrderHistoryScreen from './pages/OrderHistoryScreen';

import { CartProvider } from './context/CartContext';

const Stack = createNativeStackNavigator();

function App() {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAppDb = async () => {
      try {
        const database = await openDatabaseAsync('personal_chef.db');
        setDb(database);
        await criarTabelas(database);
        await popularBanco(database);
        console.log('Banco de dados inicializado e tabelas criadas/populadas em App.js');
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados em App.js:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAppDb();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Carregando aplicativo...</Text>
      </View>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => <LoginScreen {...props} db={db} />}
          </Stack.Screen>

          <Stack.Screen name="Register" options={{ title: 'Criar Conta' }}>
            {props => <RegisterScreen {...props} db={db} />}
          </Stack.Screen>

          <Stack.Screen
            name="Home"
            options={{
              title: 'Personal Chef',
              headerLeft: () => null, 
            }}
          >
            {props => <HomeScreen {...props} db={db} />}
          </Stack.Screen>

          <Stack.Screen name="RecipeDetail" options={{ title: 'Detalhes da Receita' }}>
            {props => <RecipeDetailScreen {...props} db={db} />}
          </Stack.Screen>

          <Stack.Screen name="OrderSummary" options={{ title: 'Finalizar Pedido' }}>
            {props => <OrderSummaryScreen {...props} db={db} />}
          </Stack.Screen>

          <Stack.Screen name="OrderHistory" options={{ title: 'Meus Pedidos' }}>
            {props => <OrderHistoryScreen {...props} db={db} />}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;
