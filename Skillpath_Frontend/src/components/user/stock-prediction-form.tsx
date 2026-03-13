"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Stock {
  id: number;
  ticker: string;
  company_name: string;
  sector_id: number;
  sector_name?: string;
}

interface Sector {
  id: number;
  name: string;
}

interface StockPredictionFormProps {
  onSuccess: (result: any) => void;
}

export default function StockPredictionForm({ onSuccess }: StockPredictionFormProps) {
  const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;
  const BACKEND_PORT = process.env.NEXT_PUBLIC_BACKEND_PORT;
  const API_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSectors, setFetchingSectors] = useState(true);
  const [fetchingStocks, setFetchingStocks] = useState(false);

  // Fetch sectors on mount
  useEffect(() => {
    fetchSectors();
  }, []);

  // Fetch stocks when sector changes
  useEffect(() => {
    if (selectedSector) {
      fetchStocksBySector(selectedSector);
    } else {
      setStocks([]);
      setSelectedTicker("");
    }
  }, [selectedSector]);

  const fetchSectors = async () => {
    setFetchingSectors(true);
    try {
      const response = await fetch(`${API_URL}/sector/sectors?active_only=true`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setSectors(result.data);
      } else {
        toast.error("Failed to fetch sectors");
      }
    } catch (error) {
      console.error("Fetch sectors error:", error);
      toast.error("Network error");
    } finally {
      setFetchingSectors(false);
    }
  };

  const fetchStocksBySector = async (sectorId: string) => {
    setFetchingStocks(true);
    setSelectedTicker(""); // Reset selected stock when sector changes
    
    try {
      const response = await fetch(
        `${API_URL}/stock/stocks?sector_id=${sectorId}&active_only=true&limit=500`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok && result.data) {
        setStocks(result.data);
        
        if (result.data.length === 0) {
          toast.info("No stocks found in this sector");
        }
      } else {
        toast.error("Failed to fetch stocks");
      }
    } catch (error) {
      console.error("Fetch stocks error:", error);
      toast.error("Network error");
    } finally {
      setFetchingStocks(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedTicker) {
      toast.error("Please select a stock");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict/stock`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: selectedTicker }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        toast.success("Prediction generated successfully!");
        onSuccess(result.data);
      } else {
        toast.error(result.detail || result.error || "Prediction failed");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Select Stock
        </CardTitle>
        <CardDescription>
          Choose a sector and stock to get AI-powered prediction analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sector Selection */}
        <div className="space-y-2">
          <Label htmlFor="sector">Sector <span className="text-destructive">*</span></Label>
          {fetchingSectors ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sector first" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id.toString()}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Stock Selection */}
        <div className="space-y-2">
          <Label htmlFor="stock">
            Stock <span className="text-destructive">*</span>
          </Label>
          {!selectedSector ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Please select a sector first
              </p>
            </div>
          ) : fetchingStocks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : stocks.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No stocks available in this sector
              </p>
            </div>
          ) : (
            <Select 
              value={selectedTicker} 
              onValueChange={setSelectedTicker}
              disabled={!selectedSector}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock) => (
                  <SelectItem key={stock.id} value={stock.ticker}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stock.ticker}</span>
                      <span className="text-muted-foreground">
                        - {stock.company_name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          onClick={handlePredict}
          disabled={loading || !selectedTicker || !selectedSector}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Get Prediction
            </>
          )}
        </Button>

        {selectedTicker && (
          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <div>
              <span className="font-medium">Selected Sector: </span>
              <span className="text-muted-foreground">
                {sectors.find((s) => s.id.toString() === selectedSector)?.name}
              </span>
            </div>
            <div>
              <span className="font-medium">Selected Stock: </span>
              <span className="text-muted-foreground">
                {stocks.find((s) => s.ticker === selectedTicker)?.company_name ||
                  selectedTicker}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}