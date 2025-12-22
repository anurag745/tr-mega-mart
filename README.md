# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

# TR Mega Mart — Admin Dashboard

This repository contains the frontend admin dashboard for TR Mega Mart, a local shop in Sujanpur. It's a Vite + React + TypeScript app using Supabase for authentication and data.

**Business**
- Name: TR Mega Mart
- Location: Sheikhan Mohalla, Sujanpur
- Owners: Anil Mahajan, Sanyam Mahajan
- Phone: +91 98151 61931 (Anil Mahajan)
- Phone: +91 98145 04970 (Sanyam Mahajan)
- Contact email: mahajansanyam745@gmail.com
- Logo: https://drive.google.com/file/d/1JRHq6-e7uQGet34ifuxzI8EE4X5EB5dr/view?usp=drivesdk

Project purpose
- Admin dashboard to monitor orders, deliveries, inventory, products and analytics for TR Mega Mart.
- Uses Supabase for authentication (Email+Password and Google OAuth) and as the backend DB.
- UI built with React, Tailwind CSS and a shadcn-style component set.

Quick start (developer)

1. Install dependencies

```bash
npm install
```

2. Create environment variables

Create a `.env` file in the project root and add the following (replace values with your Supabase project values):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_APP_NAME="TR Mega Mart"
```

3. Run the dev server

```bash
npm run dev
```

The app runs locally at `http://localhost:8080/` by default.

Supabase setup notes (important for auth & profiles)

- Enable the following in your Supabase project:
	- Authentication providers: Email + Password and Google (if you want Google OAuth).
	- Add your development URL (e.g. `http://localhost:8080`) to the OAuth redirect URLs in Supabase Auth settings.

- Profiles creation (required, production-safe):
	- This frontend intentionally does NOT write to the `profiles` table. Profiles must be created server-side automatically when an `auth.users` row is created. Use a Postgres trigger on `auth.users` to insert into `public.profiles`.
	- Example trigger (run in Supabase SQL editor):

```sql
-- Use the prepared script in `scripts/supabase/trigger_profiles.sql` which:
--  - reads name/phone from both `user_metadata` and `raw_user_meta_data` fields
--  - sets the created profile role to `admin`
--  - updates existing profile info if present
-- Run the script in the Supabase SQL editor or paste the contents of `scripts/supabase/trigger_profiles.sql`.
```

- Row-Level Security (RLS) for `profiles` (recommended policies)
	- Do NOT allow client-side inserts into `profiles`.
	- Create non-recursive policies such as:

```sql
-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert a profile only for their own id (if you ever do client-side insert for onboarding)
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
	FOR INSERT
	WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
	FOR SELECT
	USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
	FOR UPDATE
	USING (auth.uid() = id)
	WITH CHECK (auth.uid() = id);
```

Notes and troubleshooting

- If signup appears to create an auth user but no `profiles` row, confirm the trigger exists and check the Supabase logs for the trigger execution (Supabase Dashboard → Logs).
 - If signup appears to create an auth user but no `profiles` row, confirm the trigger exists and check the Supabase logs for the trigger execution (Supabase Dashboard → Logs).
 - If you want to populate the Auth dashboard's "Display name" and "Phone" columns (top-level auth user fields), those won't be automatically filled from `user_metadata` by Supabase. To update them you can either:
	 - run an admin update using the Supabase Admin API (server-side only). A simple script is included at `scripts/update_auth_user.js` — run it like:

```bash
SERVICE_ROLE_KEY=your_service_role_key VITE_SUPABASE_URL="https://your-project.supabase.co" \
	node scripts/update_auth_user.js <USER_ID> "Full Name" "+911234567890"
```

	 - or implement a server-side endpoint that calls `auth.admin.updateUserById` using the service_role key.
- If you see RLS errors such as "infinite recursion detected in policy", inspect existing policies on `profiles` and remove/replace policies that reference `profiles` inside their expressions (these will cause recursion).
- OAuth: ensure your OAuth redirect URLs and CORS settings include the dev origin.

Project structure (high level)

- `src/` — application source
	- `components/` — UI components and layout
	- `pages/` — route pages (`Login.tsx`, `Signup.tsx`, `Dashboard.tsx`, etc.)
	- `hooks/` — react-query hooks and Supabase data access
	- `integrations/supabase/` — Supabase client + types

Contact / support

For business enquiries contact:
- Sanyam Mahajan — +91 98145 04970 — mahajansanyam745@gmail.com
- Anil Mahajan — +91 98151 61931

For technical issues with this repository, open an issue or contact the maintainer.

License

This repository does not include a license file. Add one if you plan to publish or share the code.
