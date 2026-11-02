from .user import User
from .product import Product, ReturnInfo, ServiceRecord, HealthCheck
from .inspection import Inspection, DefectItem, VoiceInspectionLog, TrustScore
from .recovery import (
    RecoveryOption,
    CostItem,
    Recommendation,
    RecoveryOutcome,
    EnvironmentalRecord,
    RepairPartnerJob,
)
from .marketplace import MarketData, Component, Buyer, ComponentAuction, AuctionBid
from .operations import Enquiry, Allocation, LeaseAgreement, RoiCalculatorSession

__all__ = [
    "User",
    "Product",
    "ReturnInfo",
    "ServiceRecord",
    "HealthCheck",
    "Inspection",
    "DefectItem",
    "VoiceInspectionLog",
    "TrustScore",
    "RecoveryOption",
    "CostItem",
    "Recommendation",
    "RecoveryOutcome",
    "EnvironmentalRecord",
    "RepairPartnerJob",
    "MarketData",
    "Component",
    "Buyer",
    "ComponentAuction",
    "AuctionBid",
    "Enquiry",
    "Allocation",
    "LeaseAgreement",
    "RoiCalculatorSession",
]

DOCUMENT_MODELS = [
    User,
    Product,
    Inspection,
    VoiceInspectionLog,
    TrustScore,
    RecoveryOption,
    Recommendation,
    RecoveryOutcome,
    EnvironmentalRecord,
    RepairPartnerJob,
    MarketData,
    Component,
    Buyer,
    ComponentAuction,
    Enquiry,
    Allocation,
    LeaseAgreement,
    RoiCalculatorSession,
]
