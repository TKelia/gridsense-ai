# HANDOFF — Running GridSense AI in Claude Code

This is the bridge from the Cowork foundation to deep build work in Claude Code (which has the live MCP stack: Perplexity, Firecrawl, Playwright, Chrome DevTools).

---

## Step 1 — Open PowerShell
- Press the **Windows key**, type **PowerShell**, click **Windows PowerShell** (a blue terminal opens).
  - (Optional, if a command ever needs admin rights: right-click → **Run as administrator**.)

## Step 2 — Go to the project folder
Copy-paste this line and press **Enter**:
```powershell
cd "C:\AI-Workspace\Projects\Tesi Songa Kelia\GridSense-AI"
```
Then confirm you're in the right place:
```powershell
dir
```
You should see `CLAUDE.md`, `README.md`, `DIRECTION.md`, `PROJECT-REPORT.md`, and the numbered folders.

## Step 3 — Start Claude Code
```powershell
claude
```
(If that doesn't start it, your launch command may differ — whatever you normally use to start Claude Code in a folder.)

## Step 4 — Paste the kickoff prompt
Claude Code auto-reads `CLAUDE.md`, so the rules, the Channel, and the MCP stack are already enforced. Paste the prompt below as your first message.

---

## ▶ THE CLAUDE CODE KICKOFF PROMPT (copy everything in the box)

```
You are working on GridSense AI. Before anything, read these files in full and confirm you understand them: CLAUDE.md, RULES.md, DIRECTION.md, PROJECT-REPORT.md, 01-research/research-findings.md, 02-strategy/stress-test-and-argument.md, 04-business/capex-opex.md, 04-business/fundraising-plan.md.

Hard rules (from CLAUDE.md):
1) NEVER guess, invent, imagine, pretend, or assume. Every fact/number/price/claim must be sourced. Tag anything unverified as ⚠️ UNVERIFIED and add it to PROJECT-REPORT.md.
2) ALWAYS run "the Channel" before any final result and after any new task: brainstorm → stress-test/kill weak ideas → deep dive → argue & defend. Save the reasoning.
3) Read PROJECT-REPORT.md before working; update it (dated entry) after working.
4) Use the MCP stack deliberately: Perplexity (find facts) → Firecrawl (extract exact prices/specs/regulations) → build → Playwright (test web flows) → Chrome DevTools (debug/measure). Cite sources.

Standard of work: elite, premium, professional, defensible. Good pace, no rush, in order, bold. I'm Tesi (ALU student, Kigali). Capstone deadline is under 3 weeks; I have ~0 budget now.

After you've read and confirmed the files, run the Channel on this sprint and then propose a concrete plan before executing:

SPRINT 1 GOALS:
1. Use Perplexity + Firecrawl to find REAL, sourced Rwanda landed prices for the Phase-1 BOM (ESP32, SCT-013-100 CT clamp, smart plugs with energy metering, enclosure, 5V PSU, wiring). Include shipping/taxes and the live USD↔RWF rate. Replace every ⚠️ VERIFY in 04-business/capex-opex.md and complete the unit economics + payback math.
2. Verify Hanga PitchFest 2026 dates + eligibility (student-stage) and 3–5 other real, current grants/competitions; finalize 04-business/fundraising-plan.md.
3. Confirm whether any installation/electrical-safety/regulatory approval applies to a behind-the-meter CT install in Rwanda.
4. Then propose the build plan for the Phase-1 software demo dashboard (tariff-aware, the real product UX) to live in 05-build/.

Do NOT skip the Channel. Do NOT present unverified numbers as final. Update PROJECT-REPORT.md when done, and end with a single clear next action.
```

---

## Notes
- If Claude Code says a tool (Perplexity/Firecrawl/Playwright/Chrome DevTools) isn't available, check it's enabled for this project, then continue.
- Keep all work inside this folder so `PROJECT-REPORT.md` stays the single memory.
- Come back to Cowork anytime for pitch writing, documents, slides, or visuals.
