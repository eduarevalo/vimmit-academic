from domain.shared.baseEntity import BaseEntity
from typing import List, Optional

class RegistrationIntent(BaseEntity):
    """
    Registration Intent Entity.
    Captures user interest from the landing page.
    """
    email: str
    fullName: str
    phone: Optional[str] = None
    interests: List[str] = []
    status: str = "PENDING"  # PENDING, CONVERTED, REJECTED
