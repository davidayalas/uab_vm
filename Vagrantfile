# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Box Ubuntu 24.04 LTS (Noble Numbat) - última versió i lleugera
  config.vm.box = "bento/ubuntu-24.04"

  # Assignar recursos (modificar segons necessitats)
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "4096"
    vb.cpus = 2
    vb.gui = true
    # Opcions addicionals per millorar el rendiment
    vb.customize ["modifyvm", :id, "--graphicscontroller", "vmsvga"]
    vb.customize ["modifyvm", :id, "--accelerate3d", "on"]
    vb.customize ["modifyvm", :id, "--vram", "128"]
  end

  # Shared folder
  # Crear la carpeta shared en local si no existeix
  FileUtils.mkdir_p("./shared") unless Dir.exist?("./shared")
  config.vm.synced_folder "./shared", "/home/vagrant/shared", create: true

  # Provisionament
  config.vm.provision "shell", inline: <<-SHELL
    # Configurar zona horària i idioma
    sudo timedatectl set-timezone Europe/Madrid
    sudo locale-gen ca_ES.UTF-8
    sudo update-locale LANG=ca_ES.UTF-8 LC_ALL=ca_ES.UTF-8
    
    # Actualitzar sistema
    sudo apt-get update -y
    sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

    # Instal·lar utilitats bàsiques i eines per Guest Additions
    sudo apt-get install -y curl git wget software-properties-common
    sudo apt-get install -y build-essential dkms linux-headers-$(uname -r)

    # Instal·lar dependències per Puppeteer/Chromium
    sudo apt-get install -y \
      chromium-browser \
      libnss3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libgbm1 \
      libasound2 \
      libpangocairo-1.0-0 \
      libgtk-3-0

    # Instal·lar Python3 i pip
    sudo apt-get install -y python3 python3-pip python3-venv

    # Instal·lar paquets d'idioma català
    sudo apt-get install -y language-pack-ca language-pack-gnome-ca
    
    # Instal·lar LXQt (escriptori ultra-lleuger) amb display manager
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
      lxqt-core \
      lightdm \
      lightdm-gtk-greeter \
      xserver-xorg \
      firefox \
      xterm
    
    # Configurar teclat espanyol
    sudo tee /etc/default/keyboard > /dev/null <<KEYBOARD
# KEYBOARD CONFIGURATION FILE

# Consult the keyboard(5) manual page.

XKBMODEL="pc105"
XKBLAYOUT="es"
XKBVARIANT=""
XKBOPTIONS=""

BACKSPACE="guess"
KEYBOARD

    # Aplicar configuració del teclat
    sudo setupcon -k --force || true
    
    # Configurar lightdm per autologin de l'usuari vagrant
    sudo mkdir -p /etc/lightdm/lightdm.conf.d/
    sudo tee /etc/lightdm/lightdm.conf.d/50-autologin.conf > /dev/null <<EOF
[Seat:*]
autologin-user=vagrant
autologin-user-timeout=0
user-session=lxqt
EOF
    
    # Afegir l'usuari vagrant al grup autologin
    sudo groupadd -f autologin
    sudo usermod -aG autologin vagrant
    
    # Configurar lightdm com a display manager per defecte
    sudo systemctl enable lightdm
    sudo systemctl set-default graphical.target
    
    # Node.js via NVM (instal·lació correcta per vagrant user)
    sudo -u vagrant bash -c '
      export HOME=/home/vagrant
      export NVM_DIR="$HOME/.nvm"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
      source "$NVM_DIR/nvm.sh"
      nvm install --lts
      nvm use --lts
      # Instal·lar paquets globals (n8n, localtunnel, node-telegram-bot-api)
      npm install -g n8n localtunnel node-telegram-bot-api puppeteer
    '
    
    # Afegir NVM al .bashrc del vagrant user
    sudo -u vagrant bash -c 'echo "export NVM_DIR=\"\$HOME/.nvm\"" >> /home/vagrant/.bashrc'
    sudo -u vagrant bash -c 'echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"" >> /home/vagrant/.bashrc'

    # Configurar Firefox amb bookmark per n8n
    sudo -u vagrant mkdir -p /home/vagrant/.mozilla/firefox
    
    # Crear perfil de Firefox amb bookmark de n8n
    sudo -u vagrant bash -c 'cat > /home/vagrant/.mozilla/firefox/profiles.ini <<PROFILES
[Install4F96D1932A9F858E]
Default=default-release
Locked=1

[Profile0]
Name=default-release
IsRelative=1
Path=default-release
Default=1

[General]
StartWithLastProfile=1
Version=2
PROFILES
'
    
    # Crear directori del perfil
    sudo -u vagrant mkdir -p /home/vagrant/.mozilla/firefox/default-release
    
    # Crear bookmarks amb n8n
    sudo -u vagrant bash -c 'cat > /home/vagrant/.mozilla/firefox/default-release/bookmarks.html <<BOOKMARKS
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL><p>
    <DT><H3 ADD_DATE="1634567890" LAST_MODIFIED="1634567890" PERSONAL_TOOLBAR_FOLDER="true">Barra de adreces</H3>
    <DL><p>
        <DT><A HREF="http://localhost:5678" ADD_DATE="1634567890" LAST_MODIFIED="1634567890">n8n - Workflow Automation</A>
    </DL><p>
</DL>
BOOKMARKS
'
    
    # Crear preferències bàsiques de Firefox
    sudo -u vagrant bash -c 'cat > /home/vagrant/.mozilla/firefox/default-release/user.js <<USERJS
user_pref("browser.bookmarks.restore_default_bookmarks", false);
user_pref("browser.startup.homepage", "http://localhost:5678");
user_pref("browser.toolbars.bookmarks.visibility", "always");
USERJS
'

    # Crear directori de treball
    sudo -u vagrant mkdir -p /home/vagrant/workspace
    
    # Configurar wallpaper si existeix
    if [ -f /vagrant/wallpaper.png ]; then
      echo "📸 Configurant wallpaper..."
      # Copiar wallpaper al directori de l'usuari
      sudo -u vagrant cp /vagrant/wallpaper.png /home/vagrant/wallpaper.png
      sudo -u vagrant mkdir -p /home/vagrant/Pictures
      sudo -u vagrant cp /vagrant/wallpaper.png /home/vagrant/Pictures/
      
      # Crear directoris de configuració necessaris
      sudo -u vagrant mkdir -p /home/vagrant/.config/pcmanfm-qt/lxqt
      sudo -u vagrant mkdir -p /home/vagrant/.config/lxqt
      
      # Configurar pcmanfm-qt per utilitzar el wallpaper
      sudo -u vagrant tee /home/vagrant/.config/pcmanfm-qt/lxqt/settings.conf > /dev/null <<'WALLPAPER'
[Desktop]
Wallpaper=/home/vagrant/wallpaper.png
WallpaperMode=fit
BgColor=#90EE90
FallbackIcon=folder

[System]
OnlyUserTemplates=false
TemplateTypeOnce=false
TemplateRunApp=false
TemplateTypeOnce=false
SuCommand=lxqt-sudo %s

[Thumbnail]
ShowThumbnails=true
MaxThumbnailFileSize=4096

[Volume]
AutoRun=true
MountOnStartup=true
MountRemovable=true
CloseOnUnmount=true
WALLPAPER
      
      echo "✅ Wallpaper configurat!"
    else
      echo "⚠️  No s'ha trobat wallpaper.png"
    fi
    
    # Descarregar només la carpeta practiques al Desktop
    if [ ! -d "/home/vagrant/Desktop/practiques" ]; then
      echo "📦 Descarregant pràctiques..."
      sudo -u vagrant mkdir -p /home/vagrant/Desktop
      
      # Clonar repo temporalment
      sudo -u vagrant git clone --depth 1 https://github.com/davidayalas/uab_vm.git /tmp/uab_vm_temp
      
      # Copiar només practiques al Desktop
      sudo -u vagrant cp -r /tmp/uab_vm_temp/practiques /home/vagrant/Desktop/
      
      # Fer executables tots els scripts .sh
      find /home/vagrant/Desktop/practiques -type f -name "*.sh" -exec chmod +x {} \;
      
      # Eliminar repo temporal
      rm -rf /tmp/uab_vm_temp
      
      echo "✅ Pràctiques descarregades a ~/Desktop/practiques"
      
      # Instal·lar dependències locals a les pràctiques que les necessitin
      echo "📦 Instal·lant dependències de les pràctiques..."
      
      # Instal·lar dependències a demo-rpa
      if [ -d "/home/vagrant/Desktop/practiques/demo-rpa" ] && [ -f "/home/vagrant/Desktop/practiques/demo-rpa/package.json" ]; then
        echo "  → Instal·lant dependències de demo-rpa..."
        sudo -u vagrant bash -c '
          export HOME=/home/vagrant
          export NVM_DIR="$HOME/.nvm"
          source "$NVM_DIR/nvm.sh"
          cd /home/vagrant/Desktop/practiques/demo-rpa
          npm install
        '
        echo "  ✅ Dependències de demo-rpa instal·lades"
      fi
      
      echo "✅ Dependències instal·lades"
    else
      echo "✅ Pràctiques ja existeixen a l'escriptori"
    fi
    
    # Crear accés directe a la carpeta shared a l'escriptori
    if [ ! -L "/home/vagrant/Desktop/shared" ]; then
      echo "🔗 Creant accés directe a shared..."
      sudo -u vagrant ln -s /home/vagrant/shared /home/vagrant/Desktop/shared
      echo "✅ Accés directe a shared creat"
    fi
    
    # Crear accés directe a Firefox a l'escriptori
    if [ ! -f "/home/vagrant/Desktop/firefox.desktop" ]; then
      echo "🦊 Creant accés directe a Firefox..."
      sudo -u vagrant tee /home/vagrant/Desktop/firefox.desktop > /dev/null <<'FIREFOX'
[Desktop Entry]
Version=1.0
Name=Firefox Web Browser
Name[ca]=Navegador web Firefox
Name[es]=Navegador web Firefox
Comment=Browse the World Wide Web
Comment[ca]=Navegueu pel World Wide Web
Comment[es]=Navegue por la web
GenericName=Web Browser
GenericName[ca]=Navegador web
GenericName[es]=Navegador web
Keywords=Internet;WWW;Browser;Web;Explorer
Exec=firefox %u
Terminal=false
X-MultipleArgs=false
Type=Application
Icon=firefox
Categories=GNOME;GTK;Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;application/xml;application/rss+xml;application/rdf+xml;image/gif;image/jpeg;image/png;x-scheme-handler/http;x-scheme-handler/https;x-scheme-handler/ftp;x-scheme-handler/chrome;video/webm;application/x-xpinstall;
StartupNotify=true
Actions=NewWindow;NewPrivateWindow;
FIREFOX
      
      # Fer executable l'accés directe
      chmod +x /home/vagrant/Desktop/firefox.desktop
      
      echo "✅ Accés directe a Firefox creat"
    fi
    
    echo "✅ Instal·lació completada!"
    echo "📁 Carpeta compartida: /home/vagrant/shared"
    echo "📁 Pràctiques: ~/Desktop/practiques"
    echo "   Reinicia la VM amb: vagrant reload"
  SHELL
end
