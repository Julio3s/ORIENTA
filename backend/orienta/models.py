from django.db import models


class SerieBac(models.Model):
    code = models.CharField(max_length=10, unique=True)
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Série de Bac"
        verbose_name_plural = "Séries de Bac"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.nom}"


class Matiere(models.Model):
    nom = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"
        ordering = ['nom']

    def __str__(self):
        return f"{self.code} - {self.nom}"


class SerieMatiere(models.Model):
    serie = models.ForeignKey(SerieBac, on_delete=models.CASCADE, related_name='serie_matieres')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='serie_matieres')
    coefficient = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Matière par Série"
        verbose_name_plural = "Matières par Série"
        unique_together = ('serie', 'matiere')

    def __str__(self):
        return f"{self.serie.code} - {self.matiere.nom} (coef {self.coefficient})"


class Universite(models.Model):
    nom = models.CharField(max_length=200)
    ville = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    est_publique = models.BooleanField(default=True)
    site_web = models.URLField(blank=True)

    class Meta:
        verbose_name = "Université"
        verbose_name_plural = "Universités"
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} ({self.ville})"


class Filiere(models.Model):
    nom = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    duree = models.PositiveIntegerField(help_text="Durée en années")
    description = models.TextField(blank=True)
    debouches = models.TextField(blank=True)
    matieres_prioritaires = models.ManyToManyField(
        Matiere, through='FiliereMatiere', related_name='filieres'
    )
    series_acceptees = models.ManyToManyField(
        SerieBac, through='FiliereSerie', related_name='filieres'
    )

    class Meta:
        verbose_name = "Filière"
        verbose_name_plural = "Filières"
        ordering = ['nom']

    def __str__(self):
        return f"{self.code} - {self.nom}"


class FiliereMatiere(models.Model):
    ORDRE_CHOICES = [(1, 'Priorité 1'), (2, 'Priorité 2'), (3, 'Priorité 3')]

    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE, related_name='filiere_matieres')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    ordre = models.IntegerField(choices=ORDRE_CHOICES)

    class Meta:
        verbose_name = "Matière Prioritaire de Filière"
        verbose_name_plural = "Matières Prioritaires de Filière"
        unique_together = ('filiere', 'ordre')
        ordering = ['ordre']

    def __str__(self):
        return f"{self.filiere.code} - {self.matiere.nom} (ordre {self.ordre})"


class FiliereSerie(models.Model):
    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE)
    serie = models.ForeignKey(SerieBac, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Série Acceptée par Filière"
        verbose_name_plural = "Séries Acceptées par Filière"
        unique_together = ('filiere', 'serie')

    def __str__(self):
        return f"{self.filiere.code} - Série {self.serie.code}"


class UniversiteFiliere(models.Model):
    universite = models.ForeignKey(Universite, on_delete=models.CASCADE, related_name='universite_filieres')
    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE, related_name='universite_filieres')
    annee = models.PositiveIntegerField(default=2024)
    seuil_minimum = models.FloatField(help_text="Note minimale pour admission (payant)")
    seuil_demi_bourse = models.FloatField(help_text="Note minimale pour demi-bourse")
    seuil_bourse = models.FloatField(help_text="Note minimale pour bourse complète")
    places_disponibles = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Filière par Université"
        verbose_name_plural = "Filières par Université"
        unique_together = ('universite', 'filiere', 'annee')

    def __str__(self):
        return f"{self.universite.nom} - {self.filiere.code} ({self.annee})"
