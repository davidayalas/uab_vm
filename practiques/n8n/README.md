# Com començar

* Clica o executa el fitxer n8n-start.sh

* S'ha donat d'alta un usuari fake amb:

        * user = uab_ttiiaaee@uab.cat
        * pwd = 12345678A

* Navega a http://localhost:5678/

# Què fa el script (resum)

* Mata qualsevol procés que estigui utilitzant el port 5678, que és el port per defecte on corre n8n, per evitar conflictes.

* Carrega l'entorn de Node Version Manager (NVM) i usa Node 24 per assegurar compatibilitat.

* Llança localtunnel al port 5678 i captura la URL pública que genera per connectar-te des d’internet al teu servidor local.

* Exporta aquesta URL com a variable d’entorn WEBHOOK_URL perquè n8n la pugui utilitzar per configurar els webhooks.

* Arrenca n8n en background.

* Controla que, en tancar el script, es tanquin també els processos de localtunnel i n8n de forma neta.

* Aquest procés t’evita haver de llançar manualment localtunnel i n8n i administrar la URL pública que es genera cada vegada que arranques.