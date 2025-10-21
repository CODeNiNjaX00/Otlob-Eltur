-- This script updates the database schema to support multiple vendor categories.

-- Step 1: Create the new 'categories' table to store different business types.
CREATE TABLE public.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT -- Optional: for a nice image on the category card
);

-- Step 2: Populate the 'categories' table with the initial set of categories.
INSERT INTO public.categories (name) VALUES
('Restaurants'),
('Cafes'),
('Markets'),
('Grocery');

-- Step 3: Rename the existing 'restaurants' table to a more generic 'vendors'.
ALTER TABLE public.restaurants RENAME TO vendors;

-- Step 4: Add the 'category_id' column to the new 'vendors' table.
-- This will link each vendor to a category.
ALTER TABLE public.vendors
ADD COLUMN category_id BIGINT REFERENCES public.categories(id);

-- Step 5: Set the category for all existing vendors to 'Restaurants'.
-- This assumes the 'Restaurants' category created in Step 2 has an ID of 1.
-- Please verify the ID in your 'categories' table after running the insert.
UPDATE public.vendors
SET category_id = (SELECT id FROM public.categories WHERE name = 'Restaurants');

-- Step 6: Make the 'category_id' column mandatory for all vendors.
-- This ensures data integrity, as every vendor must belong to a category.
ALTER TABLE public.vendors
ALTER COLUMN category_id SET NOT NULL;
