from fastapi import APIRouter

from .costs import router as costs_router
from .payments import router as payments_router
from .my_finances import router as my_finances_router
from .circularization import router as circularization_router

router = APIRouter()
router.include_router(costs_router)
router.include_router(payments_router)
router.include_router(my_finances_router)
router.include_router(circularization_router)
