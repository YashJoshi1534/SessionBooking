from django.db import models
from django.conf import settings

class Session(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.ImageField(upload_to='sessions/', null=True, blank=True)
    date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    available_spots = models.IntegerField(default=10)

    def __str__(self):
        return self.title
