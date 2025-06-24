# 🍳 Personal Chef


**Personal Chef** é um app Android desenvolvido como **Projeto de Extensão** da disciplina **Programação para Dispositivos Móveis em Android**. Ele visa oferecer um **controle de pedidos** e uma **lista de compras** eficiente para uma *personal chef* e seus clientes.

---

## 🚀 Funcionalidades

* 📋 Registro e gerenciamento de **pedidos**;
* 🛒 Geração de **lista de compras** baseada nos ingredientes dos pedidos;
* 👥 Interface simples para chef e clientes;
* 🎯 Fluxo otimizado para uso rápido em cozinha.

---

## 🧠 Estrutura do Projeto

* React Native + Expo (Managed ou Bare);
* Pastas principais:

  * `App.js` – ponto de entrada do app;
  * `pages/` – componentes de tela (ex: `LoginScreen.js`, `HomeScreen.js`);
  * `images/` – imagens das receitas;
  * `assets/` – Logo.png;
  * `database/` - scripts de criação e queries do banco de dados
  * `context/` - contextAPI para compartilhamento de dados entre componentes;

---

## 💻 Pré-requisitos

Para executar o projeto corretamente, certifique-se de ter os seguintes recursos instalados e configurados:

- **Node.js** (versão 16.x ou superior):
  - [Download Node.js](https://nodejs.org/)
  - Verifique com: `node -v`

- **npm** (gerenciador de pacotes que vem com o Node.js) ou **Yarn**:
  - Verifique com: `npm -v` ou `yarn -v`

- **Expo CLI** (para projetos Expo Managed):
  ```bash
  npm install -g expo-cli
  ```
  - Verifique a instalação com: `expo --version`

- **Expo Go App** (para testes no celular):
  - Baixe na [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) ou [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Escaneie o QR Code exibido após `expo start`

- **EAS CLI** (caso vá usar build local ou remota):
  ```bash
  npm install -g eas-cli
  ```
  - Verifique com: `eas --version`

- **Android Studio**:
  - Necessário para compilar APKs localmente (Bare Workflow);
  - Inclui emulador Android (AVD) para testes;

- **Dispositivo físico Android** (opcional):
  - Ative a depuração USB;
  - Conecte via cabo ou pela rede local.


## ⚖️ Instalação & Execução

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/Henriqueprim/Personal_Chef.git
   cd Personal_Chef
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Inicie o Metro Bundler:**

   ```bash
   npm start
   # ou
   expo start
   ```

4. **No emulador ou dispositivo:**

   - Use **Expo Go** ;
   - Ou no terminal:
     ```bash
     npx react-native run-android
     ```
     (no caso de Bare Workflow / ejetado)


## 📦 Gerando o APK

### A) **Se estiver utilizando Bare Workflow (projeto ejetado):**

1. Abra `android/` no Android Studio;
2. Vá em **Build → Build Bundle(s) / APK(s) → Build APK(s)**;
3. O APK estará em:\
   `android/app/build/outputs/apk/debug/app-debug.apk`

### B) **Com EAS CLI (local):**

```bash
eas build --platform android --local
```
** Só funcionando em Linux e MacOS.

Gera o APK em `dist/`.


## 🧩 Fluxo de Uso

1. **Cliente** registra e gerencia pedidos via app;
2. App gera a **lista de compras** necessária automaticamente;
3. **Cliente** visualiza seu pedido e lista no app.

Ideia central: tornar a organização dos pedidos e compras mais eficiente para chefs pessoais.

---

## 🎓 Sobre o Projeto

> **Disciplina**: Programação para Dispositivos Móveis em Android
> **Tipo de Atividade**: Projeto de Extensão
> **Objetivo**: Desenvolver habilidades de desenvolvimento mobile e entregar uma solução real com impacto sociocomunitário.

---
