from rest_framework.routers import DefaultRouter
from .views import (
    SkillViewSet,
    AreaViewSet,
    CareerPathViewSet, 
    CareerStageViewSet,
    FavoriteViewSet
)

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'career-paths', CareerPathViewSet)
router.register(r'career-stages', CareerStageViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorites')

urlpatterns = router.urls
