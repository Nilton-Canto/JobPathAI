from rest_framework import serializers
from .models import Skill, Area, CareerPath, CareerStage, UserCareerPath, UserStageProgress, Favorite


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class AreaSerializer(serializers.ModelSerializer):
    path_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'path_count']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_path_count(self, obj):
        """Get count of active career paths in this area"""
        return obj.get_path_count()


class CareerStageSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = CareerStage
        fields = '__all__'


class CareerPathSerializer(serializers.ModelSerializer):
    stages = CareerStageSerializer(many=True, read_only=True)
    # Area as simple representation to avoid circular reference
    area_name = serializers.CharField(source='area.name', read_only=True)
    area_id = serializers.PrimaryKeyRelatedField(queryset=Area.objects.all(), source='area', write_only=True, required=False, allow_null=True)
    # Add computed fields for user context (if user is authenticated)
    is_favorited = serializers.SerializerMethodField()
    is_associated = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = CareerPath
        fields = '__all__'
    
    def get_is_favorited(self, obj):
        """Check if current user has favorited this path"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, career_path=obj).exists()
        return False
    
    def get_is_associated(self, obj):
        """Check if current user is associated with this path"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserCareerPath.objects.filter(user=request.user, career_path=obj, is_active=True).exists()
        return False
    
    def get_progress_percent(self, obj):
        """Get progress percentage for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                user_path = UserCareerPath.objects.get(user=request.user, career_path=obj, is_active=True)
                return user_path.get_progress()
            except UserCareerPath.DoesNotExist:
                return 0
        return 0


class UserCareerPathSerializer(serializers.ModelSerializer):
    """Serializer for user-career path associations"""
    career_path = CareerPathSerializer(read_only=True)
    progress_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = UserCareerPath
        fields = ['id', 'user', 'career_path', 'started_at', 'updated_at', 'is_active', 'progress_percent']
        read_only_fields = ['user', 'started_at', 'updated_at']
    
    def get_progress_percent(self, obj):
        return obj.get_progress()


class UserStageProgressSerializer(serializers.ModelSerializer):
    """Serializer for user stage progress"""
    stage = CareerStageSerializer(read_only=True)
    
    class Meta:
        model = UserStageProgress
        fields = ['id', 'user', 'stage', 'is_completed', 'completed_at', 'started_at']
        read_only_fields = ['user', 'started_at']


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorites"""
    career_path = CareerPathSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'career_path', 'created_at']
        read_only_fields = ['user', 'created_at']
