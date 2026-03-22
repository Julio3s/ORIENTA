from django.contrib import admin
from .models import (
    SerieBac, Matiere, SerieMatiere, Universite,
    Filiere, FiliereMatiere, FiliereSerie, UniversiteFiliere
)


class SerieMatiereInline(admin.TabularInline):
    model = SerieMatiere
    extra = 1


@admin.register(SerieBac)
class SerieBacAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'description']
    search_fields = ['code', 'nom']
    inlines = [SerieMatiereInline]


@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom']
    search_fields = ['code', 'nom']


class FiliereMatiereInline(admin.TabularInline):
    model = FiliereMatiere
    extra = 1
    max_num = 3


class FilierSerieInline(admin.TabularInline):
    model = FiliereSerie
    extra = 1


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'duree']
    search_fields = ['code', 'nom']
    inlines = [FiliereMatiereInline, FilierSerieInline]


@admin.register(Universite)
class UniversiteAdmin(admin.ModelAdmin):
    list_display = ['nom', 'ville', 'est_publique']
    list_filter = ['est_publique', 'ville']
    search_fields = ['nom', 'ville']


@admin.register(UniversiteFiliere)
class UniversiteFiliereAdmin(admin.ModelAdmin):
    list_display = ['universite', 'filiere', 'annee', 'seuil_minimum', 'seuil_demi_bourse', 'seuil_bourse']
    list_filter = ['annee', 'universite', 'filiere']
    search_fields = ['universite__nom', 'filiere__nom']


@admin.register(SerieMatiere)
class SerieMatiereAdmin(admin.ModelAdmin):
    list_display = ['serie', 'matiere', 'coefficient']
    list_filter = ['serie']


@admin.register(FiliereMatiere)
class FiliereMatiereAdmin(admin.ModelAdmin):
    list_display = ['filiere', 'matiere', 'ordre']
    list_filter = ['filiere']
