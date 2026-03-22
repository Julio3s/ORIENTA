#!/usr/bin/env python
"""
Script d'insertion de données de test pour ORIENTA+
Usage: python manage.py shell < scripts/insert_example_data.py
  ou:  python scripts/insert_example_data.py (depuis le dossier backend)
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'orienta_backend.settings')
django.setup()

from orienta.models import (
    SerieBac, Matiere, SerieMatiere, Universite,
    Filiere, FiliereMatiere, FiliereSerie, UniversiteFiliere
)

print("🚀 Insertion des données de test ORIENTA+...")

# === SÉRIES ===
series_data = [
    {'code': 'A1', 'nom': 'Lettres et Langues', 'description': 'Série littéraire avec langues vivantes'},
    {'code': 'B',  'nom': 'Économie et Sciences Sociales', 'description': 'Série économique et sociale'},
    {'code': 'C',  'nom': 'Mathématiques et Sciences Physiques', 'description': 'Série scientifique renforcée en maths'},
    {'code': 'D',  'nom': 'Sciences de la Vie et de la Terre', 'description': 'Série scientifique SVT'},
    {'code': 'E',  'nom': 'Mathématiques et Techniques', 'description': 'Série technique et mathématiques'},
    {'code': 'G2', 'nom': 'Techniques Comptables', 'description': 'Série technique comptable'},
]
series = {}
for s in series_data:
    obj, created = SerieBac.objects.get_or_create(code=s['code'], defaults=s)
    series[s['code']] = obj
    print(f"  {'✅' if created else '⏭️'} Série {s['code']}")

# === MATIÈRES ===
matieres_data = [
    {'code': 'MATH', 'nom': 'Mathématiques'},
    {'code': 'PHYS', 'nom': 'Physique-Chimie'},
    {'code': 'SVT',  'nom': 'Sciences de la Vie et de la Terre'},
    {'code': 'HIST', 'nom': 'Histoire-Géographie'},
    {'code': 'PHIL', 'nom': 'Philosophie'},
    {'code': 'FRANC', 'nom': 'Français'},
    {'code': 'ANGL', 'nom': 'Anglais'},
    {'code': 'ECO',  'nom': 'Économie'},
    {'code': 'COMPT', 'nom': 'Comptabilité'},
    {'code': 'INFO', 'nom': 'Informatique'},
    {'code': 'ESP',  'nom': 'Espagnol'},
    {'code': 'TECH', 'nom': 'Technologie'},
]
matieres = {}
for m in matieres_data:
    obj, created = Matiere.objects.get_or_create(code=m['code'], defaults=m)
    matieres[m['code']] = obj
    print(f"  {'✅' if created else '⏭️'} Matière {m['code']}")

# === COEFFICIENTS PAR SÉRIE ===
coefficients = {
    'C':  [('MATH',5), ('PHYS',4), ('SVT',2), ('FRANC',3), ('HIST',2), ('ANGL',2), ('PHIL',2), ('INFO',1)],
    'D':  [('MATH',3), ('PHYS',3), ('SVT',5), ('FRANC',3), ('HIST',2), ('ANGL',2), ('PHIL',2)],
    'A1': [('FRANC',5), ('ANGL',4), ('HIST',4), ('PHIL',3), ('ESP',2), ('MATH',2), ('ECO',1)],
    'B':  [('ECO',5), ('MATH',3), ('HIST',3), ('FRANC',3), ('ANGL',2), ('PHIL',2), ('COMPT',2)],
    'E':  [('MATH',5), ('PHYS',4), ('TECH',4), ('FRANC',2), ('ANGL',2), ('HIST',1)],
    'G2': [('COMPT',5), ('ECO',4), ('MATH',3), ('FRANC',3), ('ANGL',2), ('HIST',1)],
}
for serie_code, coefs in coefficients.items():
    for mat_code, coef in coefs:
        if mat_code in matieres:
            SerieMatiere.objects.get_or_create(
                serie=series[serie_code],
                matiere=matieres[mat_code],
                defaults={'coefficient': coef}
            )

print("  ✅ Coefficients insérés")

# === UNIVERSITÉS ===
universites_data = [
    {'nom': 'Université d\'Abomey-Calavi (UAC)', 'ville': 'Cotonou', 'est_publique': True,
     'description': 'La plus grande université publique du Bénin', 'site_web': 'https://uac.bj'},
    {'nom': 'Université Nationale des Sciences Technologies Ingénierie Mathématiques (UNSTIM)', 'ville': 'Abomey', 'est_publique': True,
     'description': 'Université technique publique du Bénin', 'site_web': ''},
    {'nom': 'Université de Parakou (UP)', 'ville': 'Parakou', 'est_publique': True,
     'description': 'Université publique du nord Bénin', 'site_web': 'https://up.bj'},
    {'nom': 'Institut Supérieur de Technologie (IST)', 'ville': 'Cotonou', 'est_publique': False,
     'description': 'École privée d\'ingénierie', 'site_web': ''},
    {'nom': 'Université Catholique de l\'Afrique de l\'Ouest (UCAO)', 'ville': 'Cotonou', 'est_publique': False,
     'description': 'Université privée catholique', 'site_web': ''},
    {'nom': 'PIGIER Bénin', 'ville': 'Cotonou', 'est_publique': False,
     'description': 'École de commerce et gestion', 'site_web': ''},
]
universites = {}
for u in universites_data:
    obj, created = Universite.objects.get_or_create(nom=u['nom'], defaults=u)
    universites[u['nom']] = obj
    print(f"  {'✅' if created else '⏭️'} Université {u['nom'][:30]}...")

# === FILIÈRES ===
filieres_data = [
    {
        'code': 'INFO-L', 'nom': 'Licence en Informatique', 'duree': 3,
        'description': 'Formation en développement logiciel, systèmes et réseaux',
        'debouches': 'Développeur, Analyste, Administrateur systèmes, Data Scientist',
        'matieres': [('MATH',1), ('INFO',2), ('PHYS',3)],
        'series': ['C', 'D', 'E'],
    },
    {
        'code': 'GENIE-INFO', 'nom': 'Génie Informatique', 'duree': 5,
        'description': 'Formation d\'ingénieur en informatique et systèmes embarqués',
        'debouches': 'Ingénieur logiciel, Chef de projet IT, Architecte systèmes',
        'matieres': [('MATH',1), ('PHYS',2), ('INFO',3)],
        'series': ['C', 'E'],
    },
    {
        'code': 'MED-GEN', 'nom': 'Médecine Générale', 'duree': 7,
        'description': 'Formation médicale complète pour devenir médecin généraliste',
        'debouches': 'Médecin généraliste, Spécialiste après internat',
        'matieres': [('SVT',1), ('PHYS',2), ('MATH',3)],
        'series': ['C', 'D'],
    },
    {
        'code': 'PHARMA', 'nom': 'Pharmacie', 'duree': 6,
        'description': 'Formation pour devenir pharmacien',
        'debouches': 'Pharmacien d\'officine, Chercheur pharmaceutique',
        'matieres': [('SVT',1), ('PHYS',2), ('MATH',3)],
        'series': ['C', 'D'],
    },
    {
        'code': 'DROIT', 'nom': 'Droit', 'duree': 3,
        'description': 'Licence en sciences juridiques et droit',
        'debouches': 'Avocat, Magistrat, Notaire, Juriste d\'entreprise',
        'matieres': [('HIST',1), ('FRANC',2), ('PHIL',3)],
        'series': ['A1', 'B', 'C', 'D'],
    },
    {
        'code': 'ECO-GEST', 'nom': 'Économie et Gestion', 'duree': 3,
        'description': 'Formation en économie, gestion d\'entreprise et finance',
        'debouches': 'Gestionnaire, Économiste, Directeur financier',
        'matieres': [('ECO',1), ('MATH',2), ('COMPT',3)],
        'series': ['B', 'G2', 'C'],
    },
    {
        'code': 'COMPTA-L', 'nom': 'Licence en Comptabilité', 'duree': 3,
        'description': 'Formation en comptabilité et finance d\'entreprise',
        'debouches': 'Comptable, Auditeur, Expert-comptable',
        'matieres': [('COMPT',1), ('MATH',2), ('ECO',3)],
        'series': ['G2', 'B', 'C'],
    },
    {
        'code': 'LETTRE-LANG', 'nom': 'Lettres et Langues Étrangères', 'duree': 3,
        'description': 'Formation littéraire et linguistique',
        'debouches': 'Enseignant, Traducteur, Journaliste, Diplomate',
        'matieres': [('FRANC',1), ('ANGL',2), ('HIST',3)],
        'series': ['A1', 'B'],
    },
    {
        'code': 'GENIE-CIVIL', 'nom': 'Génie Civil', 'duree': 5,
        'description': 'Formation d\'ingénieur en construction et infrastructure',
        'debouches': 'Ingénieur civil, Chef de chantier, Urbaniste',
        'matieres': [('MATH',1), ('PHYS',2), ('TECH',3)],
        'series': ['C', 'E'],
    },
    {
        'code': 'AGRO', 'nom': 'Agronomie', 'duree': 3,
        'description': 'Formation en sciences agricoles et agroalimentaire',
        'debouches': 'Agronome, Chercheur agricole, Gestionnaire d\'exploitation',
        'matieres': [('SVT',1), ('PHYS',2), ('MATH',3)],
        'series': ['D', 'C'],
    },
]

filieres = {}
for f in filieres_data:
    filiere, created = Filiere.objects.get_or_create(
        code=f['code'],
        defaults={
            'nom': f['nom'],
            'duree': f['duree'],
            'description': f['description'],
            'debouches': f['debouches'],
        }
    )
    filieres[f['code']] = filiere

    # Matières prioritaires
    for mat_code, ordre in f['matieres']:
        if mat_code in matieres:
            FiliereMatiere.objects.get_or_create(
                filiere=filiere, ordre=ordre,
                defaults={'matiere': matieres[mat_code]}
            )

    # Séries acceptées
    for serie_code in f['series']:
        if serie_code in series:
            FiliereSerie.objects.get_or_create(filiere=filiere, serie=series[serie_code])

    print(f"  {'✅' if created else '⏭️'} Filière {f['code']}")

# === SEUILS PAR UNIVERSITÉ ET FILIÈRE ===
seuils_data = [
    # UAC
    ('Université d\'Abomey-Calavi (UAC)', 'INFO-L',    2024, 10.0, 13.0, 16.0, 150),
    ('Université d\'Abomey-Calavi (UAC)', 'GENIE-INFO', 2024, 12.0, 14.0, 17.0, 80),
    ('Université d\'Abomey-Calavi (UAC)', 'MED-GEN',   2024, 14.0, 16.0, 18.0, 200),
    ('Université d\'Abomey-Calavi (UAC)', 'PHARMA',    2024, 13.0, 15.0, 17.5, 100),
    ('Université d\'Abomey-Calavi (UAC)', 'DROIT',     2024, 10.0, 12.0, 15.0, 300),
    ('Université d\'Abomey-Calavi (UAC)', 'ECO-GEST',  2024, 10.0, 13.0, 16.0, 250),
    ('Université d\'Abomey-Calavi (UAC)', 'AGRO',      2024, 10.0, 12.0, 15.0, 120),
    # UNSTIM
    ('Université Nationale des Sciences Technologies Ingénierie Mathématiques (UNSTIM)', 'GENIE-INFO', 2024, 11.0, 13.5, 16.5, 60),
    ('Université Nationale des Sciences Technologies Ingénierie Mathématiques (UNSTIM)', 'GENIE-CIVIL', 2024, 11.0, 13.0, 16.0, 80),
    ('Université Nationale des Sciences Technologies Ingénierie Mathématiques (UNSTIM)', 'INFO-L',     2024, 10.0, 12.5, 15.5, 100),
    # UP Parakou
    ('Université de Parakou (UP)', 'MED-GEN',   2024, 13.0, 15.5, 17.5, 100),
    ('Université de Parakou (UP)', 'DROIT',     2024, 10.0, 12.0, 15.0, 200),
    ('Université de Parakou (UP)', 'ECO-GEST',  2024, 10.0, 12.5, 15.5, 150),
    ('Université de Parakou (UP)', 'AGRO',      2024, 10.0, 12.0, 15.0, 100),
    # IST (privée)
    ('Institut Supérieur de Technologie (IST)', 'INFO-L',     2024, 10.0, 13.0, 16.0, 100),
    ('Institut Supérieur de Technologie (IST)', 'GENIE-INFO', 2024, 11.0, 14.0, 17.0, 60),
    ('Institut Supérieur de Technologie (IST)', 'GENIE-CIVIL',2024, 10.0, 12.5, 15.5, 80),
    # UCAO
    ('Université Catholique de l\'Afrique de l\'Ouest (UCAO)', 'DROIT',    2024, 10.0, 13.0, 16.0, 200),
    ('Université Catholique de l\'Afrique de l\'Ouest (UCAO)', 'ECO-GEST', 2024, 10.0, 12.5, 15.5, 150),
    ('Université Catholique de l\'Afrique de l\'Ouest (UCAO)', 'LETTRE-LANG', 2024, 10.0, 12.0, 15.0, 100),
    # PIGIER
    ('PIGIER Bénin', 'ECO-GEST',  2024, 10.0, 12.0, 15.0, 100),
    ('PIGIER Bénin', 'COMPTA-L',  2024, 10.0, 12.0, 15.0, 120),
]

for u_nom, f_code, annee, s_min, s_demi, s_bourse, places in seuils_data:
    if u_nom in universites and f_code in filieres:
        UniversiteFiliere.objects.get_or_create(
            universite=universites[u_nom],
            filiere=filieres[f_code],
            annee=annee,
            defaults={
                'seuil_minimum': s_min,
                'seuil_demi_bourse': s_demi,
                'seuil_bourse': s_bourse,
                'places_disponibles': places,
            }
        )

print("  ✅ Seuils insérés")
print("\n🎉 Données de test insérées avec succès!")
print("   Vous pouvez maintenant créer un superuser: python manage.py createsuperuser")
