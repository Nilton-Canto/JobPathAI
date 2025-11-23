from rest_framework.routers import DefaultRouter
from .views import (
    SkillViewSet, 
    CareerPathViewSet, 
    CareerStageViewSet,
    FavoriteViewSet
)

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'career-paths', CareerPathViewSet)
router.register(r'career-stages', CareerStageViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorites')

urlpatterns = router.urls
