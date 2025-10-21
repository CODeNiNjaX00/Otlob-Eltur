-- This script updates the 'categories' table to use image paths from Supabase Storage instead of external URLs.

-- Update Restaurant Category
UPDATE public.categories
SET image_url = 'restaurants.jpg'
WHERE name = 'Restaurants';

-- Update Cafes Category
UPDATE public.categories
SET image_url = 'cafes.jpg'
WHERE name = 'Cafes';

-- Update Markets Category
UPDATE public.categories
SET image_url = 'markets.jpg'
WHERE name = 'Markets';

-- Update Grocery Category
UPDATE public.categories
SET image_url = 'grocery.jpg'
WHERE name = 'Grocery';
