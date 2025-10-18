# Guide de dépannage - Carte Mapbox

## Problème : La carte de siteforage ne s'affiche pas et reste en chargement

### Solutions à essayer :

#### 1. Vérifier la connexion Internet
- Assurez-vous d'avoir une connexion Internet stable
- Essayez de recharger la page (F5 ou Ctrl+R)

#### 2. Vérifier les paramètres WebGL du navigateur
- **Chrome/Edge** : Tapez `chrome://settings/content/all` dans la barre d'adresse
- **Firefox** : Tapez `about:config` et recherchez `webgl.disabled` (doit être `false`)
- Assurez-vous que WebGL est activé

#### 3. Vider le cache du navigateur
- **Chrome** : Ctrl+Shift+Delete → Sélectionner "Images et fichiers en cache"
- **Firefox** : Ctrl+Shift+Delete → Sélectionner "Cache"
- Recharger la page après avoir vidé le cache

#### 4. Désactiver temporairement les extensions
- Désactivez les bloqueurs de publicités (AdBlock, uBlock Origin, etc.)
- Désactivez les extensions de sécurité qui pourraient bloquer les requêtes

#### 5. Tester avec un autre navigateur
- Essayez d'ouvrir la page avec un autre navigateur
- Si ça fonctionne, le problème vient du navigateur principal

#### 6. Vérifier la console développeur
- Appuyez sur F12 pour ouvrir les outils de développement
- Allez dans l'onglet "Console"
- Recherchez les erreurs liées à Mapbox ou WebGL
- Les messages d'erreur vous donneront des indices sur le problème

#### 7. Problèmes de réseau d'entreprise
- Si vous êtes sur un réseau d'entreprise, des restrictions peuvent bloquer l'accès à Mapbox
- Contactez votre administrateur réseau

### Messages d'erreur courants :

- **"Clé API Mapbox invalide ou manquante"** : Problème de configuration côté serveur
- **"WebGL not supported"** : Votre navigateur ne supporte pas WebGL
- **"Network error"** : Problème de connexion réseau
- **"CORS error"** : Restrictions de sécurité du navigateur

### Si rien ne fonctionne :
1. Contactez le support technique
2. Fournissez les messages d'erreur de la console
3. Indiquez votre navigateur et sa version
4. Mentionnez si vous êtes sur un réseau d'entreprise
