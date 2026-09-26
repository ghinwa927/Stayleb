from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class RuleInfoResponse(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = ConfigDict(from_attributes=True)


class PropertyRuleCreate(BaseModel):
    rule_id: int = Field(..., gt=0)
    allowed: bool
    value: str | None = Field(None, max_length=100)


class PropertyRuleResponse(BaseModel):
    id: int
    property_id: int
    rule_id: int
    allowed: bool
    value: str | None
    created_at: datetime
    updated_at: datetime

    rule: RuleInfoResponse

    model_config = ConfigDict(from_attributes=True)