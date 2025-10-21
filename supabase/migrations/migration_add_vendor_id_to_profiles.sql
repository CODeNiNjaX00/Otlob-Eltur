
ALTER TABLE public.profiles
ADD COLUMN vendor_id INTEGER,
ADD CONSTRAINT profiles_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);
