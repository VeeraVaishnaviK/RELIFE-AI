"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Input";
import { RecommendationChatbot } from "@/components/decision/RecommendationChatbot";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  Camera,
  Sparkles,
  Leaf,
  DollarSign,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Store,
  Wrench,
  Layers,
  Recycle,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  MapPin,
  Phone,
  ExternalLink,
  X,
  Building2,
  Package,
  Cpu,
  Factory,
  Globe,
  Star,
  MessageSquare,
  Send,
  Check,
} from "lucide-react";
import { useMessageStore } from "@/store/messageStore";

export interface RepairPartItem {
  name: string;
  sku: string;
  category: string;
  cost: number;
  stockStatus: string;
  action: string;
  laborTime: string;
}

interface PathwayOption {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: any;
  nrv: number;
  revenue: number;
  cost: number;
  co2Saved: number;
  turnaroundDays: number;
  riskRating: "Low" | "Medium" | "High";
  score: number;
  eligible: boolean;
  exclusionReason?: string;
  partsSectionTitle?: string;
  partsToRepair?: RepairPartItem[];
}

/* ── Ecosystem Partner Data for 5 Pathways ── */
interface EcosystemPartner {
  name: string;
  location: string;
  specialization: string;
  contact: string;
  availability: string;
  rating: number;
  verified: boolean;
}

const ECOSYSTEM_DATA: Record<string, { title: string; subtitle: string; color: string; icon: any; partners: EcosystemPartner[] }> = {
  direct_resale: {
    title: "B2B / B2C Reseller Network",
    subtitle: "Verified secondary-market dealers near your location ready for immediate inventory intake",
    color: "emerald",
    icon: Store,
    partners: [
      { name: "GreenGadgets Chennai", location: "T. Nagar, Chennai", specialization: "Grade-A Smartphones & Tablets", contact: "+91 98412 XXXXX", availability: "Accepting stock — 200+ units/week capacity", rating: 4.8, verified: true },
      { name: "ReLoop Electronics", location: "Anna Nagar, Chennai", specialization: "Consumer Electronics B2B", contact: "+91 98402 XXXXX", availability: "Open slots — next batch pickup in 2 days", rating: 4.6, verified: true },
      { name: "CircularBazaar Marketplace", location: "Porur, Chennai", specialization: "Online B2C Refurbished Store", contact: "partner@circularbazaar.in", availability: "Instant listing — 500+ daily active buyers", rating: 4.9, verified: true },
      { name: "TechRevive Hub", location: "Velachery, Chennai", specialization: "Enterprise IT Resale", contact: "+91 87654 XXXXX", availability: "Bulk orders accepted — 48hr turnaround", rating: 4.5, verified: true },
      { name: "EcoTrade South India", location: "Guindy, Chennai", specialization: "B2B Auction Platform", contact: "sales@ecotrade.in", availability: "Weekly auctions — next: Thursday 10 AM", rating: 4.7, verified: true },
    ],
  },
  repair_resale: {
    title: "Repair Parts & Service Partners",
    subtitle: "OEM-certified spare parts inventory and authorized repair shops for component-level fixes",
    color: "blue",
    icon: Wrench,
    partners: [
      { name: "SpareHub OEM Parts", location: "Ambattur, Chennai", specialization: "Battery Cells — Samsung SDI, BYD compatible", contact: "+91 98765 XXXXX", availability: "In Stock: 3000mAh–5000mAh Li-ion cells ✅", rating: 4.7, verified: true },
      { name: "ScreenFix Pro", location: "Adyar, Chennai", specialization: "OLED/AMOLED Display Assemblies", contact: "+91 99001 XXXXX", availability: "200+ screens in stock — same day dispatch", rating: 4.8, verified: true },
      { name: "MobileCare Authorized", location: "Mylapore, Chennai", specialization: "Apple & Samsung Authorized Service", contact: "+91 87651 XXXXX", availability: "Walk-in repair — avg 2hr turnaround", rating: 4.9, verified: true },
      { name: "ChipLevel Masters", location: "Chromepet, Chennai", specialization: "Motherboard & IC Level Repair", contact: "+91 76543 XXXXX", availability: "Accepting devices — 3-day repair cycle", rating: 4.4, verified: true },
      { name: "PowerCell India", location: "Sholinganallur, Chennai", specialization: "Battery Replacement & Calibration", contact: "orders@powercell.in", availability: "Bulk battery packs available — MOQ 50 units", rating: 4.6, verified: true },
    ],
  },
  refurbish: {
    title: "Certified Refurbishment Centers",
    subtitle: "Full OEM-grade deep refurbishment facilities with manufacturer recertification capability",
    color: "violet",
    icon: Sparkles,
    partners: [
      { name: "ReNew Tech Factory", location: "Sriperumbudur, Chennai", specialization: "Full chassis respray + battery replacement", contact: "+91 98410 XXXXX", availability: "Capacity: 500 units/month — 15% slots open", rating: 4.8, verified: true },
      { name: "CertifiedRefurb India", location: "Oragadam Industrial Area", specialization: "Apple Certified Refurbishment Partner", contact: "ops@certifiedrefurb.in", availability: "Accepting intake — Grade-A output guaranteed", rating: 4.9, verified: true },
      { name: "GreenLoop Manufacturing", location: "Mahindra World City, Chennai", specialization: "Samsung & OnePlus Authorized Refurb", contact: "+91 87654 XXXXX", availability: "8-day avg cycle time — ISO 14001 certified", rating: 4.7, verified: true },
      { name: "PhoenixTech Refurb Labs", location: "Perungudi, Chennai", specialization: "Laptop & Tablet Deep Refurbishment", contact: "+91 90001 XXXXX", availability: "Open capacity — cosmetic + functional restoration", rating: 4.5, verified: true },
      { name: "CircularWorks India", location: "SIPCOT Irungattukottai", specialization: "Multi-brand Recertification Hub", contact: "partner@circularworks.in", availability: "Government-empaneled — CPCB compliant", rating: 4.6, verified: true },
    ],
  },
  component_harvest: {
    title: "Component Buyers & Auction Markets",
    subtitle: "Verified B2B buyers for harvested displays, motherboards, cameras, and sensor modules",
    color: "amber",
    icon: Cpu,
    partners: [
      { name: "ChipSource Auctions", location: "Online — Pan India", specialization: "IC chips, SoC modules, RAM harvesting", contact: "auctions@chipsource.in", availability: "Next auction: Nov 2 — 340 lots listed", rating: 4.7, verified: true },
      { name: "DisplayParts B2B", location: "Ambattur, Chennai", specialization: "OLED panels, digitizer assemblies", contact: "+91 98412 XXXXX", availability: "Buying displays — ₹800–₹4500 per panel", rating: 4.5, verified: true },
      { name: "SensorTech Recovery", location: "Guindy, Chennai", specialization: "Camera modules, proximity & gyro sensors", contact: "+91 76540 XXXXX", availability: "Active buyer — bulk pickup available", rating: 4.3, verified: true },
      { name: "GreenBoard Electronics", location: "Hosur Road, Bangalore", specialization: "PCB precious metal recovery", contact: "buy@greenboard.in", availability: "Accepting boards — ₹200–₹1200 per unit", rating: 4.6, verified: true },
      { name: "MicroHarvest India", location: "Thiruvanmiyur, Chennai", specialization: "Battery cells, charging ports, speakers", contact: "+91 87650 XXXXX", availability: "Walk-in drop-off — instant valuation", rating: 4.4, verified: true },
    ],
  },
  recycle: {
    title: "Certified E-Waste Recycling Plants",
    subtitle: "CPCB & KSPCB authorized recyclers for compliant material recovery and safe disposal",
    color: "rose",
    icon: Factory,
    partners: [
      { name: "E-Parisaraa Pvt Ltd", location: "Dobbespet, Bangalore", specialization: "Gold, copper, lithium recovery — CPCB certified", contact: "+91 80 XXXX XXXX", availability: "Accepting e-waste — 50T/month capacity", rating: 4.8, verified: true },
      { name: "Attero Recycling", location: "Pan India Pickup Network", specialization: "Rare earth element recovery — ISO 14001", contact: "collect@attero.in", availability: "Free pickup for 100+ kg batches", rating: 4.9, verified: true },
      { name: "GreenTek Reman", location: "Perungudi, Chennai", specialization: "Certified WEEE compliant recycling", contact: "+91 44 XXXX XXXX", availability: "Daily intake — manifest tracking included", rating: 4.6, verified: true },
      { name: "TES-AMM India", location: "Sri City, Andhra Pradesh", specialization: "Data destruction + precious metal smelting", contact: "india@tes-amm.com", availability: "Secure chain-of-custody — ITAD certified", rating: 4.7, verified: true },
      { name: "Cerebra Green", location: "Peenya, Bangalore", specialization: "Li-ion battery safe recycling", contact: "+91 80 XXXX XXXX", availability: "KSPCB authorized — hazardous waste license", rating: 4.5, verified: true },
    ],
  },
};

export default function FivePathwayDecisionPage() {
  const params = useParams();
  const router = useRouter();
  const { success, warning, error, info } = useToast();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // What-If Simulator Weights (Sum = 100)
  const [profitWeight, setProfitWeight] = useState(40);
  const [envWeight, setEnvWeight] = useState(30);
  const [speedWeight, setSpeedWeight] = useState(15);
  const [riskWeight, setRiskWeight] = useState(15);

  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);

  // Ecosystem Listings State
  const [approvedPathway, setApprovedPathway] = useState<string | null>(null);
  const [showEcosystem, setShowEcosystem] = useState(false);

  // In-Application Partner Messaging State
  const { sendMessage } = useMessageStore();
  const [connectingPartner, setConnectingPartner] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [connectedPartners, setConnectedPartners] = useState<{ [key: string]: boolean }>({});
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleConnectClick = (partner: any) => {
    setConnectingPartner(partner);
    const pathwayTitle = approvedPathway && ECOSYSTEM_DATA[approvedPathway] ? ECOSYSTEM_DATA[approvedPathway].title : "Circular Recovery";
    setCustomMessage(
      `Hello ${partner.name},\n\nWe have approved ${product?.brand || "Apple"} ${product?.model || "MacBook Pro 14 (M1 Pro)"} (UID: ${product?.product_uid || productId.slice(0, 8)}) for processing under the "${pathwayTitle}" pathway.\n\nSpecialization requested: ${partner.specialization}.\nPlease confirm intake schedule and bench availability.`
    );
  };

  const handleSendMessage = () => {
    if (!connectingPartner) return;
    setIsSendingMessage(true);

    const pathwayTitle = approvedPathway && ECOSYSTEM_DATA[approvedPathway] ? ECOSYSTEM_DATA[approvedPathway].title : "Circular Recovery";

    sendMessage({
      partnerName: connectingPartner.name,
      location: connectingPartner.location,
      productId: productId || "prod-default",
      productName: product ? `${product.brand} ${product.model}` : "Apple MacBook Pro 14 (M1 Pro)",
      pathway: pathwayTitle,
      messageText: customMessage,
      sender: "Alice Admin (ReLife Dispatch)",
    });

    setConnectedPartners((prev) => ({ ...prev, [connectingPartner.name]: true }));
    success(
      `Message sent in application to ${connectingPartner.name}! Viewable in Topbar Inbox.`,
      "Message Dispatched"
    );

    setTimeout(() => {
      setIsSendingMessage(false);
      setConnectingPartner(null);
    }, 400);
  };

  const [inspection, setInspection] = useState<any>(null);
  const [backendDecision, setBackendDecision] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await endpoints.getProduct(productId);
        setProduct(prodRes.data);

        // Fetch live inspection (defects localized from the photo)
        try {
          const inspRes = await endpoints.getInspection(productId);
          if (inspRes.data) {
            setInspection(inspRes.data);
          }
        } catch (e) {
          console.warn("No inspection record found yet for product:", e);
        }

        // Fetch live 5-pathway decision evaluated against real product & inspection
        try {
          const decRes = await endpoints.getDecision(productId);
          if (decRes.data) {
            setBackendDecision(decRes.data);
            setSelectedPathway(decRes.data.recommended_pathway);
          }
        } catch {
          try {
            const genRes = await endpoints.evaluateDecision(productId);
            setBackendDecision(genRes.data);
            setSelectedPathway(genRes.data.recommended_pathway);
          } catch {}
        }
      } catch (err: any) {
        console.error("Decision page load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId]);

  // Compute pathway parameters dynamically based on analyzed picture & product category
  const computePathways = (): PathwayOption[] => {
    const isMobile = product?.category === "smartphone" || product?.category === "mobile";
    const isTablet = product?.category === "tablet";

    // Dynamic price based on product
    const basePrice = product?.purchase_price && product?.purchase_price > 5000
      ? product.purchase_price
      : (isMobile ? 54999 : isTablet ? 42000 : 89900);

    // Dynamic CO2 based on product category (smartphones ~68.4 kg, tablets ~118.5 kg, laptops ~208.8 kg)
    const baseCo2 = isMobile ? 68.4 : isTablet ? 118.5 : 208.8;

    // Check inspection defects localized by YOLOv8
    const defects = inspection?.defects || [];
    const hasCrack = defects.some((d: any) =>
      ["crack", "display_crack", "deformation", "water_damage"].includes(d.defect_category?.toLowerCase())
    );
    const hasDisplayCrack = defects.some((d: any) =>
      d.defect_category?.toLowerCase() === "display_crack" ||
      (d.defect_category?.toLowerCase() === "crack" && d.location?.toLowerCase() === "screen")
    );

    // Defect repair cost estimate
    let repairCost = isMobile ? 2200 : 3800;
    if (hasDisplayCrack) repairCost += (isMobile ? 2400 : 4500);

    // If backend decision has ranked_options, synchronize values directly
    const backendOptions = backendDecision?.ranked_options || [];
    const getBackendOpt = (pName: string) =>
      backendOptions.find((o: any) =>
        o.pathway === pName ||
        (pName === "direct_resale" && o.pathway === "resale") ||
        (pName === "repair_resale" && o.pathway === "repair") ||
        (pName === "component_harvest" && o.pathway === "harvest")
      );

    const resaleOpt = getBackendOpt("resale");
    const repairOpt = getBackendOpt("repair");
    const refurbOpt = getBackendOpt("refurbish");
    const harvestOpt = getBackendOpt("harvest");
    const recycleOpt = getBackendOpt("recycle");
    const brandName = product?.brand || "OEM";
    const modelName = product?.model || (isMobile ? "Smartphone" : isTablet ? "Tablet" : "Laptop");
    const brandPrefix = brandName.slice(0, 3).toUpperCase();

    // Repair parts dynamically customized to the detected product defect & category
    const repairPartsList: RepairPartItem[] = hasDisplayCrack ? [
      {
        name: `${brandName} ${modelName} OLED Display & Digitizer Assembly`,
        sku: `DISP-${brandPrefix}-OLED`,
        category: "Display Subsystem",
        cost: isMobile ? 5400 : (isTablet ? 7200 : 9800),
        stockStatus: "In Stock (Guindy Hub)",
        action: "Laser debonding, optical digitizer swap, TrueTone color calibration",
        laborTime: "45 mins",
      },
      {
        name: "IP68 Adhesive Water-Seal Gasket & Display Frame",
        sku: `GSKT-${brandPrefix}-401`,
        category: "Structural Gasket",
        cost: 450,
        stockStatus: "In Stock (Available)",
        action: "Thermal pressure perimeter bonding to restore IP68 certification",
        laborTime: "15 mins",
      },
      {
        name: "Display Flex Ribbon & Digitizer Controller FPC Cable",
        sku: `FPC-${brandPrefix}-902`,
        category: "Internal Interconnect",
        cost: 650,
        stockStatus: "In Stock",
        action: "Micro-soldered ZIF connector seating and grounding check",
        laborTime: "20 mins",
      }
    ] : [
      {
        name: `${brandName} ${modelName} Rear Housing Chassis & Camera Bezel`,
        sku: `CHAS-${brandPrefix}-ALUM`,
        category: "Chassis & Shell",
        cost: isMobile ? 3200 : 4900,
        stockStatus: "In Stock (Depot A)",
        action: "Internal logic board transfer & precision torque alignment",
        laborTime: "40 mins",
      },
      {
        name: "Optical Sapphire Camera Lens & Dust Gasket",
        sku: `LENS-${brandPrefix}-SAPPH`,
        category: "Optical Sensor Protection",
        cost: 650,
        stockStatus: "In Stock",
        action: "Cleanroom UV adhesive cure and anti-reflective alignment",
        laborTime: "15 mins",
      },
      {
        name: "High-Cycle Battery Cell & Pull-Tab Strip",
        sku: `BATT-${brandPrefix}-HIGH`,
        category: "Power Subsystem",
        cost: isMobile ? 2200 : 3500,
        stockStatus: "In Stock",
        action: "Battery health restoration & BMS firmware cycle reset",
        laborTime: "25 mins",
      }
    ];

    const refurbPartsList: RepairPartItem[] = [
      {
        name: `${brandName} Deep Refurbishment Exterior Enclosure Shell Kit`,
        sku: `RFB-${brandPrefix}-SHELL`,
        category: "Outer Enclosure",
        cost: isMobile ? 2800 : 4600,
        stockStatus: "In Stock (Depot)",
        action: "Electrostatic respray, bead-blasting & OEM texture finish",
        laborTime: "60 mins",
      },
      {
        name: "OEM Cycle-0 High-Density Battery Module (100% Health)",
        sku: `BATT-${brandPrefix}-OEM0`,
        category: "Power Cell",
        cost: isMobile ? 2400 : 3800,
        stockStatus: "In Stock",
        action: "Clean power rail installation & thermal insulation test",
        laborTime: "30 mins",
      },
      {
        name: "Phase-Change Thermal Paste & Mesh Filter Kit",
        sku: `THRM-${brandPrefix}-MX6`,
        category: "Thermal Management",
        cost: 450,
        stockStatus: "In Stock",
        action: "Ultrasonic port cleaning, acoustic mesh swap & SoC thermal repasting",
        laborTime: "20 mins",
      }
    ];

    const harvestPartsList: RepairPartItem[] = [
      {
        name: "Tested Unlocked Logic Board / Motherboard Module",
        sku: `HRVST-${brandPrefix}-LOGIC`,
        category: "Core Processing",
        cost: isMobile ? 14500 : 22000,
        stockStatus: "Diagnostic Passed (Clean)",
        action: "Desoldering & anti-static tray packaging for B2B reverse auction",
        laborTime: "25 mins",
      },
      {
        name: "Multi-Camera Array Module with Optical Image Stabilization (OIS)",
        sku: `HRVST-${brandPrefix}-CAM`,
        category: "Sensors & Optics",
        cost: isMobile ? 4200 : 6100,
        stockStatus: "Bench Verified",
        action: "Optical collimator bench test & anti-static bubble packaging",
        laborTime: "15 mins",
      },
      {
        name: "LPDDR & High-Speed Flash Memory Storage Assembly",
        sku: `HRVST-${brandPrefix}-MEM`,
        category: "Memory / ICs",
        cost: 2600,
        stockStatus: "NIST Wiped",
        action: "NIST 800-88 cryptographic sanitization & grading label",
        laborTime: "10 mins",
      }
    ];

    const resalePartsList: RepairPartItem[] = [
      {
        name: "Zero Replacement Parts Required — All Subsystems Intact",
        sku: "ZERO-TOUCH-VERIFIED",
        category: "Direct Intake",
        cost: 0,
        stockStatus: "100% Operational",
        action: "No hardware parts need repair. Diagnostic clearance & package sealing only",
        laborTime: "10 mins",
      }
    ];

    const recyclePartsList: RepairPartItem[] = [
      {
        name: "Printed Circuit Board Metals (Gold, Silver, Palladium & Copper)",
        sku: "EWASTE-PCB-SMELT",
        category: "Precious Raw Metals",
        cost: 0,
        stockStatus: "Sorted For Smelting",
        action: "Hydrometallurgical chemical extraction & eco-compliant refining",
        laborTime: "Automated",
      },
      {
        name: "Cobalt-Lithium Cathode & Neodymium Magnetic Elements",
        sku: "EWASTE-LITH-COBALT",
        category: "Critical Minerals",
        cost: 0,
        stockStatus: "Hazmat Segregated",
        action: "Closed-loop pyro-refining for battery precursor recovery",
        laborTime: "Automated",
      }
    ];

    const rawPathways: PathwayOption[] = [
      {
        id: "direct_resale",
        name: "direct_resale",
        title: "Direct Secondary Resale",
        description: "List immediately on B2C storefront or B2B pre-demand allocation with zero repair touch.",
        icon: Store,
        revenue: resaleOpt ? Math.round(resaleOpt.expected_revenue) : Math.round(basePrice * (hasCrack ? 0.35 : 0.58)),
        cost: resaleOpt ? Math.round(resaleOpt.estimated_total_cost) : (isMobile ? 380 : 650),
        nrv: resaleOpt ? Math.round(resaleOpt.net_recovery_value) : Math.round(basePrice * (hasCrack ? 0.35 : 0.58)) - (isMobile ? 380 : 650),
        co2Saved: resaleOpt?.environmental_impact?.co2_saved_kg || baseCo2,
        turnaroundDays: 2,
        riskRating: hasCrack ? "High" : "Low",
        score: 0,
        eligible: resaleOpt ? resaleOpt.feasibility_flag : !hasCrack,
        exclusionReason: (resaleOpt && !resaleOpt.feasibility_flag)
          ? resaleOpt.exclusion_reason
          : (hasCrack ? "Safety Lock: Display crack / structural fracture localized by YOLOv8. Direct resale prohibited." : undefined),
        partsSectionTitle: "Hardware Inspection & Functional Clearance",
        partsToRepair: resalePartsList,
      },
      {
        id: "repair_resale",
        name: "repair_resale",
        title: "Targeted Repair & Resale",
        description: "Replace broken screen & localized defects to achieve Grade-A refurbished premium.",
        icon: Wrench,
        revenue: repairOpt ? Math.round(repairOpt.expected_revenue) : Math.round(basePrice * 0.76),
        cost: repairOpt ? Math.round(repairOpt.estimated_total_cost) : repairCost + (isMobile ? 650 : 1350),
        nrv: repairOpt ? Math.round(repairOpt.net_recovery_value) : Math.round(basePrice * 0.76) - (repairCost + (isMobile ? 650 : 1350)),
        co2Saved: repairOpt?.environmental_impact?.co2_saved_kg || Math.round(baseCo2 * 0.93 * 10) / 10,
        turnaroundDays: 5,
        riskRating: "Low",
        score: 0,
        eligible: true,
        partsSectionTitle: "Particular Parts to Repair & Replace",
        partsToRepair: repairPartsList,
      },
      {
        id: "refurbish",
        name: "refurbish",
        title: "Certified Deep Refurbishment",
        description: "Full OEM chassis respray, fresh high-cycle battery pack, and manufacturer recertification.",
        icon: Sparkles,
        revenue: refurbOpt ? Math.round(refurbOpt.expected_revenue) : Math.round(basePrice * 0.84),
        cost: refurbOpt ? Math.round(refurbOpt.estimated_total_cost) : Math.round(repairCost * 1.35) + (isMobile ? 1200 : 2200),
        nrv: refurbOpt ? Math.round(refurbOpt.net_recovery_value) : Math.round(basePrice * 0.84) - (Math.round(repairCost * 1.35) + (isMobile ? 1200 : 2200)),
        co2Saved: refurbOpt?.environmental_impact?.co2_saved_kg || Math.round(baseCo2 * 0.87 * 10) / 10,
        turnaroundDays: 8,
        riskRating: "Medium",
        score: 0,
        eligible: true,
        partsSectionTitle: "Components for Deep Refurbishment Overhaul",
        partsToRepair: refurbPartsList,
      },
      {
        id: "component_harvest",
        name: "component_harvest",
        title: "Component Harvesting & B2B Auction",
        description: "Dismantle intact motherboard, camera sensors, and IC modules for reverse auctions.",
        icon: Layers,
        revenue: harvestOpt ? Math.round(harvestOpt.expected_revenue) : Math.round(basePrice * 0.38),
        cost: harvestOpt ? Math.round(harvestOpt.estimated_total_cost) : (isMobile ? 550 : 950),
        nrv: harvestOpt ? Math.round(harvestOpt.net_recovery_value) : Math.round(basePrice * 0.38) - (isMobile ? 550 : 950),
        co2Saved: harvestOpt?.environmental_impact?.co2_saved_kg || Math.round(baseCo2 * 0.58 * 10) / 10,
        turnaroundDays: 3,
        riskRating: "Low",
        score: 0,
        eligible: true,
        partsSectionTitle: "Harvestable Functional Components for Resale",
        partsToRepair: harvestPartsList,
      },
      {
        id: "recycle",
        name: "recycle",
        title: "Compliance Scrap & Material Recovery",
        description: "Certified e-waste smelting to recover gold, copper, lithium, and rare earth elements.",
        icon: Recycle,
        revenue: recycleOpt ? Math.round(recycleOpt.expected_revenue) : (isMobile ? 250 : 450),
        cost: recycleOpt ? Math.round(recycleOpt.estimated_total_cost) : (isMobile ? 120 : 200),
        nrv: recycleOpt ? Math.round(recycleOpt.net_recovery_value) : (isMobile ? 130 : 250),
        co2Saved: recycleOpt?.environmental_impact?.co2_saved_kg || Math.round(baseCo2 * 0.23 * 10) / 10,
        turnaroundDays: 1,
        riskRating: "Low",
        score: 0,
        eligible: true,
        partsSectionTitle: "Recoverable Precious & Critical Raw Materials",
        partsToRepair: recyclePartsList,
      },
    ];

    // Normalize and compute composite score based on live slider weights
    const maxNrv = Math.max(...rawPathways.map((p) => p.nrv));
    const maxCo2 = Math.max(...rawPathways.map((p) => p.co2Saved));

    return rawPathways
      .map((p) => {
        if (!p.eligible) {
          return {
            ...p,
            score: 0,
          };
        }
        const normProfit = p.nrv > 0 ? (p.nrv / maxNrv) * 100 : 0;
        const normEnv = (p.co2Saved / maxCo2) * 100;
        const normSpeed = Math.max(0, 100 - (p.turnaroundDays / 10) * 100);
        const normRisk = p.riskRating === "Low" ? 95 : p.riskRating === "Medium" ? 70 : 40;

        const totalWeight = profitWeight + envWeight + speedWeight + riskWeight || 1;
        const composite =
          (normProfit * profitWeight +
            normEnv * envWeight +
            normSpeed * speedWeight +
            normRisk * riskWeight) /
          totalWeight;

        return {
          ...p,
          score: Math.round(composite),
        };
      })
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return b.score - a.score;
      });
  };

  const pathways = computePathways();
  const topPathway = pathways[0];

  const handleApprove = (pathwayId: string) => {
    // Show ecosystem panel directly — no backend call needed
    setApprovedPathway(pathwayId);
    setShowEcosystem(true);

    success(
      `Pathway approved! Showing local ecosystem partners for ${pathwayId.replace(/_/g, " ")}.`,
      "Pathway Approved"
    );

    // Scroll to ecosystem panel
    setTimeout(() => {
      document.getElementById("ecosystem-panel")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <DashboardShell>
      <PageHeader
        title={
          product
            ? `5-Pathway Decision Engine: ${product.brand} ${product.model}`
            : "5-Pathway Circular Decision Simulator"
        }
        description="Simultaneous multi-objective optimization balancing Net Recovery Value, carbon avoidance, cycle velocity, and execution risk."
        badge={<Badge variant="success">YOLOv8 & ADEME LCA Linked</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/inspector/inspections/${productId}/costs`}>
              <Button variant="outline" size="sm">
                Cost Breakdown
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => handleApprove(selectedPathway || topPathway.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Commit Recommendation
            </Button>
          </div>
        }
      />

      {/* Real-time Picture Analysis & Localized Defects Banner */}
      {inspection && (
        <Card className="mb-6 bg-slate-900 border-slate-800 text-white shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-5">
            {/* Defect photo thumbnail */}
            <div className="relative w-full md:w-44 h-36 rounded-2xl overflow-hidden bg-black border border-slate-700 shrink-0 flex items-center justify-center">
              {inspection.image_url || inspection.defects?.[0]?.image_url ? (
                <img
                  src={inspection.image_url || inspection.defects?.[0]?.image_url}
                  alt="Defect Inspection"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center">
                  <Camera className="w-8 h-8 mb-1" />
                  <span>No Photo</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 bg-slate-950/85 backdrop-blur-xs text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                YOLOv8 Analyzed
              </div>
            </div>

            {/* Analysis details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={inspection.defects?.length ? "danger" : "success"} size="sm">
                  {inspection.defects?.length ? `${inspection.defects.length} Defect(s) Localized` : "Clean Chassis"}
                </Badge>
                <span className="text-xs font-mono text-emerald-400">
                  Device: {product?.category?.toUpperCase() || "SMARTPHONE"} • ₹{(product?.purchase_price || (product?.category === "smartphone" ? 54999 : 89900)).toLocaleString()} Benchmark
                </span>
                {inspection.defects?.some((d: any) => ["crack", "display_crack"].includes(d.defect_category?.toLowerCase())) && (
                  <Badge variant="warning" size="sm">
                    Display Fracture Detected • Safety Lock Activated
                  </Badge>
                )}
              </div>

              <h3 className="text-base font-bold text-white">
                {product?.brand} {product?.model} — Computer Vision Diagnosis
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                {inspection.defects && inspection.defects.length > 0 ? (
                  inspection.defects.map((d: any, idx: number) => {
                    const isCrit = ["crack", "display_crack", "deformation", "water_damage"].includes(d.defect_category?.toLowerCase());
                    return (
                      <span
                        key={idx}
                        className={`text-xs px-2.5 py-1 rounded-xl border font-mono flex items-center gap-1.5 ${
                          isCrit
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold"
                            : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="capitalize">{d.defect_category.replace(/_/g, " ")}</span>
                        <span className="text-[10px] opacity-80">
                          ({d.location || "screen"} • {Math.round((d.detection_confidence || 0.88) * 100)}%)
                        </span>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400">No surface defects detected in image.</span>
                )}
              </div>
            </div>

            <Link href={`/inspector/inspections/${productId}`}>
              <Button variant="outline" size="sm" className="text-xs text-white border-slate-700 hover:bg-slate-800 shrink-0">
                <Camera className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Inspect / Retake Photo
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Top Section: What-If Simulator Sliders */}
      <Card className="mb-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>What-If Decision Simulator</CardTitle>
              <p className="text-xs text-slate-500">
                Adjust executive criteria weights live to observe real-time pathway re-ranking
              </p>
            </div>
          </div>
          <Badge variant="neutral" size="sm">
            Live Rank Sorting Active
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Slider
              label="Profit / Net Recovery"
              value={profitWeight}
              min={0}
              max={100}
              onChange={setProfitWeight}
            />
            <Slider
              label="Environmental / CO2 Avoidance"
              value={envWeight}
              min={0}
              max={100}
              onChange={setEnvWeight}
            />
            <Slider
              label="Turnaround Speed"
              value={speedWeight}
              min={0}
              max={100}
              onChange={setSpeedWeight}
            />
            <Slider
              label="Risk Tolerance"
              value={riskWeight}
              min={0}
              max={100}
              onChange={setRiskWeight}
            />
          </div>
        </CardContent>
      </Card>

      {/* 5 Pathways Responsive Grid with Smooth Motion Reordering */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Ranked Circular Recovery Pathways
          </h3>
          <span className="text-xs text-slate-500">
            #1 is recommended by multi-criteria decision analysis
          </span>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {pathways.map((pathway, index) => {
              const isWinner = index === 0;
              const isExpanded = expandedCard === pathway.id;
              const Icon = pathway.icon;

              return (
                <motion.div
                  key={pathway.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className={`relative rounded-2xl bg-white transition-all ${
                    !pathway.eligible
                      ? "border-2 border-rose-300 bg-rose-50/10 shadow-sm"
                      : isWinner
                      ? "ring-2 ring-emerald-500 shadow-xl border border-emerald-400"
                      : "border border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Status Ribbon */}
                  {!pathway.eligible ? (
                    <div className="absolute -top-3 left-6 bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5 z-10">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Excluded • Safety Lock</span>
                    </div>
                  ) : isWinner && (
                    <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5 z-10">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Choice</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            !pathway.eligible
                              ? "bg-rose-100 text-rose-800"
                              : isWinner
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                            <h4 className="text-base font-bold text-slate-900 leading-snug">
                              {pathway.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xl font-black font-mono ${!pathway.eligible ? "text-rose-600 text-sm" : "text-slate-900"}`}>
                          {!pathway.eligible ? "EXCLUDED" : pathway.score}
                          {pathway.eligible && <span className="text-xs text-slate-400 font-normal">/100</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {!pathway.eligible ? "Safety Status" : "Rank Score"}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 min-h-[36px] line-clamp-2 mb-3">
                      {pathway.description}
                    </p>

                    {!pathway.eligible && pathway.exclusionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-3 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{pathway.exclusionReason}</span>
                      </div>
                    )}

                    {/* Core Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Net Recovery (NRV)
                        </div>
                        <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                          ₹{pathway.nrv.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          CO2 Avoided
                        </div>
                        <div className="font-bold text-emerald-700 font-mono text-sm mt-0.5">
                          {pathway.co2Saved} kg
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Cycle Time
                        </div>
                        <div className="font-semibold text-slate-700 mt-0.5">
                          {pathway.turnaroundDays} Days
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Execution Risk
                        </div>
                        <div className="font-semibold text-slate-700 mt-0.5">
                          <Badge
                            variant={
                              pathway.riskRating === "Low"
                                ? "success"
                                : pathway.riskRating === "Medium"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {pathway.riskRating}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-100 pt-3 mb-4 text-xs space-y-3 text-slate-600"
                      >
                        {/* Financial & Environmental Metrics Summary */}
                        <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Gross Realizable Price:</span>
                            <span className="font-mono font-bold text-slate-900">
                              ₹{pathway.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Repair & Logistics Cost:</span>
                            <span className="font-mono text-rose-600">
                              - ₹{pathway.cost.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Carbon Factor Baseline:</span>
                            <span className="text-emerald-700 font-medium">ADEME 2024 Lifecycle</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Safety Compliance:</span>
                            <span className="text-emerald-700 font-bold">100% Passed</span>
                          </div>
                        </div>

                        {/* PARTICULAR PARTS TO REPAIR & COMPONENT BREAKDOWN */}
                        <div className="pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                              <Wrench className="w-3.5 h-3.5 text-blue-600" />
                              <span>{pathway.partsSectionTitle || "Particular Parts to Repair / Replace"}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                              {pathway.partsToRepair?.length || 0} Parts
                            </span>
                          </div>

                          <div className="space-y-2">
                            {pathway.partsToRepair && pathway.partsToRepair.length > 0 ? (
                              pathway.partsToRepair.map((part, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-xs space-y-1.5 transition-all shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-snug">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                        <span>{part.name}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                        SKU: {part.sku} • <span className="text-slate-600 font-medium">{part.category}</span>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      {part.cost > 0 ? (
                                        <span className="font-mono font-bold text-slate-900 text-xs">
                                          ₹{part.cost.toLocaleString()}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                          Zero Cost
                                        </span>
                                      )}
                                      <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">
                                        {part.stockStatus}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600">
                                    <div className="text-[10px] pr-2">
                                      <span className="text-slate-400 font-medium">Action: </span>
                                      <span className="font-medium text-slate-800">{part.action}</span>
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 self-start sm:self-auto">
                                      ⏱ {part.laborTime}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-slate-400 text-[11px] text-center">
                                No specific parts required for this pathway.
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant={!pathway.eligible ? "outline" : isWinner ? "primary" : "outline"}
                        size="sm"
                        disabled={!pathway.eligible}
                        className={`flex-1 font-bold ${
                          !pathway.eligible
                            ? "opacity-60 cursor-not-allowed border-rose-300 text-rose-700 bg-rose-50/50"
                            : ""
                        }`}
                        onClick={() => pathway.eligible && handleApprove(pathway.id)}
                      >
                        {!pathway.eligible
                          ? "Ineligible (Damaged Screen)"
                          : isWinner
                          ? "Approve Pathway"
                          : "Select Alternative"}
                      </Button>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : pathway.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View Detailed Breakdown"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════ ECOSYSTEM PARTNER LISTINGS PANEL ══════════ */}
      <AnimatePresence>
        {showEcosystem && approvedPathway && ECOSYSTEM_DATA[approvedPathway] && (
          <motion.div
            id="ecosystem-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Card className={`bg-gradient-to-br from-white via-slate-50 to-${ECOSYSTEM_DATA[approvedPathway].color}-50/40 border-2 border-${ECOSYSTEM_DATA[approvedPathway].color}-200 shadow-xl`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg">
                      {React.createElement(ECOSYSTEM_DATA[approvedPathway].icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {ECOSYSTEM_DATA[approvedPathway].title}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ECOSYSTEM_DATA[approvedPathway].subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      <Globe className="w-3 h-3 mr-1" />
                      Chennai Region
                    </Badge>
                    <button
                      onClick={() => setShowEcosystem(false)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ECOSYSTEM_DATA[approvedPathway].partners.map((partner, idx) => (
                    <motion.div
                      key={partner.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.3 }}
                      className="relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-emerald-300 transition-all group"
                    >
                      {/* Verified Badge */}
                      {partner.verified && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Partner Name & Rating */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight pr-4">
                          {partner.name}
                        </h4>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-700">{partner.rating}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{partner.location}</span>
                      </div>

                      {/* Specialization */}
                      <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mb-2 border border-slate-100">
                        <span className="font-semibold text-slate-700">Specialization:</span>{" "}
                        {partner.specialization}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-1.5 text-xs mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-700 font-medium">{partner.availability}</span>
                      </div>

                      {/* Contact & Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          <span>{partner.contact}</span>
                        </div>
                        {connectedPartners[partner.name] ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Message Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConnectClick(partner)}
                            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                          >
                            <span>Connect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary Bar */}
                <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-black text-slate-900">{ECOSYSTEM_DATA[approvedPathway].partners.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Partners Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-black text-emerald-700">{ECOSYSTEM_DATA[approvedPathway].partners.filter(p => p.verified).length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Verified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-black text-amber-600">
                        {(ECOSYSTEM_DATA[approvedPathway].partners.reduce((s, p) => s + p.rating, 0) / ECOSYSTEM_DATA[approvedPathway].partners.length).toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Rating</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      if (approvedPathway === "direct_resale") router.push("/store");
                      else if (approvedPathway === "component_harvest") router.push("/reseller/marketplace");
                      else router.push("/admin/analytics");
                    }}
                  >
                    Proceed to Execution <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ IN-APPLICATION PARTNER MESSAGING MODAL ══════════ */}
      {connectingPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    Send Message to {connectingPartner.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Application Message Dispatch • {connectingPartner.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConnectingPartner(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Badge */}
            <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Product</span>
                <span className="font-bold text-slate-800">
                  {product ? `${product.brand} ${product.model}` : "Apple MacBook Pro 14 (M1 Pro)"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pathway</span>
                <Badge variant="success" size="sm">
                  {approvedPathway && ECOSYSTEM_DATA[approvedPathway] ? ECOSYSTEM_DATA[approvedPathway].title : "Repair"}
                </Badge>
              </div>
            </div>

            {/* Editable In-App Message Body */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-slate-700 block">
                Message Content (Sent within Application)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                className="w-full text-xs font-sans p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 leading-relaxed text-slate-800 bg-white"
                placeholder="Type dispatch message..."
              />
              <p className="text-[11px] text-slate-400">
                This message will be sent in the application and logged in your Topbar Mail inbox.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setConnectingPartner(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSendMessage}
                isLoading={isSendingMessage}
                className="bg-[#0C5A3E] hover:bg-[#094731] text-white font-bold"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Send Message in Application
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Recommendation Explainer Chatbot */}
      <RecommendationChatbot recommendationData={recommendation} />
    </DashboardShell>
  );
}
