# Pràctica n8n - Workflow Automation

Aquesta pràctica et guia en l'ús de n8n, una eina d'automatització de workflows de codi obert.

## 📋 Què és n8n?

n8n és una plataforma d'automatització que et permet connectar diferents serveis i APIs per crear workflows automatitzats. És similar a Zapier o Make (Integromat), però de codi obert i autoallotjable.

## 🚀 Començar amb n8n

### 1. Arrencar n8n

Executa l'script:

```bash
cd ~/Desktop/practiques/n8n
./n8n-start.sh
```

Això iniciarà n8n en mode desenvolupament. Veuràs un missatge indicant que n8n està disponible a:
```
http://localhost:5678
```

També arrenca un tunnel amb el paquet "localtunnel" que permetrà exposar l'endpoint que necessita Telegram, o altres, per rebre notificacions.

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

## 🎯 Workflows de Demostració

Aquesta pràctica inclou diversos workflows de demostració que pots importar i utilitzar:

### 1. 📱 Workflow Telegram + Perplexity

**Fitxer**: `~/Desktop/practiques/n8n/demo-wf/weather-telegram-perplexity-api.json`

Aquest workflow demostra com:
1. Rep missatges d'un bot de Telegram
2. Envia la consulta a Perplexity AI (API d'intel·ligència artificial)
3. Neteja la resposta eliminant referències numèriques
4. Retorna la resposta formatada al bot de Telegram

**Nodes utilitzats**: Telegram Trigger, Perplexity AI, Code (JavaScript), Telegram Send Message

### 2. 📊 Workflow Informació de Borsa (amb JavaScript)

**Fitxer**: `~/Desktop/practiques/n8n/demo-wf/borsa.json`

Aquest workflow obté informació en temps real d'accions de la borsa:
1. S'executa automàticament cada 60 minuts (Schedule Trigger)
2. Crida a l'API pública de Yahoo Finance
3. Processa les dades amb JavaScript per extreure la informació rellevant
4. Formata el missatge de sortida amb emojis

**Dades obtingudes**: Preu actual, canvi percentual, màxim/mínim del dia, volum, estat del mercat

**Nodes utilitzats**: Schedule Trigger, HTTP Request, Code (JavaScript) x2

### 3. 📈 Workflow Informació de Borsa (sense JavaScript)

**Fitxer**: `~/Desktop/practiques/n8n/demo-wf/borsa-simple.json`

Versió simplificada del workflow anterior que utilitza només nodes natius de n8n:
1. S'executa automàticament cada 60 minuts
2. Crida a l'API de Yahoo Finance
3. Utilitza el node **Set** per extreure i mapejar camps directament

**Avantatges**: Més visual, més fàcil d'editar, sense necessitat de programar

**Nodes utilitzats**: Schedule Trigger, HTTP Request, Set

### Importar un workflow

1. A n8n, fes clic al menú **☰** (dalt a l'esquerra)
2. Selecciona **"Import from File"**
3. Tria el fitxer del workflow que vulguis importar
4. Fes clic a **"Import"**

El workflow apareixerà amb els nodes ja configurats. Alguns workflows necessitaran que configuris credencials (Telegram, APIs, etc.).

## 🔑 Configurar les credencials

### Workflows que NO necessiten credencials:
- ✅ **Informació de Borsa** (borsa.json i borsa-simple.json): Utilitzen l'API pública de Yahoo Finance, funcionen directament

### Workflows que SÍ necessiten credencials:
- 🔐 **Telegram + Perplexity**: Necessita configurar bot de Telegram i API de Perplexity

Per configurar el workflow de Telegram + Perplexity, necessites:

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

### Exercici 1: Provar els workflows de borsa
- Importa `borsa.json` i executa'l per veure les dades d'Apple (AAPL)
- Modifica l'URL per obtenir dades d'altres accions (GOOGL, TSLA, TEF.MC per Telefónica)
- Compara les dues versions (amb i sense JavaScript)

### Exercici 2: Connectar workflows
- Afegeix un node de Telegram al workflow de borsa per rebre notificacions
- Crea un workflow que enviï les dades de borsa a un Google Sheet
- Afegeix un node d'email per rebre alertes quan el preu canviï més d'un X%

### Exercici 3: Modificar el workflow de Telegram
- Canvia el prompt enviat a Perplexity per afegir context o instruccions específiques
- Afegeix un node de condició que respongui diferent segons paraules clau
- Guarda l'historial de converses en un fitxer JSON

### Exercici 4: Crear el teu propi workflow
- Crea un workflow que combini múltiples APIs
- Experimenta amb nodes de transformació de dades
- Implementa lògica condicional i bucles

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
└── demo-wf/                                       # Carpeta amb workflows de demostració
    ├── weather-telegram-perplexity-api.json       # Workflow Telegram + Perplexity
    ├── borsa.json                                 # Workflow de borsa amb JavaScript
    └── borsa-simple.json                          # Workflow de borsa sense JavaScript
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

### Documentació general
- **Documentació oficial de n8n**: https://docs.n8n.io/
- **Comunitat n8n**: https://community.n8n.io/
- **Llista de nodes disponibles**: https://n8n.io/integrations/

### APIs utilitzades
- **Documentació de Telegram Bot API**: https://core.telegram.org/bots/api
- **Perplexity API Docs**: https://docs.perplexity.ai/
- **Yahoo Finance API**: https://query1.finance.yahoo.com/
- **Símbols d'accions**: https://finance.yahoo.com/

### Guies específiques
- **README-BOLSA.md**: Guia completa del workflow de borsa amb exemples i personalitzacions

## 💡 Consells

- Fes servir el mode **"Execute Workflow"** per provar els workflows abans d'activar-los
- Utilitza el **debugger** per veure les dades que passen entre nodes
- Guarda versions del teu workflow regularment (Export to File)
- Experimenta amb diferents nodes i connectors per aprendre més!

---

**Bona automatització!**
