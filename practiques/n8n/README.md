# Pràctica n8n - Workflow Automation

Aquesta pràctica et guia en l'ús de n8n, una eina d'automatització de workflows de codi obert.

## 📋 Què és n8n?

n8n és una plataforma d'automatització que et permet connectar diferents serveis i APIs per crear workflows automatitzats. És similar a Zapier o Make (Integromat), però de codi obert i autoallotjable.

## 🚀 Començar amb n8n

### 1. Arrencar n8n

Executa l'script proporcionat:

```bash
cd ~/Desktop/practiques/n8n
./n8n-start.sh
```

Això iniciarà n8n en mode desenvolupament. Veuràs un missatge indicant que n8n està disponible a:
```
http://localhost:5678
```

### 2. Primer accés - Setup inicial

La primera vegada que accedeixes a n8n, hauràs de:

1. Obre Firefox i ves a `http://localhost:5678` (ja tens un bookmark!)
2. Crea un compte d'administrador:
   - **Email**: El que vulguis (pot ser fictici)
   - **Password**: Tria una contrasenya segura
3. Completa el setup inicial seguint les instruccions

**Important**: Aquesta informació es guarda localment a la teva VM.

### 3. Interfície de n8n

Un cop dins, veuràs:
- **Editor de workflows**: Àrea principal on dissenyaràs els teus automatismes
- **Nodes**: Components que representen accions o serveis
- **Connections**: Línies que connecten els nodes i defineixen el flux de dades

## 🎯 Demo: Workflow Telegram + Perplexity

Aquesta pràctica inclou un workflow de demostració que:
1. Rep missatges d'un bot de Telegram
2. Envia la consulta a Perplexity AI (API d'intel·ligència artificial)
3. Retorna la resposta al bot de Telegram

### Importar el workflow de demo

1. A n8n, fes clic a **"Workflows"** al menú superior
2. Selecciona **"Import from File"**
3. Tria el fitxer: `demo-workflow-telegram-perplexity-api.json`
4. Fes clic a **"Import"**

El workflow apareixerà amb els nodes ja configurats, però **faltaran les credencials**.

## 🔑 Configurar les credencials

Per fer funcionar el workflow, necessites configurar:

### 1. Bot de Telegram

#### Crear el bot:
1. Obre Telegram i busca [@BotFather](https://t.me/botfather)
2. Envia `/newbot`
3. Segueix les instruccions per posar nom i username al bot
4. **Guarda el token** que et dóna (ex: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Configurar a n8n:
1. Al workflow, fes clic al node **"Telegram Trigger"**
2. A **"Credential to connect with"**, selecciona **"Create New"**
3. Enganxa el **Bot Token** que has rebut de BotFather
4. Fes clic a **"Save"**

### 2. Perplexity API

#### Obtenir la clau API:
1. Ves a [Perplexity API](https://www.perplexity.ai/)
2. Crea un compte o inicia sessió
3. Ves al dashboard d'API i genera una clau API
4. **Guarda la clau API**

#### Configurar a n8n:
1. Al workflow, fes clic al node **"Perplexity AI"** o **"HTTP Request"**
2. A **"Credential to connect with"**, selecciona **"Create New"**
3. Enganxa la **API Key** de Perplexity
4. Fes clic a **"Save"**

## ▶️ Executar el workflow

1. Un cop configurades les credencials, fes clic a **"Active"** (a dalt a la dreta)
2. El workflow ara està actiu i escoltant missatges del bot de Telegram
3. Ves a Telegram i envia un missatge al teu bot
4. Hauries de rebre una resposta generada per Perplexity AI!

## 📝 Exercicis proposats

### Exercici 1: Modificar el workflow
- Canvia el prompt enviat a Perplexity per afegir context o instruccions específiques
- Modifica el format de la resposta que retorna el bot

### Exercici 2: Afegir nodes
- Afegeix un node que guardi les consultes en un fitxer o base de dades
- Afegeix un node de condició que respongui de forma diferent segons el tipus de pregunta

### Exercici 3: Crear el teu propi workflow
- Crea un nou workflow des de zero
- Connecta altres serveis (Google Sheets, Email, etc.)
- Experimenta amb diferents nodes i connectors

## 🛠️ Comandes útils

```bash
# Iniciar n8n
./n8n-start.sh

# Aturar n8n
Ctrl + C (al terminal on s'està executant)

# Reiniciar n8n
Ctrl + C i tornar a executar ./n8n-start.sh
```

## 📁 Estructura de fitxers

```
practiques/n8n/
├── README.md                                      # Aquest fitxer
├── n8n-start.sh                                   # Script per iniciar n8n
└── demo-workflow-telegram-perplexity-api.json     # Workflow de demostració
```

## 🐛 Solució de problemes

### n8n no arranca
- Verifica que Node.js està instal·lat: `node --version`
- Assegura't que n8n està instal·lat: `npm list -g n8n`

### El bot de Telegram no respon
- Verifica que el workflow està **actiu** (botó "Active" en verd)
- Comprova que el token del bot és correcte
- Revisa els logs a la consola de n8n

### Perplexity no respon
- Verifica que la clau API és correcta i vàlida
- Comprova que tens crèdits disponibles al teu compte de Perplexity
- Mira els errors al node de Perplexity (fes clic i revisa l'output)

## 📚 Recursos

- **Documentació oficial de n8n**: https://docs.n8n.io/
- **Comunitat n8n**: https://community.n8n.io/
- **Documentació de Telegram Bot API**: https://core.telegram.org/bots/api
- **Perplexity API Docs**: https://docs.perplexity.ai/

## 💡 Consells

- Fes servir el mode **"Execute Workflow"** per provar els workflows abans d'activar-los
- Utilitza el **debugger** per veure les dades que passen entre nodes
- Guarda versions del teu workflow regularment (Export to File)
- Experimenta amb diferents nodes i connectors per aprendre més!

---

**Bon aprenentatge amb n8n!** 🚀
