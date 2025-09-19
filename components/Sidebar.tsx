"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { ExternalLink, Menu, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import useStore from "@/lib/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const SETTINGS_KEY = "ai-helper-settings";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setSettings } = useStore();
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [setSettings]);

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("https://openrouter.ai/api/v1/models");
        const freeModels = response.data.data.filter(
          (model: {
            pricing: { prompt: string; completion: string };
            id: string;
          }) => model.pricing.prompt === "0" && model.pricing.completion === "0"
        );
        setAvailableModels(freeModels.map((model: { id: string }) => model.id));
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleClearSettings = () => {
    // Reset settings to default values
    setSettings({
      openrouterKey: "",
      selectedModels: [],
    });

    // Clear from localStorage
    localStorage.removeItem(SETTINGS_KEY);
  };

  return (
    <>
      {/* Toggle button */}
      <Button
        className="fixed top-4 left-4 z-50 border-white/20 bg-white/10 text-white"
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="outline"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/20 supports-[backdrop-filter]:bg-black/10 supports-[backdrop-filter]:backdrop-blur-[4px]"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}

      {/* Sidebar */}
      <motion.div
        animate={{ x: isOpen ? 0 : "-100%" }}
        className="fixed top-0 left-0 z-[101] flex h-full w-80 flex-col border-white/[0.08] border-r bg-black/20 p-6 supports-[backdrop-filter]:bg-black/10 supports-[backdrop-filter]:backdrop-blur-lg"
        initial={{ x: "-100%" }}
        style={{
          willChange: "transform",
          translateZ: 0,
          backfaceVisibility: "hidden",
        }}
        transition={{
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1],
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-semibold text-white text-xl">Settings</h2>
          <Button
            className="h-8 w-8 rounded-lg p-0.5 text-white"
            onClick={() => setIsOpen(false)}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto">
          {/* API Keys Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">API Keys</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70" htmlFor="openrouter">
                    OpenRouter API Key
                  </Label>
                  <Link
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary text-xs transition-colors hover:bg-primary/20"
                    href="https://openrouter.ai/keys"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Obtain the key
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <Input
                  className="border-white/10 bg-white/5 focus:border-white/20"
                  id="openrouter"
                  onChange={(e) => {
                    setSettings({ ...settings, openrouterKey: e.target.value });
                  }}
                  placeholder="Enter your OpenRouter API key"
                  type="password"
                  value={settings.openrouterKey}
                />
              </div>
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">Selected Models</h3>
            <Input
              className="mb-4 border-white/10 bg-white/5 focus:border-white/20"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models..."
              value={searchTerm}
            />
            <div className="scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-white/10 max-h-[200px] space-y-2 overflow-y-auto pr-2 content-visibility-auto">
              {loading ? (
                <p className="text-white/70">Loading models...</p>
              ) : error ? (
                <p className="text-destructive">Error: {error}</p>
              ) : (
                availableModels
                  .filter((model) =>
                    model.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .sort((a, b) => {
                    // Sort by selected status first (selected models come first)
                    const aSelected = settings.selectedModels.includes(a);
                    const bSelected = settings.selectedModels.includes(b);

                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;

                    // If both have the same selected status, sort alphabetically
                    return a.localeCompare(b);
                  })
                  .map((model) => (
                    <div
                      className={`group relative flex items-center rounded-lg border ${
                        settings.selectedModels.includes(model)
                          ? "border-primary/30 bg-primary/10"
                          : "border-white/10 bg-white/5"
                      } p-3`}
                      key={model}
                    >
                      <div className="flex w-full min-w-0 items-center">
                        <input
                          checked={settings.selectedModels.includes(model)}
                          className="mr-3 h-4 w-4 accent-primary"
                          id={model}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                selectedModels: [
                                  ...settings.selectedModels,
                                  model,
                                ],
                              });
                            } else {
                              setSettings({
                                ...settings,
                                selectedModels: settings.selectedModels.filter(
                                  (m) => m !== model
                                ),
                              });
                            }
                          }}
                          type="checkbox"
                        />
                        <label
                          className="cursor-pointer truncate text-sm text-white/80"
                          htmlFor={model}
                        >
                          {model}
                        </label>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Clear settings button */}
        <div className="mt-6 border-white/10 border-t pt-4">
          <Button
            className="h-10 w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleClearSettings}
            variant="outline"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Settings
          </Button>
        </div>
      </motion.div>
    </>
  );
}
