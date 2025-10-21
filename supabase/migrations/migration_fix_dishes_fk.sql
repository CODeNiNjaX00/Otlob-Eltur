-- This migration fixes the foreign key constraint on the 'dishes' table.

ALTER TABLE public.dishes
DROP CONSTRAINT IF EXISTS dishes_vendor_id_fkey;

ALTER TABLE public.dishes
DROP CONSTRAINT IF EXISTS dishes_restaurant_id_fkey;

ALTER TABLE public.dishes
ADD CONSTRAINT dishes_vendor_id_fkey
FOREIGN KEY (vendor_id) REFERENCES public.vendors (id);
