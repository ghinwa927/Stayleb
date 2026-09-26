from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum
from app.models.rule import RuleCategory

# Used when admin creates a rule
class RuleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(None, max_length=255)
    category: RuleCategory


# Used when admin updates a rule
class RuleUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = Field(None, max_length=255)
    category: RuleCategory | None = None
    is_active: bool | None = None


# Used when returning a rule
class RuleResponse(BaseModel):
    id: int
    name: str
    description: str | None
    category: RuleCategory
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# Used inside property create/update
class PropertyRuleCreate(BaseModel):
    rule_id: int = Field(..., gt=0)
    allowed: bool
    value: str | None = Field(None, max_length=100)


# Used when returning property rules
class PropertyRuleResponse(BaseModel):
    id: int
    rule_id: int
    allowed: bool
    value: str | None

    model_config = ConfigDict(from_attributes=True)
    