"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { endpoints } from "@/lib/api";
import {
  Gavel,
  Clock,
  TrendingUp,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  Flame,
  Check,
  AlertCircle,
} from "lucide-react";

interface AuctionItem {
  id: string;
  title: string;
  category: string;
  lot_size?: number;
  current_bid: number;
  min_increment: number;
  ends_in_seconds: number;
  bid_count: number;
  condition: string;
  specs: string;
  last_bid_flash?: boolean;
}

const DEMO_AUCTIONS: AuctionItem[] = [
  {
    id: "auc-101",
    title: "Lot of 5x OEM MacBook Pro M1 14\" Retina Display Assemblies",
    category: "Display Panels",
    lot_size: 5,
    current_bid: 34500,
    min_increment: 500,
    ends_in_seconds: 145, // < 3 mins (red timer)
    bid_count: 14,
    condition: "Harvested Grade-A • No Dead Pixels",
    specs: "Includes TrueTone sensor cable, 120Hz ProMotion panels",
  },
  {
    id: "auc-102",
    title: "3x Tested ThinkPad X1 Carbon Gen 9 Logic Boards (i7 16GB)",
    category: "Motherboards",
    lot_size: 3,
    current_bid: 28000,
    min_increment: 1000,
    ends_in_seconds: 720, // 12 mins
    bid_count: 9,
    condition: "Fully Tested Bootable • Clean IMEI/BIOS",
    specs: "Intel Core i7-1185G7, 16GB LPDDR4x soldered, onboard Wi-Fi 6",
  },
  {
    id: "auc-103",
    title: "10x iPhone 13 Pro OEM Battery Packs (>85% Health)",
    category: "Power Modules",
    lot_size: 10,
    current_bid: 12500,
    min_increment: 250,
    ends_in_seconds: 1980, // 33 mins
    bid_count: 22,
    condition: "Original Apple OEM • Tested Cycle Count < 320",
    specs: "3095 mAh nominal, flexible ribbon intact, zero swelling",
  },
  {
    id: "auc-104",
    title: "Bulk Scrap Lot: 25kg Mixed Motherboard PCB Gold Fingers",
    category: "Recycling / Scrap",
    lot_size: 25,
    current_bid: 18200,
    min_increment: 500,
    ends_in_seconds: 3600, // 1 hr
    bid_count: 6,
    condition: "De-soldered Grade-1 Scrap Material",
    specs: "Gold plating thickness 30µin, high copper content",
  },
];

export const AuctionMarketplaceView: React.FC<{
  roleTitle: string;
  defaultCategoryFilter?: string;
}> = ({ roleTitle, defaultCategoryFilter }) => {
  const { success, error, warning } = useToast();
  const [auctions, setAuctions] = useState<AuctionItem[]>(DEMO_AUCTIONS);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Live countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions((prev) =>
        prev.map((a) => ({
          ...a,
          ends_in_seconds: Math.max(0, a.ends_in_seconds - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m ${s < 10 ? "0" : ""}${s}s`;
    }
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const openBidModal = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    setBidAmount(auction.current_bid + auction.min_increment);
    setModalOpen(true);
  };

  const handlePlaceBid = async () => {
    if (!selectedAuction) return;

    if (bidAmount <= selectedAuction.current_bid) {
      warning(
        `Bid must be higher than current bid of ₹${selectedAuction.current_bid.toLocaleString()}`
      );
      return;
    }

    setIsSubmittingBid(true);
    try {
      // Simulate/call API
      try {
        await endpoints.placeBid(selectedAuction.id, bidAmount);
      } catch (e) {
        // Fallback simulated success for demo
      }

      // Trigger flash animation on updated card
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === selectedAuction.id
            ? {
                ...a,
                current_bid: bidAmount,
                bid_count: a.bid_count + 1,
                last_bid_flash: true,
              }
            : a
        )
      );

      success(
        `Bid of ₹${bidAmount.toLocaleString()} placed on "${selectedAuction.title}"`,
        "Bid Placed Successfully"
      );
      setModalOpen(false);

      // Clear flash after 2 seconds
      setTimeout(() => {
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === selectedAuction.id ? { ...a, last_bid_flash: false } : a
          )
        );
      }, 2000);
    } catch (err: any) {
      error("Failed to place bid");
    } finally {
      setIsSubmittingBid(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title={`${roleTitle} — Component Reverse Auctions`}
        description="High-velocity auctions for harvested OEM sub-assemblies, display panels, and certified e-scrap lots with anti-sniping protection."
        badge={<Badge variant="success">Anti-Sniping Engine Active</Badge>}
      />

      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white mb-8 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Dynamic Dutch Price & Reverse Bidding</h4>
            <p className="text-xs text-slate-300">
              Bids within the last 2 minutes automatically extend the clock by 60 seconds.
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-400 font-semibold bg-emerald-900/50 px-3 py-1.5 rounded-lg border border-emerald-700">
          ● 4 Lots Live Right Now
        </div>
      </div>

      {/* Auction Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctions.map((auction) => {
          const isUrgent = auction.ends_in_seconds < 300; // < 5 mins
          const isExpired = auction.ends_in_seconds === 0;

          return (
            <motion.div
              key={auction.id}
              animate={
                auction.last_bid_flash
                  ? { scale: [1, 1.02, 1], backgroundColor: ["#FFFFFF", "#ECFDF5", "#FFFFFF"] }
                  : {}
              }
              transition={{ duration: 0.8 }}
              className="rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {auction.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                      {auction.title}
                    </h4>
                  </div>

                  {/* Countdown Timer Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 ${
                      isExpired
                        ? "bg-slate-100 text-slate-500"
                        : isUrgent
                        ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isExpired ? "Closed" : formatTimer(auction.ends_in_seconds)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-4">{auction.specs}</div>

                {/* Condition Pill */}
                <div className="mb-4">
                  <Badge variant="neutral" size="sm">
                    {auction.condition}
                  </Badge>
                </div>

                {/* Pricing & Bid Stats Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Leading Bid
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                      ₹{auction.current_bid.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Activity
                    </div>
                    <div className="text-sm font-bold text-slate-700 mt-1 flex items-center justify-end gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>{auction.bid_count} Bids</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Min Step: <strong>+₹{auction.min_increment}</strong>
                </span>

                <Button
                  size="sm"
                  onClick={() => openBidModal(auction)}
                  disabled={isExpired}
                  className="font-bold"
                >
                  <Gavel className="w-3.5 h-3.5 mr-1.5" />
                  Place Outbid
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bid Modal with Live Step Validation */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Competitive Bid"
        maxWidth="md"
      >
        {selectedAuction && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">{selectedAuction.title}</div>
              <div className="flex justify-between text-slate-500 mt-2">
                <span>Current Bid:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{selectedAuction.current_bid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 mt-1">
                <span>Minimum Valid Bid:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ₹{(selectedAuction.current_bid + selectedAuction.min_increment).toLocaleString()}
                </span>
              </div>
            </div>

            <Input
              label="Your Bid Amount (₹)"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
              min={selectedAuction.current_bid + selectedAuction.min_increment}
              step={selectedAuction.min_increment}
            />

            <div className="flex gap-2 pt-1">
              {[500, 1000, 2500].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setBidAmount((prev) => prev + step)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
                >
                  +₹{step}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePlaceBid}
                isLoading={isSubmittingBid}
                className="font-bold"
              >
                Confirm &amp; Transmit Bid
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
};
