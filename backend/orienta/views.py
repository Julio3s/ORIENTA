from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import (
    SerieBac, Matiere, SerieMatiere, Universite,
    Filiere, FiliereMatiere, FiliereSerie, UniversiteFiliere
)
from .serializers import (
    SerieBacSerializer, SerieBacListSerializer,
    MatiereSerializer, SerieMatiereSerializer,
    UniversiteSerializer, FiliereSerializer,
    FiliereMatiereSerializer, UniversiteFiliereSerializer,
    SuggestionInputSerializer
)
from .algo import suggerer_filieres


class SerieBacViewSet(viewsets.ModelViewSet):
    queryset = SerieBac.objects.prefetch_related('serie_matieres__matiere').all()
    serializer_class = SerieBacSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class UniversiteViewSet(viewsets.ModelViewSet):
    queryset = Universite.objects.all()
    serializer_class = UniversiteSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class FiliereViewSet(viewsets.ModelViewSet):
    queryset = Filiere.objects.prefetch_related(
        'filiere_matieres__matiere', 'series_acceptees'
    ).all()
    serializer_class = FiliereSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class UniversiteFiliereViewSet(viewsets.ModelViewSet):
    queryset = UniversiteFiliere.objects.select_related('universite', 'filiere').all()
    serializer_class = UniversiteFiliereSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class FiliereMatiereViewSet(viewsets.ModelViewSet):
    queryset = FiliereMatiere.objects.select_related('filiere', 'matiere').all()
    serializer_class = FiliereMatiereSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class SerieMatiereViewSet(viewsets.ModelViewSet):
    queryset = SerieMatiere.objects.select_related('serie', 'matiere').all()
    serializer_class = SerieMatiereSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


@api_view(['POST'])
@permission_classes([AllowAny])
def suggerer(request):
    serializer = SuggestionInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serie_id = serializer.validated_data['serie_id']
    notes = serializer.validated_data['notes']

    if not SerieBac.objects.filter(id=serie_id).exists():
        return Response(
            {'error': 'Série de bac introuvable'},
            status=status.HTTP_404_NOT_FOUND
        )

    resultats = suggerer_filieres(serie_id, notes)
    return Response({'resultats': resultats, 'total': len(resultats)})
