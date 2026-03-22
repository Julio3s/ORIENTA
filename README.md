# ORIENTA+ 🎓
**Plateforme d'orientation universitaire pour les bacheliers béninois**

---

## 🏗️ Architecture

```
orienta/
├── backend/          # Django + DRF + PostgreSQL
│   ├── orienta_backend/   # Config Django
│   ├── orienta/           # App principale
│   ├── manage.py
│   └── requirements.txt
├── frontend/         # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/client.js
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── scripts/
    └── insert_example_data.py
```

---

## ⚡ Installation rapide

### 1. Backend Django

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer la base de données (PostgreSQL)
# Créer un fichier .env dans backend/ :
```

**Fichier `backend/.env` :**
```env
SECRET_KEY=votre-cle-secrete-django-ici
DEBUG=True
DB_NAME=orienta_db
DB_USER=orienta_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

```bash
# Créer la base PostgreSQL
psql -U postgres -c "CREATE DATABASE orienta_db;"
psql -U postgres -c "CREATE USER orienta_user WITH PASSWORD 'votre_mot_de_passe';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE orienta_db TO orienta_user;"

# Migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superuser admin
python manage.py createsuperuser

# Insérer les données de test
python scripts/insert_example_data.py

# Lancer le serveur
python manage.py runserver
```

### 2. Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev
```

L'application sera disponible sur **http://localhost:5173**

---

## 🔗 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/series/` | Liste des séries de bac |
| GET | `/api/matieres/` | Liste des matières |
| GET | `/api/universites/` | Liste des universités |
| GET | `/api/filieres/` | Liste des filières |
| GET | `/api/universites-filieres/` | Seuils par université/filière |
| **POST** | **`/api/suggerer/`** | **Algorithme de suggestion** |
| POST | `/api/token/` | Obtenir un token JWT |
| POST | `/api/token/refresh/` | Rafraîchir le token |

### Exemple appel `/api/suggerer/`
```json
POST /api/suggerer/
{
  "serie_id": 3,
  "notes": {
    "1": 15.5,
    "2": 14.0,
    "3": 12.5
  }
}
```

---

## 🎨 Fonctionnalités

### Espace Étudiant
- ✅ Animation d'intro 8 secondes (Canvas)
- ✅ Sélection de la série de bac
- ✅ Saisie des notes (colorées selon la note)
- ✅ Résultats classés par compatibilité
- ✅ Filtres par statut (Bourse, Demi-bourse, Payant)
- ✅ Modal avec détails filière + universités

### Espace Admin (authentification requise)
- ✅ Dashboard avec statistiques
- ✅ CRUD Séries de bac
- ✅ CRUD Matières
- ✅ CRUD Universités
- ✅ CRUD Filières (avec matières prioritaires + séries)
- ✅ CRUD Seuils d'admission

---

## 🎭 Animation d'accueil (8 secondes)

| Phase | Durée | Description |
|-------|-------|-------------|
| 1 | 0-2s | Personnage court de gauche à droite |
| 2 | 2-3s | Saute par-dessus un diplôme BAC |
| 3 | 3-4s | Appuie sur le bouton O+ |
| 4 | 4-6s | BOOM! + "ORIENTA" apparaît en grand |
| 5 | 6-7s | Personnage ressort et s'assoit |
| 6 | 7-8s | Logo final "ORIENTA+" + sous-titre |

---

## 🐛 Production

```bash
# Backend
python manage.py collectstatic
gunicorn orienta_backend.wsgi:application

# Frontend
npm run build
# Servir le dossier dist/ avec nginx ou autre
```
