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
    vb.customize ["modifyvm", :id, "--clipboard-mode", "bidirectional"]
    vb.customize ["modifyvm", :id, "--draganddrop", "bidirectional"]
  end

  config.vm.boot_timeout = 600

  FileUtils.mkdir_p("./shared") unless Dir.exist?("./shared")
  config.vm.synced_folder "./shared", "/home/vagrant/shared", create: true

  # PROVISION 1: Sistema base
  config.vm.provision "shell", name: "base", inline: <<-SHELL
    echo "🔧 [1/4] Configurant sistema base..."
    
    # Deshabilitar snapd (no necessari i causa delays)
    systemctl stop snapd.service || true
    systemctl disable snapd.service || true
    systemctl mask snapd.service || true
    
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

  # PROVISION 2: Entorn gràfic mínim
  config.vm.provision "shell", name: "desktop", inline: <<-SHELL
    echo "🖥️ [2/4] Instal·lant escriptori mínim..."
    
    # Actualitzar cache
    apt-get update -y
    
    # Només el mínim per GUI
    echo "  → Instal·lant LXQt core..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends lxqt-core
    echo "  ✅ LXQt core instal·lat"
    
    echo "  → Instal·lant X Server..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends xserver-xorg xserver-xorg-video-all
    echo "  ✅ X Server instal·lat"
    
    echo "  → Instal·lant LightDM..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends lightdm lightdm-gtk-greeter
    echo "  ✅ LightDM instal·lat"
    
    echo "  → Instal·lant Firefox (des de PPA)..."
    # Afegir PPA de Mozilla per evitar snap
    add-apt-repository -y ppa:mozillateam/ppa
    
    # Prioritzar PPA sobre snap
    tee /etc/apt/preferences.d/mozilla-firefox > /dev/null <<'FIREFOXPREF'
Package: *
Pin: release o=LP-PPA-mozillateam
Pin-Priority: 1001

Package: firefox
Pin: version 1:1snap1-0ubuntu2
Pin-Priority: -1
FIREFOXPREF
    
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends firefox
    echo "  ✅ Firefox instal·lat"
    
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
    
    echo "✅ Escriptori instal·lat i configurat"
  SHELL

  # PROVISION 3: Python, Node.js i dependències de desenvolupament (COMPLETA)
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

  # PROVISION 4: Configuració final, wallpaper i pràctiques
  config.vm.provision "shell", name: "config", inline: <<-SHELL
    echo "🎨 [4/4] Configuració final..."
    
    # Crear directoris
    sudo -u vagrant mkdir -p /home/vagrant/Desktop
    sudo -u vagrant mkdir -p /home/vagrant/Pictures
    
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
      echo "⚠️  wallpaper.png no trobat (opcional)"
    fi
    
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
          npm install n8n localtunnel
        '
        
        # Script per executar n8n
        sudo -u vagrant tee /home/vagrant/Desktop/practiques/n8n/start-n8n.sh > /dev/null <<'N8NSCRIPT'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
cd ~/Desktop/practiques/n8n
npx n8n
N8NSCRIPT
        chmod +x /home/vagrant/Desktop/practiques/n8n/start-n8n.sh
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
    echo "   • Ubuntu 24.04 + LXQt (mínim)"
    echo "   • Python 3 + pip + venv"
    echo "   • Build tools + Guest Additions"
    echo "   • Node.js (via NVM)"
    echo "   • n8n + localtunnel (local)"
    echo "   • Puppeteer + Chromium"
    echo ""
    echo "📁 Directoris:"
    echo "   • Shared: ~/Desktop/shared"
    echo "   • Pràctiques: ~/Desktop/practiques"
    echo "   • n8n: ~/Desktop/practiques/n8n"
    echo ""
    echo "🚀 Iniciar n8n:"
    echo "   cd ~/Desktop/practiques/n8n"
    echo "   ./start-n8n.sh"
    echo ""
    echo "⚠️  Executa: vagrant reload"
    echo "════════════════════════════════════════════════"
  SHELL
end
