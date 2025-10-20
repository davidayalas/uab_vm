# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-24.04"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "4096"
    vb.cpus = 2
    vb.gui = true
    vb.customize ["modifyvm", :id, "--graphicscontroller", "vmsvga"]
    
    # Detectar sistema operatiu
    host = RbConfig::CONFIG['host_os']
    if host =~ /darwin/  # macOS
      vb.customize ["modifyvm", :id, "--accelerate3d", "off"]
    else
      vb.customize ["modifyvm", :id, "--accelerate3d", "on"]
    end
    
    vb.customize ["modifyvm", :id, "--vram", "128"]
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    vb.customize ["modifyvm", :id, "--clipboard-mode", "bidirectional"]
    vb.customize ["modifyvm", :id, "--draganddrop", "bidirectional"]
  end

  config.vm.boot_timeout = 600

  FileUtils.mkdir_p("./shared") unless Dir.exist?("./shared")
  # Carpeta compartida amb permisos correctes
  config.vm.synced_folder "./shared", "/home/vagrant/shared",
    create: true,
    owner: "vagrant",
    group: "vagrant",
    mount_options: ["dmode=775,fmode=664"]
    
  # PROVISION 1: Sistema base
  config.vm.provision "shell", name: "base", inline: <<-SHELL
    echo "🔧 [1/4] Configurant sistema base..."
    
    # Deshabilitar snapd (no necessari i causa delays)
    systemctl stop snapd.service || true
    systemctl disable snapd.service || true
    systemctl mask snapd.service || true
    
    # Deshabilitar systemd-resolved temporalment per evitar bucles
    systemctl stop systemd-resolved || true
    
    # Configurar DNS directament a /etc/resolv.conf
    rm -f /etc/resolv.conf
    tee /etc/resolv.conf > /dev/null <<RESOLVCONF
nameserver 8.8.8.8
nameserver 8.8.4.4
RESOLVCONF
    chattr +i /etc/resolv.conf
    
    # Configuració bàsica
    timedatectl set-timezone Europe/Madrid
    locale-gen ca_ES.UTF-8
    update-locale LANG=ca_ES.UTF-8 LC_ALL=ca_ES.UTF-8
    
    # Actualitzar
    apt-get update -y
    
    # Utilitats essencials
    apt-get install -y curl git wget software-properties-common ca-certificates
    apt-get install -y language-pack-ca language-pack-gnome-ca
    
    echo "✅ Sistema base configurat"
  SHELL

  # PROVISION 2: Entorn gràfic Cinnamon
  config.vm.provision "shell", name: "desktop", inline: <<-SHELL
    echo "🖥️ [2/4] Instal·lant escriptori Cinnamon..."
    
    # Actualitzar cache
    apt-get update -y
    
    echo "  → Instal·lant Cinnamon Desktop..."
    # Cinnamon core (versió lleugera sense recomanacions)
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      cinnamon-core \
      cinnamon-control-center \
      cinnamon-screensaver \
      cinnamon-settings-daemon \
      nemo \
      gnome-terminal
    echo "  ✅ Cinnamon instal·lat"
    
    echo "  → Instal·lant X Server..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends xserver-xorg xserver-xorg-video-all
    echo "  ✅ X Server instal·lat"
    
    echo "  → Instal·lant LightDM..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends lightdm lightdm-gtk-greeter
    echo "  ✅ LightDM instal·lat"
    
    # Configurar teclat espanyol
    tee /etc/default/keyboard > /dev/null <<KEYBOARD
XKBMODEL="pc105"
XKBLAYOUT="es"
XKBVARIANT=""
XKBOPTIONS=""
BACKSPACE="guess"
KEYBOARD
    setupcon -k --force || true
    
    # Configurar lightdm per autologin
    mkdir -p /etc/lightdm/lightdm.conf.d/
    tee /etc/lightdm/lightdm.conf.d/50-autologin.conf > /dev/null <<EOF
[Seat:*]
autologin-user=vagrant
autologin-user-timeout=0
user-session=cinnamon
greeter-session=lightdm-gtk-greeter
EOF
    
    # Afegir vagrant al grup autologin
    groupadd -f autologin
    usermod -aG autologin vagrant
    
    # Configurar sessió per defecte per a l'usuari vagrant
    sudo -u vagrant tee /home/vagrant/.dmrc > /dev/null <<DMRC
[Desktop]
Session=cinnamon
DMRC
    chmod 644 /home/vagrant/.dmrc
    chown vagrant:vagrant /home/vagrant/.dmrc
    
    # Mask gdm3 si existeix
    systemctl mask gdm3 || true
    
    # Habilitar lightdm
    systemctl unmask lightdm
    systemctl enable lightdm
    systemctl set-default graphical.target
    
    # Reconfigurar lightdm
    dpkg-reconfigure -f noninteractive lightdm
    
    # Assegurar que X11 està configurat
    dpkg-reconfigure -f noninteractive xserver-xorg
    
    echo "✅ Escriptori Cinnamon instal·lat i configurat"
  SHELL

  # PROVISION 3: Python, Node.js, Google Chrome, VS Code i dependències
  config.vm.provision "shell", name: "devtools", inline: <<-SHELL
    echo "📦 [3/4] Instal·lant eines de desenvolupament..."
    
    # Python3
    echo "  → Instal·lant Python3..."
    apt-get install -y python3 python3-pip python3-venv
    echo "  ✅ Python3 instal·lat"
    
    # Build tools per Guest Additions
    echo "  → Instal·lant build tools..."
    apt-get install -y build-essential dkms linux-headers-$(uname -r)
    echo "  ✅ Build tools instal·lats"

    # VirtualBox Guest Additions per portapapers i drag&drop
    echo "  → Instal·lant VirtualBox Guest Additions..."
    echo 'virtualbox-guest-x11 virtualbox-guest-x11/conffile-purge boolean true' | debconf-set-selections
    DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" virtualbox-guest-utils virtualbox-guest-x11
    usermod -aG vboxsf vagrant
    echo "  ✅ Guest Additions instal·lades"

    # Google Chrome
    echo "  → Instal·lant Google Chrome..."
    wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    dpkg -i /tmp/google-chrome.deb || true
    apt-get install -f -y
    rm /tmp/google-chrome.deb
    echo "  ✅ Google Chrome instal·lat"
    
    # Dependències per Puppeteer
    echo "  → Instal·lant dependències Puppeteer..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
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
    echo "  ✅ Dependències Puppeteer instal·lades"
    
    # Visual Studio Code
    echo "  → Instal·lant Visual Studio Code..."
    wget -q -O /tmp/vscode.deb 'https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64'
    dpkg -i /tmp/vscode.deb 2>&1 | grep -v "dependency problems" || true
    DEBIAN_FRONTEND=noninteractive apt-get install -f -y
    rm /tmp/vscode.deb
    
    # Verificar instal·lació
    if command -v code &> /dev/null; then
      echo "  ✅ VS Code instal·lat correctament ($(code --version | head -n1))"
    else
      echo "  ⚠️ VS Code no s'ha pogut instal·lar"
    fi
    
    # Node.js via NVM
    echo "  → Instal·lant Node.js via NVM..."
    sudo -u vagrant bash -c '
      export HOME=/home/vagrant
      export NVM_DIR="$HOME/.nvm"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
      source "$NVM_DIR/nvm.sh"
      nvm install --lts
      nvm use --lts
      npm install -g localtunnel n8n
    '
    
    # Afegir NVM al .bashrc
    sudo -u vagrant bash -c 'echo "export NVM_DIR=\"\$HOME/.nvm\"" >> /home/vagrant/.bashrc'
    sudo -u vagrant bash -c 'echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"" >> /home/vagrant/.bashrc'
    echo "  ✅ Node.js i localtunnel instal·lats"
    
    echo "✅ Eines de desenvolupament instal·lades"
  SHELL

  # PROVISION 4: Configuració final, wallpaper i pràctiques
  config.vm.provision "shell", name: "config", inline: <<-SHELL
    echo "🎨 [4/4] Configuració final..."
    
    # Crear directoris
    sudo -u vagrant mkdir -p /home/vagrant/Desktop
    sudo -u vagrant mkdir -p /home/vagrant/Pictures
    
    # Crear accés directe a Google Chrome al Desktop
    echo "🌐 Creant accés directe a Google Chrome..."
    sudo -u vagrant tee /home/vagrant/Desktop/google-chrome.desktop > /dev/null <<'CHROME'
[Desktop Entry]
Version=1.0
Type=Application
Name=Google Chrome
Comment=Access the Internet
Exec=/usr/bin/google-chrome-stable %U
Icon=google-chrome
Terminal=false
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;
CHROME
    chmod +x /home/vagrant/Desktop/google-chrome.desktop
    chown vagrant:vagrant /home/vagrant/Desktop/google-chrome.desktop
    echo "✅ Accés directe a Google Chrome creat"
    
    # Crear accés directe a VS Code al Desktop
    echo "💻 Creant accés directe a VS Code..."
    sudo -u vagrant tee /home/vagrant/Desktop/code.desktop > /dev/null <<'VSCODE'
[Desktop Entry]
Version=1.0
Type=Application
Name=Visual Studio Code
Comment=Code Editing. Redefined.
Exec=/usr/bin/code %F
Icon=com.visualstudio.code
Terminal=false
Categories=Development;IDE;
MimeType=text/plain;
VSCODE
    chmod +x /home/vagrant/Desktop/code.desktop
    chown vagrant:vagrant /home/vagrant/Desktop/code.desktop
    echo "✅ Accés directe a VS Code creat"
    
    # Configurar wallpaper si existeix
    if [ -f /vagrant/wallpaper.png ]; then
      echo "📸 Configurant wallpaper..."
      sudo -u vagrant cp /vagrant/wallpaper.png /home/vagrant/wallpaper.png
      sudo -u vagrant cp /vagrant/wallpaper.png /home/vagrant/Pictures/
      
      # Crear script d'autostart amb gsettings
      sudo -u vagrant mkdir -p /home/vagrant/.config/autostart
      sudo -u vagrant tee /home/vagrant/.config/autostart/set-wallpaper.desktop > /dev/null <<'AUTOSTART'
[Desktop Entry]
Type=Application
Name=Set Wallpaper
Exec=bash -c "sleep 5 && export DISPLAY=:0 && export XDG_RUNTIME_DIR=/run/user/1000 && export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus && gsettings set org.cinnamon.desktop.background picture-uri 'file:///home/vagrant/wallpaper.png' && gsettings set org.cinnamon.desktop.background picture-options 'scaled' && gsettings set org.cinnamon.desktop.background primary-color '#90EE90' && gsettings set org.cinnamon.desktop.background color-shading-type 'solid'"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
AUTOSTART
      
      echo "✅ Wallpaper configurat (scaled amb fons verd #90EE90)"
    else
      echo "⚠️  wallpaper.png no trobat (opcional)"
    fi
    
    # Configurar marcadors de Google Chrome
    echo "🔖 Configurant marcadors de Google Chrome..."
    sudo -u vagrant mkdir -p /home/vagrant/.config/google-chrome/Default
    
    sudo -u vagrant tee /home/vagrant/.config/google-chrome/Default/Bookmarks > /dev/null <<'BOOKMARKS'
{
   "checksum": "0d3a7c4e6c8e8c8e8c8e8c8e8c8e8c8e",
   "roots": {
      "bookmark_bar": {
         "children": [ {
            "date_added": "13300000000000000",
            "date_last_used": "0",
            "guid": "00000000-0000-4000-a000-000000000001",
            "id": "5",
            "name": "n8n (localhost:5678)",
            "type": "url",
            "url": "http://localhost:5678"
         } ],
         "date_added": "13300000000000000",
         "date_last_used": "0",
         "date_modified": "13300000000000000",
         "guid": "00000000-0000-4000-a000-000000000002",
         "id": "1",
         "name": "Barra de marcadors",
         "type": "folder"
      },
      "other": {
         "children": [  ],
         "date_added": "13300000000000000",
         "date_last_used": "0",
         "date_modified": "0",
         "guid": "00000000-0000-4000-a000-000000000003",
         "id": "2",
         "name": "Altres marcadors",
         "type": "folder"
      },
      "synced": {
         "children": [  ],
         "date_added": "13300000000000000",
         "date_last_used": "0",
         "date_modified": "0",
         "guid": "00000000-0000-4000-a000-000000000004",
         "id": "3",
         "name": "Marcadors del mòbil",
         "type": "folder"
      }
   },
   "version": 1
}
BOOKMARKS
    
    # Configurar Chrome per mostrar la barra de marcadors
    sudo -u vagrant tee /home/vagrant/.config/google-chrome/Default/Preferences > /dev/null <<'PREFERENCES'
{
   "bookmark_bar": {
      "show_on_all_tabs": true
   },
   "browser": {
      "show_home_button": true
   },
   "homepage": "http://localhost:5678",
   "homepage_is_newtabpage": false,
   "session": {
      "restore_on_startup": 1,
      "startup_urls": [ "http://localhost:5678" ]
   }
}
PREFERENCES
    
    echo "✅ Marcadors de Google Chrome configurats!"
    
    # Descarregar pràctiques
    if [ ! -d "/home/vagrant/Desktop/practiques" ]; then
      echo "📦 Descarregant pràctiques..."
      
      sudo -u vagrant git clone --depth 1 https://github.com/davidayalas/uab_vm.git /tmp/uab_vm_temp
      
      if [ -d "/tmp/uab_vm_temp/practiques" ]; then
        sudo -u vagrant cp -r /tmp/uab_vm_temp/practiques /home/vagrant/Desktop/
        find /home/vagrant/Desktop/practiques -type f -name "*.sh" -exec chmod +x {} \\;
        echo "✅ Pràctiques descarregades"
        
        # INSTAL·LAR N8N LOCALMENT
        echo "  → Creant projecte n8n local..."
        sudo -u vagrant mkdir -p /home/vagrant/Desktop/practiques/n8n
        sudo -u vagrant bash -c '
          export HOME=/home/vagrant
          export NVM_DIR="$HOME/.nvm"
          source "$NVM_DIR/nvm.sh"
          cd /home/vagrant/Desktop/practiques/n8n
          npm init -y
          npm install
        '
        echo "  ✅ n8n instal·lat localment"
        
        # INSTAL·LAR DEPENDÈNCIES demo-rpa
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
      fi
      
      rm -rf /tmp/uab_vm_temp
    else
      echo "✅ Pràctiques ja existeixen"
    fi
    
    # Accés directe a shared
    if [ ! -L "/home/vagrant/Desktop/shared" ]; then
      sudo -u vagrant ln -s /home/vagrant/shared /home/vagrant/Desktop/shared
      echo "✅ Accés directe a shared creat"
    fi
    
    echo ""
    echo "════════════════════════════════════════════════"
    echo "✅ INSTAL·LACIÓ COMPLETADA!"
    echo "════════════════════════════════════════════════"
    echo ""
    echo "📦 Components:"
    echo "   • Ubuntu 24.04 + Cinnamon Desktop"
    echo "   • Python 3 + pip + venv"
    echo "   • Build tools + Guest Additions"
    echo "   • Node.js (via NVM)"
    echo "   • n8n + localtunnel (local)"
    echo "   • Puppeteer + Chromium"
    echo "   • Wallpaper configurat"
    echo "   • Marcador n8n a Chromium"
    echo ""
    echo "📁 Directoris:"
    echo "   • Shared: ~/Desktop/shared"
    echo "   • Pràctiques: ~/Desktop/practiques"
    echo "   • n8n: ~/Desktop/prvagramnt actiques/n8n"
    echo ""
    echo "🚀 Iniciar n8n:"
    echo "   cd ~/Desktop/practiques/n8n"
    echo "   ./n8n-start.sh"
    echo ""
    echo "🌐 Chromium obrirà automàticament http://localhost:5678"
    echo ""
    echo "⚠️  Executa: vagrant reload"
    echo "════════════════════════════════════════════════"
  SHELL
end
