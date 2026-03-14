from rest_framework import serializers
from .models import Session
from users.serializers import UserSerializer

class SessionSerializer(serializers.ModelSerializer):
    creator_details = UserSerializer(source='creator', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ('creator',)
        extra_kwargs = {
            'image': {'write_only': True, 'required': False},
        }

    def get_image_url(self, obj):
        if not obj.image:
            return None
        url = obj.image.url

        # Rewrite MinIO direct URLs to go through nginx proxy
        # MinIO URL pattern: http(s)://localhost:9000/bucket/key
        # Proxied URL pattern: http://localhost/storage/bucket/key
        if 'localhost:9000' in url or 'minio:9000' in url:
            # Extract everything after :9000
            for host in ['localhost:9000', 'minio:9000']:
                if host in url:
                    parts = url.split(host)
                    if len(parts) > 1:
                        path = parts[1]  # e.g. /sessions/sessions/thumbnail.jpg
                        url = f'http://localhost/storage{path}'
                        break
        elif not url.startswith('http'):
            url = f'http://localhost/storage/{url.lstrip("/")}'

        return url
