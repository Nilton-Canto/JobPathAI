from django.shortcuts import render
from rest_framework import viewsets
from .models import Skill, CareerPath, CareerStage
from .serializers import SkillSerializer, CareerPathSerializer, CareerStageSerializer

# Create your views here.


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class CareerPathViewSet(viewsets.ModelViewSet):
    queryset = CareerPath.objects.all()
    serializer_class = CareerPathSerializer


class CareerStageViewSet(viewsets.ModelViewSet):
    queryset = CareerStage.objects.all()
    serializer_class = CareerStageSerializer
