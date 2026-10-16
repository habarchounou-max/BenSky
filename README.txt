BEN SKY TECH — SITE WEB (statique : HTML + CSS + JavaScript)
==============================================================

CONTENU DU DOSSIER
  index.html          Page unique du site (SEO, données structurées, métadonnées)
  css/style.css       Styles de base (thème clair par défaut + thème sombre)
  css/advanced.css    Intro animée, devis, recherche rapide, assistant
  js/main.js          Noyau (menu, thème, onglets, animations, formulaire)
  js/ui.js            Notifications, inclinaison 3D, copie, assistant de gamme
  js/quote.js         Constructeur de devis (liste enregistrée dans le navigateur)
  js/compare.js       Comparateur de gammes (lit les fiches produits du site)
  js/palette.js       Recherche rapide (Ctrl/⌘ + K ou touche « / »)
  js/gl.js            Fond WebGL animé du hero (repli automatique si indisponible)
  sw.js               Mode hors ligne (changez VERSION à chaque mise à jour)
  assets/             Images (WebP), icônes, polices Poppins auto-hébergées
  404.html            Page d'erreur personnalisée
  robots.txt          Consignes pour les moteurs de recherche
  sitemap.xml         Plan du site
  site.webmanifest    Métadonnées d'installation (PWA légère)
  favicon.ico         Icône du site
  .htaccess           Cache, compression, sécurité (hébergements Apache / cPanel)
  _headers            Mêmes réglages pour Netlify / Cloudflare Pages

AUCUNE INSTALLATION NÉCESSAIRE
  Aucune dépendance externe : pas de CDN, pas de framework, pas de base de données.

HÉBERGER LE SITE (3 façons simples)
  1) Hébergement classique (cPanel, OVH, o2switch, etc.)
     - Envoyez TOUT le contenu de ce dossier dans le dossier "public_html"
       (ou "www"), de façon à ce que index.html soit à la racine.
     - Pensez à inclure les fichiers cachés (.htaccess).

  2) Netlify ou Cloudflare Pages (gratuit)
     - Glissez-déposez ce dossier dans l'interface. Le site est en ligne en quelques secondes.
     - Reliez ensuite le nom de domaine www.benskytech.com.

  3) GitHub Pages
     - Placez les fichiers à la racine d'un dépôt et activez Pages.

APERÇU SUR VOTRE ORDINATEUR
  Double-cliquez sur index.html. (Pour un test fidèle : "python -m http.server" puis http://localhost:8000)

À PERSONNALISER APRÈS MISE EN LIGNE
  - Domaine : le site suppose https://www.benskytech.com/ (balises canonical, Open Graph,
    sitemap.xml, robots.txt). Si l'adresse change, remplacez-la dans ces fichiers.
  - Facebook : le lien du pied de page et de la section Contact pointe vers une recherche
    "Ben Sky Tech". Remplacez-le par l'adresse exacte de votre page dans index.html
    (cherchez "facebook.com/search").
  - Formulaire de devis : il ouvre la messagerie du visiteur avec le message prêt à envoyer
    à support@benskytech.com (aucun serveur requis). Pour recevoir les messages directement,
    branchez-le sur un service comme Formspree ou Web3Forms (modifiez js/main.js, bloc "Formulaire").
  - Photos : remplacez les fichiers de assets/img/ en gardant les mêmes noms pour changer les visuels.

FONCTIONS AVANCÉES
  - Intro animée (une seule fois par session) et titres animés mot par mot.
  - Fond WebGL interactif qui réagit à la souris ; désactivé si l'utilisateur préfère moins d'animations.
  - Assistant « Quel équipement pour vous ? » : l'utilisateur choisit son profil, le site recommande la gamme.
  - Devis : boutons « Ajouter au devis » partout, tiroir avec quantités, envoi par e-mail ou dans le formulaire.
  - Section « Notre engagement » : le texte se révèle mot à mot pendant le défilement.
  - Méthode en narration visuelle : illustrations animées qui changent à chaque étape.
  - Comparateur de gammes (HP, Lenovo, Dell, Apple) avec ajout au devis.
  - Recherche rapide Ctrl/⌘ + K, thème clair/sombre mémorisé, boutons de copie des contacts.
  - Mode hors ligne après la première visite (service worker, uniquement sur HTTPS ou localhost).

RESPONSIVE
  - Testé de 320 px (petit téléphone) à 3440 px (ultra-large), en portrait et en paysage.
  - Menu replié dès 1100 px, zones tactiles de 44 px, zones sûres des téléphones à encoche,
  - Agrandissement automatique sur les écrans 2K / 4K, grilles qui s'adaptent seules.

NAVIGATEURS
  Chrome, Edge, Safari, Firefox récents (CSS moderne : @layer, color-mix, :has()).
