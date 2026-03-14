from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'avatar_url')
        read_only_fields = ('email', 'avatar_url')
        extra_kwargs = {
            'avatar': {'write_only': True, 'required': False},
        }

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        url = obj.avatar.url

        # Rewrite MinIO direct URLs to go through nginx proxy
        if 'localhost:9000' in url or 'minio:9000' in url:
            for host in ['localhost:9000', 'minio:9000']:
                if host in url:
                    parts = url.split(host)
                    if len(parts) > 1:
                        path = parts[1]
                        url = f'http://localhost/storage{path}'
                        break
        elif not url.startswith('http'):
            url = f'http://localhost/storage/{url.lstrip("/")}'

        return url
