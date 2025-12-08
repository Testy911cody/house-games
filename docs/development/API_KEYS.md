# 🔑 API Keys Guide

Understanding API keys and when you need them.

---

## OPENAI_API_KEY

### What It's Used For

**Jeopardy Game - AI Topic Generation**

When you click **"CREATE NEW TOPIC"** in the Jeopardy game and choose AI generation (instead of local), the app uses your OpenAI API key to:
- Generate creative Jeopardy questions
- Create 6 categories with 5 questions each
- Make contextually relevant questions

**Code Location:** `app/api/generate-jeopardy-topic/route.ts`

---

## Is It Required?

### ❌ NO! It's OPTIONAL

The code has a **smart fallback**:

1. **With API key:**
   - ✅ AI generation works (better, more creative questions)
   - ✅ Uses OpenAI to generate topics

2. **Without API key:**
   - ✅ Local generation works (template-based questions)
   - ✅ Still generates topics, just less creative
   - ✅ Works completely offline

3. **Toggle "Use Local Generation":**
   - ✅ Always uses local generation
   - ✅ Doesn't need API key at all

---

## When Do You Need It?

### You NEED it if:
- You want AI-generated questions (more creative, context-aware)
- You want better quality Jeopardy topics
- You're okay paying for OpenAI API usage (~$0.01-0.10 per topic)

### You DON'T need it if:
- You're fine with template-based questions
- You want to keep costs at $0
- You prefer the local generation option

---

## How It Works

### With API Key (AI Generation)
```
User enters "Harry Potter" 
→ Calls OpenAI API
→ Gets creative questions about Harry Potter
→ Returns 6 categories with 30 questions
```

### Without API Key (Local Generation)
```
User enters "Harry Potter"
→ Uses local templates
→ Generates questions using patterns
→ Returns 6 categories with 30 questions
```

---

## Adding the API Key

### Option 1: Skip It (Recommended for now)
- ✅ Your site works perfectly without it
- ✅ Jeopardy game still works (uses local generation)
- ✅ No cost, no setup needed
- ❌ Questions are less creative

### Option 2: Add It Later
- Add when you want better AI-generated questions
- Just add it in your deployment platform's environment variables
- Redeploy and you're done

---

## How to Add

### Vercel
1. Project Settings → Environment Variables
2. Add: `OPENAI_API_KEY` = `your_key_here`
3. Select: Production, Preview, Development
4. Save and redeploy

### Netlify
1. Site Settings → Environment Variables
2. Add: `OPENAI_API_KEY` = `your_key_here`
3. Save and trigger redeploy

### Local Development
1. Create `.env.local` file in project root
2. Add: `OPENAI_API_KEY=your_key_here`
3. Restart dev server: `npm run dev`

**Important:** Never commit `.env.local` to Git!

---

## Summary

**The OPENAI_API_KEY is:**
- ✅ **Optional** - Your site works without it
- ✅ **Only for AI features** - Jeopardy topic generation
- ✅ **Has a fallback** - Local generation works fine
- ✅ **Can be added anytime** - Not required for initial deployment

**You can skip it!** Your site will work perfectly. You can always add it later when you want AI-generated questions.

---

## What Works Without It

- ✅ All games work perfectly
- ✅ Jeopardy game works (local generation)
- ✅ All other features work
- ✅ Site deploys and runs fine

**Bottom line:** It's a nice-to-have, not a must-have! 🎉

