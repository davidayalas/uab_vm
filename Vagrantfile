# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-24.04"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "4096"
    vb.cpus = 2
    vb.gui = true
    vb.customize ["modifyvm", :id, "--graphicscontroller", "vmsvga"]
    vb.customize ["modifyvm", :id, "--accelerate3d", "on"]
    vb.customize ["modifyvm", :id, "--vram", "128"]
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    # Habilitar portapapers bidireccional
    vb.customize ["modifyvm", :id, "--clipboard-mode", "bidirectional"]
    # Habilitar drag & drop bidireccional
    vb.customize ["modifyvm", :id, "--draganddrop", "bidirectional"]
  end

  config.vm.boot_timeout = 600

  FileUtils.mkdir_p("./shared") unless Dir.exist?("./shared")
  config.vm.synced_folder "./shared", "/home/vagrant/shared", create: true

  # PROVISION 1: Sistema base i xarxa
  config.vm.provision "shell", name: "base", inline: <<-SHELL
    echo "🔧 [1/5] Configurant sistema base i xarxa..."
    
    # Optimitzar xarxa
    mkdir -p /etc/systemd/system/systemd-networkd-wait-online.service.d/
    tee /etc/systemd/system/systemd-networkd-wait-online.service.d/override.conf > /dev/null <<NETCONF
[Service]
ExecStart=
ExecStart=/lib/systemd/systemd-networkd-wait-online --timeout=10
NETCONF

    mkdir -p /etc/systemd/resolved.conf.d/
    tee /etc/systemd/resolved.conf.d/dns.conf > /dev/null <<DNSCONF
[Resolve]
DNS=8.8.8.8 8.8.4.4
FallbackDNS=1.1.1.1 1.0.0.1
DNSStubListener=yes
DNSCONF

    systemctl daemon-reload
    systemctl restart systemd-resolved || true
    
    # Configuració bàsica
    timedatectl set-timezone Europe/Madrid
    locale-gen ca_ES.UTF-8
    update-locale LANG=ca_ES.UTF-8 LC_ALL=ca_ES.UTF-8
    
    # Actualitzar
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --no-install-recommends
    
    # Utilitats essencials
    apt-get install -y curl git wget software-properties-common ca-certificates
    apt-get install -y language-pack-ca language-pack-gnome-ca
    
    echo "✅ Sistema base configurat"
  SHELL

  # PROVISION 2: Instal·lació entorn gràfic
  config.vm.provision "shell", name: "desktop-install", inline: <<-SHELL
    echo "🖥️ [2/5] Instal·lant paquets d'escriptori..."
    
    # Actualitzar cache d'apt
    apt-get update -y
    
    # LXQt core - el més pesat
    echo "  → Instal·lant LXQt core..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y lxqt-core
    echo "  ✅ LXQt core instal·lat"
    
    # X Server
    echo "  → Instal·lant X Server..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y xserver-xorg xserver-xorg-video-all
    echo "  ✅ X Server instal·lat"
    
    # LightDM
    echo "  → Instal·lant LightDM..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y lightdm lightdm-gtk-greeter
    echo "  ✅ LightDM instal·lat"
    
    # Aplicacions bàsiques
    echo "  → Instal·lant Firefox i xterm..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y firefox xterm
    echo "  ✅ Firefox i xterm instal·lats"
    
    echo "✅ Paquets d'escriptori instal·lats"
  SHELL

  # PROVISION 3: Configuració entorn gràfic
  config.vm.provision "shell", name: "desktop-config", inline: <<-SHELL
    echo "⚙️ [3/5] Configurant entorn d'escriptori..."
    
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
user-session=lxqt
greeter-session=lightdm-gtk-greeter
EOF
    
    # Afegir vagrant al grup autologin
    groupadd -f autologin
    usermod -aG autologin vagrant
    
    # Mask gdm3 si existeix (pot interferir amb lightdm)
    systemctl mask gdm3 || true
    
    # Habilitar lightdm
    systemctl unmask lightdm
    systemctl enable lightdm
    systemctl set-default graphical.target
    
    # Reconfigurar lightdm
    dpkg-reconfigure -f noninteractive lightdm
    
    # Assegurar que X11 està configurat
    dpkg-reconfigure -f noninteractive xserver-xorg
    
    echo "✅ Entorn d'escriptori configurat"
  SHELL

  # PROVISION 4: Python, Node.js i dependències de desenvolupament
  config.vm.provision "shell", name: "devtools", inline: <<-SHELL
    echo "📦 [4/5] Instal·lant eines de desenvolupament..."
    
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
    apt-get install -y virtualbox-guest-utils virtualbox-guest-x11
    usermod -aG vboxsf vagrant
    echo "  ✅ Guest Additions instal·lades"

    # Dependències per Puppeteer/Chromium
    echo "  → Instal·lant dependències Chromium..."
    apt-get install -y \
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
    echo "  ✅ Dependències Chromium instal·lades"
    
    # Node.js via NVM
    echo "  → Instal·lant Node.js via NVM..."
    sudo -u vagrant bash -c '
      export HOME=/home/vagrant
      export NVM_DIR="$HOME/.nvm"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
      source "$NVM_DIR/nvm.sh"
      nvm install --lts
      nvm use --lts
    '
    
    # Afegir NVM al .bashrc
    sudo -u vagrant bash -c 'echo "export NVM_DIR=\"\$HOME/.nvm\"" >> /home/vagrant/.bashrc'
    sudo -u vagrant bash -c 'echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"" >> /home/vagrant/.bashrc'
    echo "  ✅ Node.js instal·lat"
    
    echo "✅ Eines de desenvolupament instal·lades"
  SHELL

  # PROVISION 5: Configuració final, Firefox, wallpaper i pràctiques
  config.vm.provision "shell", name: "config", inline: <<-SHELL
    echo "🎨 [5/5] Configuració final..."
    
    # Crear directoris
    sudo -u vagrant mkdir -p /home/vagrant/workspace
    sudo -u vagrant mkdir -p /home/vagrant/Desktop
    sudo -u vagrant mkdir -p /home/vagrant/Pictures
    sudo -u vagrant mkdir -p /home/vagrant/.mozilla/firefox
    
    # Configurar Firefox amb bookmark per n8n
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
    
    sudo -u vagrant mkdir -p /home/vagrant/.mozilla/firefox/default-release
    
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
    
    sudo -u vagrant bash -c 'cat > /home/vagrant/.mozilla/firefox/default-release/user.js <<USERJS
user_pref("browser.bookmarks.restore_default_bookmarks", false);
user_pref("browser.startup.homepage", "http://localhost:5678");
user_pref("browser.toolbars.bookmarks.visibility", "always");
USERJS
'
    
    # Configurar wallpaper si existeix
    if [ -f /vagrant/wallpaper.png ]; then
      echo "📸 Configurant wallpaper..."
      sudo -u vagrant cp /vagrant/wallpaper.png /home/vagrant/wallpaper.png
      sudo -u vagrant cp /vagrant/wallpaper.png /home/vagrant/Pictures/
      
      sudo -u vagrant mkdir -p /home/vagrant/.config/pcmanfm-qt/lxqt
      sudo -u vagrant mkdir -p /home/vagrant/.config/lxqt
      
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
    
    # Descarregar pràctiques
    if [ ! -d "/home/vagrant/Desktop/practiques" ]; then
      echo "📦 Descarregant pràctiques..."
      
      sudo -u vagrant git clone --depth 1 https://github.com/davidayalas/uab_vm.git /tmp/uab_vm_temp
      
      if [ -d "/tmp/uab_vm_temp/practiques" ]; then
        sudo -u vagrant cp -r /tmp/uab_vm_temp/practiques /home/vagrant/Desktop/
        find /home/vagrant/Desktop/practiques -type f -name "*.sh" -exec chmod +x {} \\;
        echo "✅ Pràctiques descarregades"
        
        # INSTAL·LAR N8N LOCALMENT a practiques/n8n
        echo "  → Creant projecte n8n local..."
        sudo -u vagrant mkdir -p /home/vagrant/Desktop/practiques/n8n
        sudo -u vagrant bash -c '
          export HOME=/home/vagrant
          export NVM_DIR="$HOME/.nvm"
          source "$NVM_DIR/nvm.sh"
          cd /home/vagrant/Desktop/practiques/n8n
          npm init -y
          npm install n8n localtunnel
        '
        
        # Crear script per executar n8n
        sudo -u vagrant tee /home/vagrant/Desktop/practiques/n8n/start-n8n.sh > /dev/null <<'N8NSCRIPT'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
cd ~/Desktop/practiques/n8n
npx n8n
N8NSCRIPT
        chmod +x /home/vagrant/Desktop/practiques/n8n/start-n8n.sh
        echo "  ✅ n8n instal·lat localment"
        
        # INSTAL·LAR DEPENDÈNCIES a demo-rpa (puppeteer, etc.)
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
      echo "🔗 Creant accés directe a shared..."
      sudo -u vagrant ln -s /home/vagrant/shared /home/vagrant/Desktop/shared
      echo "✅ Accés directe creat"
    fi
    
    # Accés directe a Firefox
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
      chmod +x /home/vagrant/Desktop/firefox.desktop
      echo "✅ Accés directe a Firefox creat"
    fi
    
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "✅ INSTAL·LACIÓ COMPLETADA!"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "📦 Components instal·lats:"
    echo "   • Ubuntu 24.04 LTS amb LXQt"
    echo "   • Python 3 + pip + venv"
    echo "   • Node.js (via NVM)"
    echo "   • n8n (local a ~/Desktop/practiques/n8n)"
    echo "   • Puppeteer + Chromium (local a demo-rpa)"
    echo "   • Firefox amb bookmark a n8n"
    echo ""
    echo "📁 Directoris:"
    echo "   • Carpeta compartida: /home/vagrant/shared"
    echo "   • Pràctiques: ~/Desktop/practiques"
    echo "   • n8n: ~/Desktop/practiques/n8n"
    echo "   • demo-rpa: ~/Desktop/practiques/demo-rpa"
    echo ""
    echo "🔧 Funcionalitats:"
    echo "   • Teclat: Espanyol"
    echo "   • Portapapers: Bidireccional"
    echo "   • Drag & Drop: Bidireccional"
    echo "   • Autologin: Activat"
    echo ""
    echo "🚀 Per iniciar n8n:"
    echo "   cd ~/Desktop/practiques/n8n"
    echo "   ./start-n8n.sh"
    echo ""
    echo "⚠️  IMPORTANT: Executa 'vagrant reload' per activar l'entorn gràfic"
    echo "════════════════════════════════════════════════════════════"
  SHELL
end
