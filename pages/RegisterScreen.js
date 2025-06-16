import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Importar ícones para o olho da senha

export default function RegisterScreen({ navigation, db }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Novos estados para controlar a visibilidade das senhas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        setErrorMessage('');

        if (!db) {
            setErrorMessage('Erro: Banco de dados não disponível. Tente novamente mais tarde.');
            console.error('Instância do banco de dados não foi passada para RegisterScreen.');
            return;
        }

        if (!nome || !email || !password || !confirmPassword) {
            setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('As senhas não coincidem.');
            return;
        }

        try {
            const existingUser = await db.getFirstAsync(
                `SELECT id FROM tb_user WHERE email = ?;`,
                [email]
            );

            if (existingUser) {
                setErrorMessage('Este e-mail já está cadastrado. Tente outro.');
                return;
            }

            const result = await db.runAsync(
                `INSERT INTO tb_user (nome, senha, email, telefone, endereco) VALUES (?, ?, ?, ?, ?);`,
                [nome, password, email, telefone, endereco]
            );

            if (result.lastInsertRowId) {
                Alert.alert('Sucesso!', 'Sua conta foi criada com sucesso! Você será logado automaticamente.', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.replace('Home', { userId: result.lastInsertRowId });
                        }
                    }
                ]);
            } else {
                setErrorMessage('Não foi possível realizar o cadastro. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao tentar registrar:', error);
            setErrorMessage('Ocorreu um erro ao tentar registrar. Tente novamente.');
        }
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
                <Text style={styles.title}>Crie sua conta</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#A0A0A0"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Campo de Senha com botão de visualização */}
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Senha"
                        placeholderTextColor="#A0A0A0"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword} // Controlado pelo estado
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)} // Alterna a visibilidade
                    >
                        <Feather
                            name={showPassword ? 'eye' : 'eye-off'} // Altera o ícone
                            size={24}
                            color="#A0A0A0"
                        />
                    </TouchableOpacity>
                </View>

                {/* Campo de Confirmação de Senha com botão de visualização */}
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirmar Senha"
                        placeholderTextColor="#A0A0A0"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword} // Controlado pelo estado
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)} // Alterna a visibilidade
                    >
                        <Feather
                            name={showConfirmPassword ? 'eye' : 'eye-off'} // Altera o ícone
                            size={24}
                            color="#A0A0A0"
                        />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Telefone (opcional)"
                    placeholderTextColor="#A0A0A0"
                    value={telefone}
                    onChangeText={setTelefone}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Endereço completo (opcional)"
                    placeholderTextColor="#A0A0A0"
                    value={endereco}
                    onChangeText={setEndereco}
                    multiline
                    numberOfLines={3}
                />

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Registrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Já tem uma conta? Voltar para o Login</Text>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
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
    passwordInputContainer: { // Novo estilo para o container do input de senha com ícone
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
    passwordInput: { // Estilo para o TextInput dentro do container de senha
        flex: 1, // Faz o TextInput ocupar o espaço restante
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: { // Estilo para o botão do ícone de olho
        paddingHorizontal: 15,
    },
    registerButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#28A745',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
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
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    backButtonText: {
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
