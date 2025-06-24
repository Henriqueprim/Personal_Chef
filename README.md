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
  * `screens/` – componentes de tela (ex: `Pedidos.js`, `ListaCompras.js`);
  * `components/` – componentes reutilizáveis (ex: botões, cards);
  * `assets/` – imagens, ícones e figurinhas.

---

## 💻 Pré-requisitos

* Node.js ≥ 16.x
* npm ou yarn
* Expo CLI ou React Native CLI
* Android Studio + AVD (ou dispositivo Android físico conectado)

---

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

   * Use **Expo Go** (se estiver no Managed Workflow);
   * Ou no terminal:

     ```bash
     npx react-native run-android
     ```

     (no caso de Bare Workflow / ejetado)

---

## 📦 Gerando o APK

### A) **Se estiver utilizando Bare Workflow (projeto ejetado):**

1. Abra `android/` no Android Studio;
2. Vá em **Build → Build Bundle(s) / APK(s) → Build APK(s)**;
3. O APK estará em:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### B) **Com EAS CLI (local):**

```bash
eas build --platform android --local
```

Gera o APK em `dist/`.

---

## 🧩 Fluxo de Uso

1. **Cliente** registra e gerencia pedidos via app;
2. App gera a **lista de compras** necessária automaticamente;
3. **Cliente** visualiza seu pedido e lista no app.

Ideia central: tornar a organização dos pedidos e compras mais eficiente para chefs pessoais.

---

## 🎓 Sobre o Projeto

> **Disciplina**: Programação para Dispositivos Móveis (Android)
> **Tipo de Atividade**: Projeto de Extensão
> **Objetivo**: Desenvolver habilidades de mobile dev e entregar uma solução real para gerenciamento de pedidos e compras no contexto de personal chef.

---
