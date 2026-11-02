import re
from typing import Dict, Any, List

DEFECT_KEYWORDS = {
    "crack": ["crack", "cracked", "fracture", "fractured", "shattered", "shattered screen", "glass crack", "fissure", "broken glass"],
    "scratch": ["scratch", "scratched", "scuff", "scuffed", "abrasion", "hairline scratch", "scrapes"],
    "dent": ["dent", "dented", "ding", "depression", "indentation", "pitted"],
    "missing_component": ["missing", "missing key", "missing battery", "missing ram", "no charger", "lost", "detached", "empty slot"],
    "deformation": ["bent", "bend", "warped", "deformation", "deformed", "crooked", "misaligned hinge", "twisted"]
}

LOCATION_KEYWORDS = {
    "screen": ["screen", "display", "glass", "touchscreen", "panel", "monitor"],
    "casing": ["casing", "chassis", "lid", "body", "cover", "back cover", "rear cover", "shell"],
    "keyboard": ["keyboard", "keys", "keypad", "spacebar", "key"],
    "hinge": ["hinge", "pivot", "joint"],
    "edge": ["edge", "corner", "border", "bezel", "side", "frame"],
    "port": ["port", "usb", "hdmi", "charging port", "headphone jack"]
}

SEVERITY_KEYWORDS = {
    "high": ["severe", "deep", "major", "heavy", "huge", "critical", "shattered", "large", "bad", "completely"],
    "low": ["minor", "slight", "small", "tiny", "light", "hairline", "micro", "faint", "cosmetic", "shallow"],
    "medium": ["moderate", "medium", "noticeable", "visible", "average"]
}

class VoiceParser:
    @staticmethod
    def parse_transcript(transcript: str) -> Dict[str, Any]:
        """
        Extracts structured defect data from raw spoken voice inspection transcripts.
        Returns DefectItem-compliant dict structure.
        """
        lower_text = transcript.lower()
        extracted_defects: List[Dict[str, Any]] = []

        # Split into sentences or clauses
        clauses = re.split(r"[.,;]|\band\b|\balso\b", lower_text)
        
        for clause in clauses:
            clause = clause.strip()
            if not clause:
                continue

            # 1. Identify defect category
            found_category = None
            for cat, keywords in DEFECT_KEYWORDS.items():
                if any(kw in clause for kw in keywords):
                    found_category = cat
                    break
                    
            if not found_category:
                continue

            # 2. Identify anatomical location
            found_location = "casing"
            for loc, keywords in LOCATION_KEYWORDS.items():
                if any(kw in clause for kw in keywords):
                    found_location = loc
                    break

            # 3. Identify severity estimate
            found_severity = "medium"
            for sev, keywords in SEVERITY_KEYWORDS.items():
                if any(kw in clause for kw in keywords):
                    found_severity = sev
                    break

            # Default coordinates proxy based on location
            coords = [0.25, 0.30, 0.70, 0.65]
            if found_location == "screen":
                coords = [0.15, 0.15, 0.85, 0.75]
            elif found_location == "edge":
                coords = [0.80, 0.10, 0.95, 0.35]
            elif found_location == "keyboard":
                coords = [0.20, 0.50, 0.80, 0.80]

            extracted_defects.append({
                "defect_category": found_category,
                "location": found_location,
                "severity_estimate": found_severity,
                "detection_confidence": 0.92,
                "bounding_box": coords,
                "image_url": None,
                "source_phrase": clause
            })

        # Fallback if no defect matched
        if not extracted_defects:
            extracted_defects.append({
                "defect_category": "scratch",
                "location": "casing",
                "severity_estimate": "low",
                "detection_confidence": 0.80,
                "bounding_box": [0.3, 0.3, 0.6, 0.6],
                "image_url": None,
                "source_phrase": transcript
            })

        return {
            "raw_transcript": transcript,
            "detected_defect_count": len(extracted_defects),
            "defects": extracted_defects,
            "overall_condition_summary": f"Voice log parsed: {len(extracted_defects)} defects identified ({', '.join(d['defect_category'] for d in extracted_defects)})."
        }
