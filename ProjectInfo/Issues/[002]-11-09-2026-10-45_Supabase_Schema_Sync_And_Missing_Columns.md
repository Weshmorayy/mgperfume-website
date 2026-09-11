# Issue [002]: Missing Database Columns & Supabase SQL Synchronization Failures

- **Date & Time**: 11-09-2026 10:45
- **Severity**: High
- **Category**: Supabase Database / Schema Migration
- **Status**: Resolved

## 1. Symptom & Error Log
When trying to save or update products in the admin panel or executing the SQL schema:
```text
Failed to run sql query: ERROR: 42601: syntax error at or near "FOR" LINE 179: DROP POLICY IF EXISTS "Full access faqs" ON public.faqs FOR ALL USING (true);
PostgREST Error: Could not find the 'is_hero' column of 'products' in the schema cache
```

## 2. Root Cause
1. **SQL DDL Syntax Error**: In `supabase_master_schema.sql`, line 179 mistakenly combined `DROP POLICY` and `CREATE POLICY` syntax into a single invalid statement: `DROP POLICY IF EXISTS "..." ON table FOR ALL USING (true);`.
2. **Missing Database Column**: The original Supabase `products` table lacked `is_hero`, causing insert/update attempts to fail until the master schema executed cleanly.
3. **Seed Data with Missing Assets**: Seed statements referenced fictitious mock images (e.g. `khamrah-qahwa.jpg`, `asad-bourbon.jpg`) which did not exist on disk in `public/images/products/`, leading to 404 image errors.

## 3. Solution & Code Diff
1. **Separated DROP and CREATE Policy statements**:
```diff
- DROP POLICY IF EXISTS "Full access faqs" ON public.faqs FOR ALL USING (true);
+ DROP POLICY IF EXISTS "Full access faqs" ON public.faqs;
+ CREATE POLICY "Full access faqs" ON public.faqs FOR ALL USING (true);
```
2. **Dynamic Schema Migration & RPC (`exec_sql`)**:
Added the `exec_sql(query text)` security definer function and updated `scripts/sync-supabase.cjs` to automate remote verification and repairs.
3. **Database Asset Alignment**:
Executed remote updates via RPC to point all product rows to authentic image files present in `public/images/products/` and removed mock banners.

## 4. Prevention & Rules
- Always test SQL files locally before instructing database execution.
- Maintain a single source of truth for seed data in `src/config/site.ts` with real image files only.
