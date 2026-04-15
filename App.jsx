import { useState, useEffect, useRef } from "react";

// ============================================================
// ANTHROPIC API KONFIGURATION
// ⚠️  SICHERHEITSWARNUNG: Der API-Key sollte in Produktion
//     NIEMALS im Frontend-Code stehen! Nutze stattdessen
//     eine Serverless Function (z.B. Vercel API Routes).
// ============================================================
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const API_KEY = "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";

// ============================================================
// GOOGLE ADSENSE KONFIGURATION
// Sobald dein AdSense-Konto genehmigt ist:
//   1. Ersetze ADSENSE_PUBLISHER_ID mit deiner Publisher-ID
//      (Format: ca-pub-1234567890123456)
//   2. Erstelle Ad Units und trage die Slot-IDs unten ein
//   3. Setze ADSENSE_ENABLED = true
//   4. Aktiviere den Script-Tag in index.html (Kommentar entfernen)
// ============================================================
const ADSENSE_PUBLISHER_ID   = "ca-pub-3063750273798843";
const ADSENSE_SLOT_SIDEBAR   = "0000000001";
const ADSENSE_SLOT_IN_ARTICLE = "0000000002";
const ADSENSE_ENABLED        = true;

const TOPICS = [
  { label: "Investing", emoji: "📈", prompt: "Write an expert blog article about smart investing strategies for 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Crypto", emoji: "₿", prompt: "Write an expert blog article about cryptocurrency trends in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Budgeting", emoji: "💰", prompt: "Write an expert blog article about budgeting and saving money in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Real Estate", emoji: "🏠", prompt: "Write an expert blog article about real estate investment in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Stocks", emoji: "📊", prompt: "Write an expert blog article about stock market strategies for 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Side Income", emoji: "💸", prompt: "Write an expert blog article about building passive and side income in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
];

const FEATURED = [
  { tag: "Investing", title: "How to Build a \$10K Portfolio From Scratch in 2026", desc: "Step-by-step breakdown for beginners entering the market.", time: "5 min read", bg: "#F0FDF4", tagColor: "#16A34A" },
