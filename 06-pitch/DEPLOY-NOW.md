# 🚀 Deploy GridSense AI — Get Your Live Link (for the June 25 submission)

> ## ✅ DEPLOYED & LIVE (2026-06-22): **https://gridsense-ai-zeta.vercel.app**
> Project: `shailo2/gridsense-ai` on Vercel. Verified: login → demo → dashboard renders, EN/RW works. This is your submission link. (Steps below kept for reference / redeploys. **Revoke the temporary `gridsense` Vercel token now — it's no longer needed.**)


Your dashboard is **ready to deploy**: it now has a premium login screen, the 4 live screens, EN/Kinyarwanda, and a `vercel.json` so the host is auto-configured. Pick **ONE** path below. Path A is the easiest and can't fail.

> The project to deploy is the folder: `05-build/dashboard`

---

## ✅ PATH A — GitHub → Vercel (easiest, no terminal, ~5 min)
1. Go to **https://github.com/new** → create a repo named `gridsense-ai` (Public). 
2. Upload the **contents of `05-build/dashboard`** (drag the folder's files into GitHub's "upload files", or use GitHub Desktop). *Do not upload `node_modules` — it's already git-ignored.*
3. Go to **https://vercel.com** → sign in with GitHub → **Add New… → Project** → pick `gridsense-ai`.
4. Vercel auto-detects Vite. Leave defaults (it reads `vercel.json`). Click **Deploy**.
5. ~60 seconds later you get your live URL: `https://gridsense-ai-xxxx.vercel.app`. **That's your submission link.**

---

## ✅ PATH B — Vercel CLI (3 commands, if you like the terminal)
Open PowerShell in the dashboard folder:
```powershell
cd "C:\AI-Workspace\Projects\Tesi Songa Kelia\GridSense-AI\05-build\dashboard"
npm install
npm run build      # confirm it builds locally first
npx vercel login   # opens browser, sign in (GitHub/email)
npx vercel --prod  # answer the prompts → gives your live URL
```
If `npx vercel` asks questions: project name `gridsense-ai`, framework **Vite**, build `npm run build`, output `dist` (it already knows from `vercel.json`).

---

## ⚡ PATH C — Let me deploy it from here (if you want me to do it)
I can run the deploy from this session **if you give me a Vercel access token** (it's not your password — it's a revocable key):
1. Go to **https://vercel.com/account/tokens** → **Create Token** → name it `gridsense`, scope "Full Account", expiry 1 day → **Create** → copy it.
2. Paste it to me here. I'll deploy and hand you the live URL, then you can delete the token.
*(If the sandbox can't reach Vercel's API, I'll tell you immediately and we fall back to Path A.)*

---

## After it's live — verify (2 min)
- Open the URL on your **phone** → you should see the **Sign in to your home** screen.
- Sign in (any email, or "Explore the demo") → the dashboard loads.
- Tap the **RW** toggle → it switches to Kinyarwanda (with the honest draft badge).
- That URL is what you submit + what you open in the demo video / live defense.

## Notes
- **Free** tier is fine (no cost). Custom domain (e.g. `gridsense.rw`) is optional later.
- Every time you push to GitHub (Path A), Vercel auto-redeploys. 
- If the build ever fails on Vercel, it's almost always a missing dependency — run `npm install` then `npm run build` locally to see the same error and fix it.
