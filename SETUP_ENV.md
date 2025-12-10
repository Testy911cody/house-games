# 🔧 Environment Setup

## Quick Setup

1. **Create `.env.local` file** in the project root (same folder as `package.json`)

2. **Add these variables** (get values from Supabase Dashboard → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. **Get your keys from Supabase:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Go to: **Settings** → **API**
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

4. **Save the file** and run: `npm run migrate:auto`

---

## File Location

Make sure `.env.local` is in the **project root**:
```
HouseGames/
├── .env.local          ← Create this file here
├── package.json
├── app/
└── ...
```

---

## Security Note

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`.

The service role key has full database access - keep it secret!

