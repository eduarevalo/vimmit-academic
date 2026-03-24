from typing import Any
from uuid import UUID

from pydantic import ValidationError, create_model


class TenantSchemaValidator:
    """
    Domain service responsible for validating the dynamic attributes of an entity
    based on the configuration defined for a specific Tenant.
    """

    def __init__(self, tenantSchemas: dict[str, dict[str, Any]]):
        self.tenantSchemas = tenantSchemas

    def validateDynamicAttributes(
        self, tenantId: UUID, entityName: str, attributes: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Validates the arbitrary JSON payload against the tenant's specific schema.
        Returns the validated and casted attributes, or raises ValidationError.
        """
        tenantConfig = self.tenantSchemas.get(str(tenantId), {})

        schemaDef = tenantConfig.get(entityName.lower())

        if not schemaDef:
            return attributes

        modelName = f"{entityName.capitalize()}Schema_{str(tenantId)[:8]}"
        TenantSpecificModel = create_model(modelName, **schemaDef)  # type: ignore

        try:
            validatedModel = TenantSpecificModel(**attributes)
            return validatedModel.model_dump()
        except ValidationError as e:
            raise e
