"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lightbulb, Target } from "lucide-react";

export default function LearningResources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Learning Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* What is P/E Ratio */}
          <AccordionItem value="pe-ratio">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                What is P/E Ratio?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p className="text-muted-foreground">
                Price-to-Earnings (P/E) ratio measures a company's share price
                relative to its earnings per share (EPS).
              </p>
              
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium mb-1">Formula:</p>
                <p className="text-muted-foreground">
                  P/E = Market Price per Share ÷ Earnings per Share
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium mb-1">Example:</p>
                <p className="text-muted-foreground">
                  If a stock trades at $50 and EPS is $5, then P/E = 10
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Interpretation:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    <span className="text-green-600 font-medium">Low P/E (&lt; 15):</span>{" "}
                    Potentially undervalued
                  </li>
                  <li>
                    <span className="text-blue-600 font-medium">Average P/E (15-25):</span>{" "}
                    Fairly valued
                  </li>
                  <li>
                    <span className="text-red-600 font-medium">High P/E (&gt; 25):</span>{" "}
                    Potentially overvalued
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* How to Read Our Predictions */}
          <AccordionItem value="predictions">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                How to Read Our Predictions
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p className="text-muted-foreground">
                Our AI uses 3 specialized models to analyze stocks from different
                angles:
              </p>

              <div className="space-y-3">
                {/* Model 1 */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <p className="font-semibold text-blue-600">
                      1️⃣ Valuation Model (XGBoost)
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Analyzes:</span> P/E Ratio, P/B
                    Ratio, ROE, Profit Margin, Debt/Equity
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Output:</span>{" "}
                    <span className="text-green-600">UNDERVALUED</span> /{" "}
                    <span className="text-blue-600">FAIR</span> /{" "}
                    <span className="text-red-600">OVERVALUED</span>
                  </p>
                </div>

                {/* Model 2 */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="font-semibold text-green-600">
                      2️⃣ Financial Health Model (Random Forest)
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Analyzes:</span> Revenue growth,
                    Cash flow trends, Working capital, Debt trends
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Output:</span>{" "}
                    <span className="text-green-600">EXCELLENT</span> /{" "}
                    <span className="text-blue-600">FAIR</span> /{" "}
                    <span className="text-red-600">POOR</span>
                  </p>
                </div>

                {/* Model 3 */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <p className="font-semibold text-purple-600">
                      3️⃣ Growth Trajectory Model (SVM)
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Analyzes:</span> 2-year CAGR,
                    Growth acceleration, Revenue/EBITDA volatility
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <span className="font-medium">Output:</span>{" "}
                    <span className="text-green-600">STRONG_GROWTH</span> /{" "}
                    <span className="text-blue-600">MODERATE_GROWTH</span> /{" "}
                    <span className="text-yellow-600">WEAK_GROWTH</span> /{" "}
                    <span className="text-red-600">DECLINING</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Final Recommendation:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✅ All 3 models positive → <strong>BUY</strong></li>
                  <li>❌ All 3 models negative → <strong>SELL</strong></li>
                  <li>⚠️ Mixed signals → <strong>HOLD</strong></li>
                </ul>
                <p className="text-xs text-blue-800 dark:text-blue-200 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <strong>Confidence Score:</strong> Shows how certain the model is
                  (0-100%). Higher is better.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Investment Tips */}
          <AccordionItem value="tips">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-orange-500" />
                Investment Tips for Beginners
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Diversify Your Portfolio</p>
                    <p className="text-muted-foreground text-xs">
                      Don't put all eggs in one basket. Spread investments across
                      different sectors and asset types.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Think Long-Term</p>
                    <p className="text-muted-foreground text-xs">
                      Stock market rewards patience. Avoid panic selling during
                      market downturns.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Do Your Research</p>
                    <p className="text-muted-foreground text-xs">
                      Use our AI predictions as ONE factor in your decision-making,
                      not the only one.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-semibold text-xs">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Start Small</p>
                    <p className="text-muted-foreground text-xs">
                      Begin with amounts you can afford to lose. Gradually increase
                      as you gain experience.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-xs">
                    5
                  </div>
                  <div>
                    <p className="font-medium">Understand Risk</p>
                    <p className="text-muted-foreground text-xs">
                      Higher potential returns come with higher risk. Know your risk
                      tolerance before investing.
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="rounded-lg border p-3 space-y-2">
                <p className="font-medium text-xs">📚 External Resources:</p>
                <div className="space-y-1">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    asChild
                  >
                    
                      href="https://www.investopedia.com/stock-market-4689660"
                      target="_blank"
                      rel="noopener noreferrer"
                    <a>
                      Investopedia - Stock Market Basics
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                  <br />
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    asChild
                  >
                    
                      href="https://www.khanacademy.org/economics-finance-domain/core-finance"
                      target="_blank"
                      rel="noopener noreferrer"
                    <a>
                      Khan Academy - Finance & Capital Markets
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                  <br />
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    asChild
                  >
                    
                      href="https://www.investor.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                    <a>
                      SEC.gov - Investor Education
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div> */}
              {/* </div> */}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}