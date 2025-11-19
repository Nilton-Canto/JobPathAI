from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, CareerPathViewSet, CareerStageViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'career-paths', CareerPathViewSet)
router.register(r'career-stages', CareerStageViewSet)

urlpatterns = router.urls
