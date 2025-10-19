# Pràctica Demo RPA - Web Scraping amb Puppeteer i Telegram

Aquesta pràctica demostra com crear un bot RPA (Robotic Process Automation) que:
1. Utilitza Puppeteer per capturar informació d'una pàgina web (Meteo.cat)
2. Fa un screenshot de la predicció meteorològica
3. Envia la imatge automàticament a un bot de Telegram

## 📋 Què és RPA?

RPA (Robotic Process Automation) és una tecnologia que permet automatitzar tasques repetitives simulant accions humanes en aplicacions digitals. En aquest cas, automatitzem la consulta de la predicció del temps i l'enviament per Telegram.

## 🛠️ Prerequisits

Aquesta pràctica ja inclou totes les dependències instal·lades globalment a la VM:
- Node.js (via NVM)
- Puppeteer
- node-telegram-bot-api
- dotenv

## 🤖 Crear el Bot de Telegram

Abans d'executar la pràctica, necessites crear el teu propi bot de Telegram:

### 1. Crear el bot amb BotFather

1. Obre Telegram i busca **[@BotFather](https://t.me/botfather)**
2. Inicia una conversa amb `/start`
3. Envia la comanda: `/newbot`
4. Segueix les instruccions:
   - **Nom del bot**: Tria un nom descriptiu (ex: "El meu Bot Meteo")
   - **Username**: Ha d'acabar en "bot" (ex: "elmeumeteo_bot")
5. **IMPORTANT**: BotFather et donarà un **token** similar a:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
   ```
   **Guarda aquest token!** És la teva clau d'accés al bot.

### 2. Obtenir el teu Chat ID

Per poder enviar missatges al teu compte, necessites el teu **Chat ID**:

#### Mètode 1: Usar un bot (recomanat)
1. Busca el bot **[@userinfobot](https://t.me/userinfobot)** a Telegram
2. Envia `/start`
3. El bot et mostrarà el teu **Chat ID** (un número com `123456789`)

#### Mètode 2: API de Telegram
1. Envia un missatge al teu nou bot (el que acabes de crear)
2. Obre aquesta URL al navegador (substitueix `YOUR_BOT_TOKEN` pel token del teu bot):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Busca el camp `"id"` dins de `"chat"`, aquest és el teu Chat ID

**Exemple de resposta:**
```json
{
  "ok": true,
  "result": [{
    "message": {
      "chat": {
        "id": 123456789,  ← Aquest és el teu Chat ID
        "first_name": "El teu nom"
      }
    }
  }]
}
```

## 🔑 Configurar les variables d'entorn

### 1. Editar el fitxer .env

Obre el fitxer `.env` amb un editor de text:

```bash
cd ~/Desktop/practiques/demo-rpa
nano .env
```

O des de l'entorn gràfic, fes doble clic al fitxer `.env` i edita'l.

### 2. Afegir les teves credencials

Substitueix els valors de l'exemple per les teves credencials reals:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
CHAT_ID=123456789
```

On:
- **TELEGRAM_BOT_TOKEN**: El token que t'ha donat BotFather
- **CHAT_ID**: El teu Chat ID (el número que identifica el teu compte de Telegram)

### 3. Desar el fitxer

- Si uses `nano`: Prem `Ctrl+O` per desar, `Enter` per confirmar, i `Ctrl+X` per sortir
- Si uses un editor gràfic: Desa normalment (`Ctrl+S`)

## 🚀 Executar la pràctica

### Opció 1: Des del terminal

```bash
cd ~/Desktop/practiques/demo-rpa
node index.js
```

### Opció 2: Amb npm (si tens script definit)

```bash
cd ~/Desktop/practiques/demo-rpa
npm start
```

### Què hauria de passar?

1. El script iniciarà Puppeteer en mode headless (sense interfície)
2. Navegarà a la web de Meteo.cat
3. Capturarà un screenshot de la predicció meteorològica
4. Desarà la imatge com `screenshot.png`
5. Enviarà la imatge al teu bot de Telegram
6. Rebràs la imatge al teu compte de Telegram! 📸

### Output esperat

```
Screenshot enviat a Telegram correctament
```

## 📁 Estructura de fitxers

```
practiques/demo-rpa/
├── README.md           # Aquest fitxer
├── index.js            # Script principal de RPA
├── package.json        # Dependències del projecte
├── package-lock.json   # Versions exactes de dependències
├── .env               # Variables d'entorn (credencials)
└── screenshot.png     # Imatge generada (es crea en executar)
```

## 🔍 Com funciona el codi?

### 1. Configuració inicial
```javascript
require('dotenv').config();  // Carrega les variables del .env
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
```

### 2. Llançament de Puppeteer
```javascript
const browser = await puppeteer.launch({
    headless: true,  // No mostra finestra del navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']  // Necessari per VMs
});
```

### 3. Navegació i screenshot
```javascript
await targetPage.goto('https://www.meteo.cat/prediccio/municipal/081878');
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### 4. Enviament a Telegram
```javascript
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
await bot.sendPhoto(process.env.CHAT_ID, 'screenshot.png', {
    caption: `Predicció meteorològica - ${new Date().toLocaleString('ca-ES')}`
});
```

## 📝 Exercicis proposats

### Exercici 1: Modificar la ciutat
Canvia la URL per capturar la predicció d'una altra ciutat catalana:
- Busca la teva ciutat a meteo.cat
- Copia la URL
- Modifica el codi per usar aquesta nova URL

### Exercici 2: Capturar altres webs
Experimenta capturant screenshots d'altres pàgines web:
- Notícies
- Preus de productes
- Resultats esportius
- etc.

### Exercici 3: Automatitzar amb cron
Programa l'script per executar-se automàticament cada dia:
```bash
# Editar crontab
crontab -e

# Afegir línia (executa cada dia a les 8:00 AM)
0 8 * * * cd /home/vagrant/Desktop/practiques/demo-rpa && node index.js
```

### Exercici 4: Afegir més funcionalitats
- Extreure el text de la temperatura i enviar-lo com a missatge
- Comparar temperatures entre dies
- Enviar alertes si fa molt fred o calor

## 🐛 Solució de problemes

### Error: "Invalid token"
- Verifica que el token de BotFather és correcte al fitxer `.env`
- Assegura't que no hi ha espais extres abans o després del token
- El token ha de tenir el format: `números:lletres_i_números`

### Error: "Chat not found"
- Verifica que el Chat ID és correcte
- Assegura't que has enviat almenys un missatge al bot abans
- El Chat ID ha de ser un número (pot ser negatiu per grups)

### Error: "Failed to launch browser"
- Aquest error està resolt a la VM amb els args `--no-sandbox`
- Si persisteix, verifica que Chromium està instal·lat

### No rebo la imatge a Telegram
- Verifica que tens connexió a Internet
- Comprova que el bot no està bloquejat
- Revisa els logs d'error al terminal

### Screenshot en blanc o incorrecte
- La pàgina pot tardar a carregar, afegeix `await page.waitForTimeout(2000)`
- Algunes webs requereixen interacció (scroll, clic, etc.)

## 📚 Recursos addicionals

- **Documentació de Puppeteer**: https://pptr.dev/
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **node-telegram-bot-api**: https://github.com/yagop/node-telegram-bot-api
- **dotenv**: https://www.npmjs.com/package/dotenv

## 💡 Consells

1. **Mai comparteixis el teu token**: El fitxer `.env` conté credencials privades
2. **Afegeix `.env` al `.gitignore`**: No pugis mai aquest fitxer a repositoris públics
3. **Prova pas a pas**: Comenta parts del codi per provar cada funcionalitat per separat
4. **Revisa els screenshots**: La imatge `screenshot.png` es guarda localment, revisa-la si hi ha problemes
5. **Experimenta**: Canvia URLs, afegeix esperes, prova amb diferents webs!

## 🔐 Seguretat

**IMPORTANT**: 
- ❌ **MAI** comparteixis el teu `TELEGRAM_BOT_TOKEN` públicament
- ❌ **MAI** pugis el fitxer `.env` a GitHub o altres plataformes
- ✅ Utilitza sempre fitxers `.env` per a credencials
- ✅ Afegeix `.env` al teu `.gitignore`

Si el teu token es compromet:
1. Ves a [@BotFather](https://t.me/botfather)
2. Selecciona el teu bot amb `/mybots`
3. Tria **"API Token"** → **"Revoke current token"**
4. Genera un nou token i actualitza el `.env`

---

**Bona automatització!** 🤖📸
