from rest_framework import serializers
from .models import (
    SerieBac, Matiere, SerieMatiere, Universite,
    Filiere, FiliereMatiere, FiliereSerie, UniversiteFiliere
)


class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = '__all__'


class SerieMatiereSerializer(serializers.ModelSerializer):
    matiere = MatiereSerializer(read_only=True)
    matiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Matiere.objects.all(), source='matiere', write_only=True
    )
    serie = serializers.PrimaryKeyRelatedField(read_only=True)
    serie_id = serializers.PrimaryKeyRelatedField(
        queryset=SerieBac.objects.all(), source='serie', write_only=True
    )

    class Meta:
        model = SerieMatiere
        fields = ['id', 'serie', 'serie_id', 'matiere', 'matiere_id', 'coefficient']
        validators = []

    def create(self, validated_data):
        obj, created = SerieMatiere.objects.update_or_create(
            serie=validated_data['serie'],
            matiere=validated_data['matiere'],
            defaults={'coefficient': validated_data.get('coefficient', 1)}
        )
        return obj


class SerieBacSerializer(serializers.ModelSerializer):
    serie_matieres = SerieMatiereSerializer(many=True, read_only=True)

    class Meta:
        model = SerieBac
        fields = ['id', 'code', 'nom', 'description', 'serie_matieres']


class SerieBacListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SerieBac
        fields = ['id', 'code', 'nom', 'description']


class UniversiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Universite
        fields = '__all__'


class FiliereMatiereSerializer(serializers.ModelSerializer):
    matiere = MatiereSerializer(read_only=True)
    matiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Matiere.objects.all(), source='matiere', write_only=True
    )
    filiere = serializers.PrimaryKeyRelatedField(read_only=True)
    filiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Filiere.objects.all(), source='filiere', write_only=True
    )

    class Meta:
        model = FiliereMatiere
        fields = ['id', 'filiere', 'filiere_id', 'matiere', 'matiere_id', 'ordre']
        validators = []

    def create(self, validated_data):
        obj, created = FiliereMatiere.objects.update_or_create(
            filiere=validated_data['filiere'],
            ordre=validated_data.get('ordre', 1),
            defaults={'matiere': validated_data['matiere']}
        )
        return obj


class UniversiteFiliereSerializer(serializers.ModelSerializer):
    universite = UniversiteSerializer(read_only=True)
    universite_id = serializers.PrimaryKeyRelatedField(
        queryset=Universite.objects.all(), source='universite', write_only=True
    )
    filiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Filiere.objects.all(), source='filiere', write_only=True
    )
    filiere_nom = serializers.SerializerMethodField()
    filiere_code = serializers.SerializerMethodField()

    def get_filiere_nom(self, obj):
        return obj.filiere.nom if obj.filiere else None

    def get_filiere_code(self, obj):
        return obj.filiere.code if obj.filiere else None

    class Meta:
        model = UniversiteFiliere
        fields = [
            'id', 'universite', 'universite_id', 'filiere_id',
            'filiere_nom', 'filiere_code',
            'annee', 'seuil_minimum', 'seuil_demi_bourse',
            'seuil_bourse', 'places_disponibles'
        ]
        validators = []

    def create(self, validated_data):
        obj, created = UniversiteFiliere.objects.update_or_create(
            universite=validated_data['universite'],
            filiere=validated_data['filiere'],
            annee=validated_data.get('annee', 2024),
            defaults={
                'seuil_minimum': validated_data.get('seuil_minimum', 10),
                'seuil_demi_bourse': validated_data.get('seuil_demi_bourse', 13),
                'seuil_bourse': validated_data.get('seuil_bourse', 16),
                'places_disponibles': validated_data.get('places_disponibles', 0),
            }
        )
        return obj


class FiliereSerializer(serializers.ModelSerializer):
    filiere_matieres = FiliereMatiereSerializer(many=True, read_only=True)
    series_acceptees = SerieBacListSerializer(many=True, read_only=True)
    series_ids = serializers.PrimaryKeyRelatedField(
        queryset=SerieBac.objects.all(), many=True, write_only=True,
        source='series_acceptees', required=False
    )

    class Meta:
        model = Filiere
        fields = [
            'id', 'nom', 'code', 'duree', 'description',
            'debouches', 'filiere_matieres', 'series_acceptees', 'series_ids'
        ]

    def create(self, validated_data):
        series = validated_data.pop('series_acceptees', [])
        filiere = super().create(validated_data)
        filiere.series_acceptees.set(series)
        return filiere

    def update(self, instance, validated_data):
        series = validated_data.pop('series_acceptees', None)
        filiere = super().update(instance, validated_data)
        if series is not None:
            filiere.series_acceptees.set(series)
        return filiere


# --- Suggestion Serializers ---

class SuggestionInputSerializer(serializers.Serializer):
    serie_id = serializers.IntegerField()
    notes = serializers.DictField(child=serializers.FloatField())


class UniversiteResultatSerializer(serializers.Serializer):
    universite_id = serializers.IntegerField()
    universite_nom = serializers.CharField()
    universite_ville = serializers.CharField()
    est_publique = serializers.BooleanField()
    annee = serializers.IntegerField()
    places_disponibles = serializers.IntegerField()
    seuil_minimum = serializers.FloatField()
    seuil_demi_bourse = serializers.FloatField()
    seuil_bourse = serializers.FloatField()
    statut = serializers.CharField()
    pourcentage = serializers.FloatField()


class FiliereResultatSerializer(serializers.Serializer):
    filiere_id = serializers.IntegerField()
    filiere_nom = serializers.CharField()
    filiere_code = serializers.CharField()
    duree = serializers.IntegerField()
    description = serializers.CharField()
    debouches = serializers.CharField()
    moyenne_calculee = serializers.FloatField()
    matieres_utilisees = serializers.ListField(child=serializers.DictField())
    meilleur_pourcentage = serializers.FloatField()
    meilleur_statut = serializers.CharField()
    universites = UniversiteResultatSerializer(many=True)
