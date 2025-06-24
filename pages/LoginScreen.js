import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

function LoginScreen({ navigation, db }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setErrorMessage('');

        if (!db) {
            setErrorMessage('Erro: Banco de dados não disponível. Tente novamente mais tarde.');
            console.error('Instância do banco de dados não foi passada para LoginScreen.');
            return;
        }

        if (!email || !password) {
            setErrorMessage('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const user = await db.getFirstAsync(
                `SELECT id, nome, email FROM tb_user WHERE email = ? AND senha = ?;`,
                [email, password]
            );

            if (user) {
                Alert.alert('Sucesso!', `Bem-vindo, ${user.nome}!`, [
                    { text: 'OK', onPress: () => {
                        navigation.navigate('Home', { userId: user.id });
                        console.log('Login bem-sucedido, usuário:', user);
                    }}
                ]);
            } else {
                setErrorMessage('Email ou senha inválidos.');
            }
        } catch (error) {
            console.error('Erro ao tentar fazer login:', error);
            setErrorMessage('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        }
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.container} 
                keyboardShouldPersistTaps="handled" 
            >
                <Image
                    source={require('../images/logoCut.png')}
                    style={styles.logo}
                />

                <Text style={styles.title}>Bem-vindo ao Personal Chef</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <View style={styles.passwordInputContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Senha"
                        placeholderTextColor="#A0A0A0"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Feather
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={24}
                            color="#A0A0A0"
                        />
                    </TouchableOpacity>
                </View>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Ainda não tem cadastro? Cadastre-se</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1, 
    },
    container: {
        flexGrow: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5FCFF',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#FFF',
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        paddingHorizontal: 15,
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerButton: {
        marginTop: 20,
        padding: 10,
    },
    registerButtonText: {
        color: '#007BFF',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    errorText: {
        color: '#FF0000',
        marginBottom: 10,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default LoginScreen;
