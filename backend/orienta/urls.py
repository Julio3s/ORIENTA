from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'series', views.SerieBacViewSet, basename='serie')
router.register(r'matieres', views.MatiereViewSet, basename='matiere')
router.register(r'universites', views.UniversiteViewSet, basename='universite')
router.register(r'filieres', views.FiliereViewSet, basename='filiere')
router.register(r'universites-filieres', views.UniversiteFiliereViewSet, basename='universite-filiere')
router.register(r'filieres-matieres', views.FiliereMatiereViewSet, basename='filiere-matiere')
router.register(r'series-matieres', views.SerieMatiereViewSet, basename='serie-matiere')

urlpatterns = [
    path('', include(router.urls)),
    path('suggerer/', views.suggerer, name='suggerer'),
]
