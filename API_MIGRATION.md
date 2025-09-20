# Migration API - SafiMayi Frontend

## Résumé des changements

### 1. Nouvelle URL d'API
- **Ancienne URL**: `https://safimayi-backend.onrender.com`
- **Nouvelle URL**: `https://api.safimayi.com`

### 2. Gestion automatique du refresh des tokens

#### Fonctionnalités ajoutées :
- **Refresh automatique** : Quand un token expire (code 401), le système tente automatiquement de le rafraîchir
- **Redirection automatique** : Si le refresh échoue, l'utilisateur est redirigé vers la page de connexion
- **Stockage du refresh token** : Le refresh token est maintenant stocké dans localStorage

#### Fichiers créés :
- `src/utils/api.ts` : Client API avec intercepteurs pour la gestion automatique des tokens
- `src/types/api.ts` : Types TypeScript pour les réponses API

#### Fichiers modifiés :
- `src/pages/Login.tsx` : Stockage du refresh token et autres données utilisateur
- `src/sections/vente/view/vente-view.tsx` : Migration vers le nouveau client API
- `src/sections/user/view/user-view.tsx` : Migration vers le nouveau client API
- `src/sections/siteforage/view/siteforage-view.tsx` : Migration vers le nouveau client API
- `src/sections/rfid/view/rfid-view.tsx` : Migration vers le nouveau client API
- `src/sections/overview/view/overview-analytics-view.tsx` : Migration vers le nouveau client API
- `src/sections/journaux_system/view/journaux-view.tsx` : Migration vers le nouveau client API

### 3. Structure de la réponse de connexion

La réponse de connexion contient maintenant :
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 3,
        "nom": "Jame",
        "telephone": "099121211",
        "email": "jellymaweja@gmail.com",
        "role": "admin",
        "state": true
    },
    "solde_litres": 2140.0,
    "id_litrage": 1
}
```

### 4. Utilisation du nouveau client API

Au lieu d'utiliser axios directement, utilisez maintenant le client API :

```typescript
// Ancien code
const token = localStorage.getItem('token');
const response = await axios.get('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});

// Nouveau code
import apiClient from '../utils/api';
const response = await apiClient.get('/api/endpoint');
```

### 5. Gestion des erreurs de token

Le système détecte automatiquement les erreurs de token expiré :
```json
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is expired"
        }
    ]
}
```

Et tente automatiquement de rafraîchir le token via :
```
POST https://api.safimayi.com/api/users/token/refresh/
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Avantages

1. **Expérience utilisateur améliorée** : Plus besoin de se reconnecter manuellement
2. **Code plus propre** : Suppression de la gestion manuelle des tokens
3. **Sécurité renforcée** : Gestion automatique des tokens expirés
4. **Maintenance facilitée** : Centralisation de la logique API
