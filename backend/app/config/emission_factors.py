"""
LCA (Life Cycle Assessment) emission factors for circular economy recovery pathways.
Sources:
- ADEME (French Environment and Energy Management Agency) Electronics LCA
- ITU-T L.1410 Methodology for environmental life cycle assessments of ICT goods
- Fraunhofer IZM Studies on Circular ICT
Covers ALL product categories.
"""

# Embodied carbon saved by extending lifespan (avoiding new manufacturing)
EMBODIED_CO2_SAVED_KG = {
    "laptop": 210.0,
    "smartphone": 65.0,
    "tablet": 110.0,
    "headphone": 25.0,
    "smartwatch": 18.0,
    "camera": 85.0,
    "gaming_console": 180.0,
    "monitor": 250.0,
    "default": 80.0
}

# Average weight of device by category in kg
DEVICE_WEIGHT_KG = {
    "laptop": 2.1,
    "smartphone": 0.22,
    "tablet": 0.55,
    "headphone": 0.30,
    "smartwatch": 0.08,
    "camera": 0.65,
    "gaming_console": 3.5,
    "monitor": 5.0,
    "default": 1.0
}

# Material recovery efficiency by pathway
MATERIAL_RECOVERY_RATE = {
    "resale": 1.0,
    "repair": 0.95,
    "refurbish": 0.90,
    "harvest": 0.70,
    "recycle": 0.55
}

# CO2 emission intensity of recycling processes (per kg processed)
RECYCLING_EMISSION_PENALTY_KG_PER_KG = 1.8

# CO2 emission intensity of repair/refurbishment operations (per device)
REPAIR_PROCESS_EMISSIONS_KG = {
    "laptop": 8.5,
    "smartphone": 3.2,
    "tablet": 5.0,
    "headphone": 1.5,
    "smartwatch": 1.2,
    "camera": 4.5,
    "gaming_console": 10.0,
    "monitor": 12.0,
    "default": 5.0
}
