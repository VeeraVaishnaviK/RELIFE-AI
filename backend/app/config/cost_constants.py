"""
Cost calculation constants and rule parameters for ReLife AI 5-pathway recovery engine.
All costs expressed in currency units (INR).
Covers ALL product categories: laptop, smartphone, tablet, headphone, smartwatch, camera, gaming_console, monitor
"""

# Base logistics and handling per category
BASE_LOGISTICS_COST = {
    "laptop": 350.0,
    "smartphone": 180.0,
    "tablet": 220.0,
    "clothes": 90.0,
    "footwear": 130.0,
    "home_appliances": 380.0,
    "headphone": 120.0,
    "audio": 120.0,
    "smartwatch": 100.0,
    "camera": 250.0,
    "gaming_console": 400.0,
    "monitor": 450.0,
    "default": 200.0
}

# Inspection and diagnostic base fee
INSPECTION_BASE_FEE = 150.0

# Cleaning, sanitization, and packaging cost
CLEANING_PACKAGING_COST = {
    "laptop": 400.0,
    "smartphone": 250.0,
    "tablet": 280.0,
    "clothes": 120.0,
    "footwear": 150.0,
    "home_appliances": 320.0,
    "headphone": 150.0,
    "smartwatch": 180.0,
    "camera": 320.0,
    "gaming_console": 350.0,
    "monitor": 380.0,
    "default": 250.0
}

# Defect repair cost lookup (parts + labor estimate)
DEFECT_REPAIR_COSTS = {
    "display_crack": {
        "laptop": 3500.0,
        "smartphone": 2200.0,
        "tablet": 2800.0,
        "monitor": 4500.0,
        "camera": 2000.0,
        "gaming_console": 1800.0,
        "headphone": 800.0,
        "smartwatch": 1500.0,
        "default": 2000.0
    },
    "crack": {
        "laptop": 3500.0,
        "smartphone": 2200.0,
        "tablet": 2800.0,
        "monitor": 4500.0,
        "camera": 2000.0,
        "gaming_console": 1800.0,
        "headphone": 800.0,
        "smartwatch": 1500.0,
        "default": 2000.0
    },
    "scratch": {
        "laptop": 600.0,
        "smartphone": 400.0,
        "tablet": 500.0,
        "monitor": 700.0,
        "camera": 450.0,
        "gaming_console": 350.0,
        "headphone": 200.0,
        "smartwatch": 300.0,
        "default": 400.0
    },
    "dent": {
        "laptop": 1200.0,
        "smartphone": 800.0,
        "tablet": 900.0,
        "monitor": 1500.0,
        "camera": 1000.0,
        "gaming_console": 900.0,
        "headphone": 400.0,
        "smartwatch": 600.0,
        "default": 800.0
    },
    "missing_component": {
        "laptop": 2500.0,
        "smartphone": 1500.0,
        "tablet": 1800.0,
        "monitor": 2000.0,
        "camera": 2200.0,
        "gaming_console": 2000.0,
        "headphone": 600.0,
        "smartwatch": 1200.0,
        "default": 1800.0
    },
    "deformation": {
        "laptop": 2800.0,
        "smartphone": 1800.0,
        "tablet": 2200.0,
        "monitor": 3000.0,
        "camera": 2500.0,
        "gaming_console": 2200.0,
        "headphone": 700.0,
        "smartwatch": 1400.0,
        "default": 2000.0
    },
    "burn_mark": {
        "laptop": 3200.0,
        "smartphone": 2000.0,
        "tablet": 2500.0,
        "monitor": 4000.0,
        "camera": 2800.0,
        "gaming_console": 2500.0,
        "headphone": 600.0,
        "smartwatch": 1300.0,
        "default": 2200.0
    },
    "corrosion": {
        "laptop": 1800.0,
        "smartphone": 1200.0,
        "tablet": 1400.0,
        "monitor": 2000.0,
        "camera": 1600.0,
        "gaming_console": 1500.0,
        "headphone": 500.0,
        "smartwatch": 800.0,
        "default": 1400.0
    },
    "water_damage": {
        "laptop": 4000.0,
        "smartphone": 2500.0,
        "tablet": 3000.0,
        "monitor": 5000.0,
        "camera": 3500.0,
        "gaming_console": 3000.0,
        "headphone": 800.0,
        "smartwatch": 1800.0,
        "default": 2800.0
    }
}

# Labor cost per repair hour
HOURLY_LABOR_RATE = 450.0

# Disassembly & Harvesting labor cost
HARVESTING_LABOR_COST = {
    "laptop": 500.0,
    "smartphone": 300.0,
    "tablet": 350.0,
    "headphone": 200.0,
    "smartwatch": 250.0,
    "camera": 400.0,
    "gaming_console": 550.0,
    "monitor": 500.0,
    "default": 300.0
}

# E-waste recycling processing fee
RECYCLING_PROCESSING_FEE = {
    "laptop": 300.0,
    "smartphone": 150.0,
    "tablet": 200.0,
    "headphone": 100.0,
    "smartwatch": 120.0,
    "camera": 250.0,
    "gaming_console": 350.0,
    "monitor": 400.0,
    "default": 200.0
}

# Material scrap value recovered through recycling
RECYCLING_MATERIAL_SCRAP_VALUE = {
    "laptop": 450.0,
    "smartphone": 200.0,
    "tablet": 250.0,
    "headphone": 80.0,
    "smartwatch": 150.0,
    "camera": 300.0,
    "gaming_console": 400.0,
    "monitor": 500.0,
    "default": 200.0
}
