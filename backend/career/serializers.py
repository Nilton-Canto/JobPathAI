from rest_framework import serializers
from .models import Skill, CareerPath, CareerStage

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class CareerStageSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = CareerStage
        fields = '__all__'

class CareerPathSerializer(serializers.ModelSerializer):
    stages = CareerStageSerializer(many=True, read_only=True)

    class Meta:
        model = CareerPath
        fields = '__all__'
