"""
Algorithme de suggestion ORIENTA+
Pour chaque filière compatible avec la série de l'étudiant:
1. Prendre les 3 matières prioritaires
2. Calculer la moyenne des notes correspondantes
3. Comparer avec les seuils pour chaque université
4. Retourner classement par pourcentage décroissant
"""

from .models import Filiere, FiliereMatiere, UniversiteFiliere


def calculer_pourcentage(moyenne, uf):
    """Calcule le pourcentage de compatibilité et le statut selon les seuils."""
    if moyenne >= uf.seuil_bourse:
        # Entre seuil_bourse et 20 → 100%
        max_note = 20.0
        if max_note == uf.seuil_bourse:
            pourcentage = 100.0
        else:
            pourcentage = min(100.0, 75 + (moyenne - uf.seuil_bourse) / (max_note - uf.seuil_bourse) * 25)
        return pourcentage, 'bourse'

    elif moyenne >= uf.seuil_demi_bourse:
        # Entre seuil_demi_bourse et seuil_bourse → 50-75%
        if uf.seuil_bourse == uf.seuil_demi_bourse:
            pourcentage = 50.0
        else:
            ratio = (moyenne - uf.seuil_demi_bourse) / (uf.seuil_bourse - uf.seuil_demi_bourse)
            pourcentage = 50 + ratio * 25
        return pourcentage, 'demi_bourse'

    elif moyenne >= uf.seuil_minimum:
        # Entre seuil_minimum et seuil_demi_bourse → 25-50%
        if uf.seuil_demi_bourse == uf.seuil_minimum:
            pourcentage = 25.0
        else:
            ratio = (moyenne - uf.seuil_minimum) / (uf.seuil_demi_bourse - uf.seuil_minimum)
            pourcentage = 25 + ratio * 25
        return pourcentage, 'payant'

    else:
        # En dessous du seuil minimum
        if uf.seuil_minimum == 0:
            pourcentage = 0.0
        else:
            ratio = max(0, moyenne / uf.seuil_minimum)
            pourcentage = ratio * 25
        return pourcentage, 'non_admissible'


def suggerer_filieres(serie_id, notes_dict):
    """
    Paramètres:
        serie_id: int - ID de la série du bac
        notes_dict: dict - {matiere_id_str: note_float}
    
    Retourne:
        list de dict avec les filieres et leurs résultats, triés par meilleur_pourcentage décroissant
    """
    # Convertir les clés en int
    notes = {int(k): float(v) for k, v in notes_dict.items()}

    # Récupérer les filières compatibles avec la série
    filieres = Filiere.objects.filter(
        series_acceptees__id=serie_id
    ).prefetch_related(
        'filiere_matieres__matiere',
        'universite_filieres__universite'
    ).distinct()

    resultats = []

    for filiere in filieres:
        # Récupérer les matières prioritaires (max 3), ordonnées
        matieres_prio = filiere.filiere_matieres.select_related('matiere').order_by('ordre')[:3]

        if not matieres_prio:
            continue

        # Calculer la moyenne avec les notes disponibles
        notes_utilisees = []
        for fm in matieres_prio:
            note = notes.get(fm.matiere.id)
            if note is not None:
                notes_utilisees.append({
                    'matiere_id': fm.matiere.id,
                    'matiere_nom': fm.matiere.nom,
                    'ordre': fm.ordre,
                    'note': note
                })

        if not notes_utilisees:
            continue

        moyenne = sum(n['note'] for n in notes_utilisees) / len(notes_utilisees)

        # Récupérer les offres universitaires pour cette filière
        offres = filiere.universite_filieres.select_related('universite').all()

        universites_resultats = []
        for uf in offres:
            pourcentage, statut = calculer_pourcentage(moyenne, uf)
            universites_resultats.append({
                'universite_id': uf.universite.id,
                'universite_nom': uf.universite.nom,
                'universite_ville': uf.universite.ville,
                'est_publique': uf.universite.est_publique,
                'annee': uf.annee,
                'places_disponibles': uf.places_disponibles,
                'seuil_minimum': uf.seuil_minimum,
                'seuil_demi_bourse': uf.seuil_demi_bourse,
                'seuil_bourse': uf.seuil_bourse,
                'statut': statut,
                'pourcentage': round(pourcentage, 1)
            })

        # Trier les universités par pourcentage décroissant
        universites_resultats.sort(key=lambda x: x['pourcentage'], reverse=True)

        meilleur_pourcentage = universites_resultats[0]['pourcentage'] if universites_resultats else 0
        meilleur_statut = universites_resultats[0]['statut'] if universites_resultats else 'non_admissible'

        resultats.append({
            'filiere_id': filiere.id,
            'filiere_nom': filiere.nom,
            'filiere_code': filiere.code,
            'duree': filiere.duree,
            'description': filiere.description,
            'debouches': filiere.debouches,
            'moyenne_calculee': round(moyenne, 2),
            'matieres_utilisees': notes_utilisees,
            'meilleur_pourcentage': meilleur_pourcentage,
            'meilleur_statut': meilleur_statut,
            'universites': universites_resultats
        })

    # Trier par meilleur pourcentage décroissant
    resultats.sort(key=lambda x: x['meilleur_pourcentage'], reverse=True)
    return resultats
