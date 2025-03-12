"use client";

import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import useStore from "@/lib/store";

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
          (model: any) =>
            model.pricing.prompt === "0" && model.pricing.completion === "0"
        );
        setAvailableModels(freeModels.map((model: any) => model.id));
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 items-center border-white/10 bg-white/10 hover:bg-white/20"
      >
        <Menu className="h-[1.2rem] w-[1.2rem] text-white" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 z-[101] flex h-full w-80 flex-col border-r border-white/[0.08] bg-black/20 p-6 backdrop-blur-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-lg p-0.5"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto">
          {/* API Keys Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">API Keys</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openrouter" className="text-white/70">
                  OpenRouter API Key
                </Label>
                <Input
                  id="openrouter"
                  placeholder="Enter your OpenRouter API key"
                  value={settings.openrouterKey}
                  onChange={(e) => {
                    setSettings({ ...settings, openrouterKey: e.target.value });
                  }}
                  className="border-white/10 bg-white/5 focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">Selected Models</h3>
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 border-white/10 bg-white/5 focus:border-white/20"
            />
            <div className="scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-white/10 max-h-[200px] space-y-2 overflow-y-auto pr-2">
              {loading ? (
                <p className="text-white/70">Loading models...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : (
                availableModels
                  .filter((model) =>
                    model.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((model) => (
                    <div
                      key={model}
                      className="group relative flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <input
                        type="checkbox"
                        id={model}
                        checked={settings.selectedModels.includes(model)}
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
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary"
                      />
                      <Label htmlFor={model} className="text-sm text-white/90">
                        {model.split("/")[1]}
                      </Label>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
