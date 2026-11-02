from typing import Dict, Any
from app.config.emission_factors import (
    EMBODIED_CO2_SAVED_KG,
    DEVICE_WEIGHT_KG,
    MATERIAL_RECOVERY_RATE,
    RECYCLING_EMISSION_PENALTY_KG_PER_KG,
    REPAIR_PROCESS_EMISSIONS_KG
)
from app.models.product import Product

class EnvironmentalEngine:
    @staticmethod
    def calculate_impact(product: Product, pathway: str) -> Dict[str, Any]:
        category = product.category.lower() if product.category else "default"
        device_weight = DEVICE_WEIGHT_KG.get(category, DEVICE_WEIGHT_KG["default"])
        embodied_co2 = EMBODIED_CO2_SAVED_KG.get(category, EMBODIED_CO2_SAVED_KG["default"])
        recovery_rate = MATERIAL_RECOVERY_RATE.get(pathway, 0.50)
        
        # Operational emissions penalty for the chosen pathway
        if pathway in ["repair", "refurbish"]:
            process_emissions = REPAIR_PROCESS_EMISSIONS_KG.get(category, REPAIR_PROCESS_EMISSIONS_KG["default"])
            net_co2_saved = max(embodied_co2 - process_emissions, 10.0)
        elif pathway == "resale":
            process_emissions = 1.2  # packaging & minor transport
            net_co2_saved = max(embodied_co2 - process_emissions, 15.0)
        elif pathway == "harvest":
            process_emissions = 4.5
            net_co2_saved = max((embodied_co2 * 0.60) - process_emissions, 8.0)
        else:  # recycle
            process_emissions = device_weight * RECYCLING_EMISSION_PENALTY_KG_PER_KG
            # Avoided virgin material extraction (approx 25% of embodied manufacturing)
            net_co2_saved = max((embodied_co2 * 0.25) - process_emissions, 3.0)

        material_recovered = round(device_weight * recovery_rate, 2)
        waste_diverted = round(device_weight * min(recovery_rate + 0.05, 1.0), 2)
        
        # Environmental circularity score (0 - 100)
        env_score_map = {
            "resale": 96.0,
            "repair": 90.0,
            "refurbish": 84.0,
            "harvest": 72.0,
            "recycle": 56.0
        }
        env_score = env_score_map.get(pathway, 60.0)

        return {
            "pathway": pathway,
            "co2_saved_kg": round(net_co2_saved, 2),
            "material_recovered_kg": material_recovered,
            "waste_diverted_kg": waste_diverted,
            "environmental_score": env_score,
            "assumptions_used": {
                "lca_methodology": "ADEME / ITU-T L.1410",
                "embodied_baseline_kg": embodied_co2,
                "process_emissions_kg": round(process_emissions, 2),
                "device_mass_kg": device_weight,
                "material_recovery_rate": recovery_rate
            }
        }
