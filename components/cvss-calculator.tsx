"use client"

import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// --- 1. MOTOR MATEMÁTICO CVSS 3.1 (CORREGIDO) ---
const WEIGHTS: any = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  PR: { 
    U: { N: 0.85, L: 0.62, H: 0.27 }, 
    C: { N: 0.85, L: 0.68, H: 0.50 }  
  },
  UI: { N: 0.85, R: 0.62 },
  // S ahora son solo claves, los números los usamos directo en la fórmula
  S:  { U: 6.42, C: 7.52 }, 
  CIA: { N: 0.0, L: 0.22, H: 0.56 } 
};

function calculateCVSS31(vectorMap: Record<string, string>) {
  try {
    // 1. Obtener valores o defaults
    const AV = WEIGHTS.AV[vectorMap.AV || "N"];
    const AC = WEIGHTS.AC[vectorMap.AC || "L"];
    const S_Val = vectorMap.S || "U"; // "U" o "C" (String)
    
    // Privilegios depende del Scope
    const PR_Table = S_Val === "C" ? WEIGHTS.PR.C : WEIGHTS.PR.U;
    const PR = PR_Table[vectorMap.PR || "N"];
    
    const UI = WEIGHTS.UI[vectorMap.UI || "N"];
    
    const C = WEIGHTS.CIA[vectorMap.C || "N"];
    const I = WEIGHTS.CIA[vectorMap.I || "N"];
    const A = WEIGHTS.CIA[vectorMap.A || "N"];

    // 2. Calcular Impact Sub Score (ISS)
    const ISS = 1 - ((1 - C) * (1 - I) * (1 - A));

    if (ISS <= 0) return 0.0;

    // 3. Calcular Impacto (CORREGIDO: Usamos 6.42 o 7.52, no "U" o "C")
    let Impact = 0;
    if (S_Val === "U") {
      Impact = 6.42 * ISS; // Antes decía S_Val * ISS -> Error NaN
    } else {
      Impact = 7.52 * (ISS - 0.029) - 3.25 * Math.pow(ISS - 0.02, 15);
    }

    // 4. Calcular Exploitability
    const Exploitability = 8.22 * AV * AC * PR * UI;

    // 5. Calcular Base Score Final
    let BaseScore = 0;
    if (Impact <= 0) {
      BaseScore = 0;
    } else if (S_Val === "U") {
      BaseScore = Math.min(Impact + Exploitability, 10);
    } else {
      BaseScore = Math.min(1.08 * (Impact + Exploitability), 10);
    }

    // Redondeo especial CVSS (Round up to nearest 0.1)
    return Math.ceil(BaseScore * 10) / 10;

  } catch (e) {
    console.error("Error en cálculo matemático:", e);
    return 0.0;
  }
}

function getRating(score: number) {
  if (score === 0) return "None";
  if (score < 4.0) return "Low";
  if (score < 7.0) return "Medium";
  if (score < 9.0) return "High";
  return "Critical";
}

// --- 2. COMPONENTE VISUAL ---

interface CvssCalculatorProps {
  initialVector?: string
  onChange: (score: number, vector: string, severity: string) => void
}

const metrics = {
  AV: { name: "Attack Vector", options: { N: "Network", A: "Adjacent", L: "Local", P: "Physical" } },
  AC: { name: "Attack Complexity", options: { L: "Low", H: "High" } },
  PR: { name: "Privileges Required", options: { N: "None", L: "Low", H: "High" } },
  UI: { name: "User Interaction", options: { N: "None", R: "Required" } },
  S:  { name: "Scope", options: { U: "Unchanged", C: "Changed" } },
  C:  { name: "Confidentiality", options: { N: "None", L: "Low", H: "High" } },
  I:  { name: "Integrity", options: { N: "None", L: "Low", H: "High" } },
  A:  { name: "Availability", options: { N: "None", L: "Low", H: "High" } }
}

const orderedKeys = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"]
// IMPORTANTE: Default de Impacto en 'N' (None) para que arranque en 0.0 limpio
// Si queres que arranque con puntaje, cambiá C, I, A a 'L'.
const defaultValues: Record<string, string> = {
    AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "N", I: "N", A: "N"
}

export function CvssCalculator({ initialVector, onChange }: CvssCalculatorProps) {
  
  const parseVector = (vecStr: string | undefined) => {
    const safeVec = vecStr && vecStr.includes("CVSS") ? vecStr : ""
    const parts = safeVec.split("/")
    const map: Record<string, string> = {}
    parts.forEach(part => {
      if(part.includes(":")) {
        const [key, val] = part.split(":")
        if(key !== "CVSS") map[key] = val
      }
    })
    orderedKeys.forEach(k => {
        if (!map[k]) map[k] = defaultValues[k]
    })
    return map
  }

  const [vectorMap, setVectorMap] = useState(() => parseVector(initialVector))

  const currentScore = useMemo(() => {
    return calculateCVSS31(vectorMap);
  }, [vectorMap])

  const handleUpdate = (key: string, value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newMap = { ...vectorMap, [key]: value }
    setVectorMap(newMap)

    const score = calculateCVSS31(newMap);
    const rating = getRating(score);
    const vectorString = `CVSS:3.1/` + orderedKeys.map(k => `${k}:${newMap[k]}`).join("/")

    onChange(score, vectorString, rating.toLowerCase());
  }

  const getScoreColor = (s: number) => {
    if (s >= 9.0) return "text-red-500 border-red-500/50 bg-red-500/10"
    if (s >= 7.0) return "text-orange-500 border-orange-500/50 bg-orange-500/10"
    if (s >= 4.0) return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10"
    return "text-emerald-500 border-emerald-500/50 bg-emerald-500/10"
  }

  return (
    <div className="space-y-5 bg-zinc-950 p-4 rounded-lg border border-zinc-800 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Calculadora CVSS 3.1</h4>
            <div className={`text-2xl font-bold px-4 py-1 rounded border transition-colors duration-300 ${getScoreColor(currentScore)}`}>
                {isNaN(currentScore) ? "0.0" : currentScore.toFixed(1)}
            </div>
        </div>
        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
             <code className="text-[10px] sm:text-xs text-emerald-500 break-all font-mono block">
                {`CVSS:3.1/` + orderedKeys.map(k => `${k}:${vectorMap[k]}`).join("/")}
             </code>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-5">
        {Object.entries(metrics).map(([key, data]) => (
            <div key={key} className="space-y-2">
                <Label className="text-[10px] text-zinc-500 uppercase font-bold">{data.name}</Label>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(data.options).map(([optKey, optLabel]) => {
                        const isSelected = vectorMap[key] === optKey
                        return (
                            <Button
                                key={optKey}
                                type="button" 
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => handleUpdate(key, optKey, e)} 
                                className={`h-7 text-xs px-3 ${
                                    isSelected 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" 
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                }`}
                            >
                                {optLabel}
                            </Button>
                        )
                    })}
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}