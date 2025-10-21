import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Vendor } from '../types';

const EditVendorForm: React.FC<{ vendor: Vendor, onSave: () => void }> = ({ vendor, onSave }) => {
  const { updateVendor, addDish, updateDish, deleteDish } = useData();
  const [vendorName, setVendorName] = useState(vendor.name);
  const [vendorDescription, setVendorDescription] = useState(vendor.cuisine);
  const [vendorCategory, setVendorCategory] = useState(vendor.category_id.toString());
  const [vendorImageUrl, setVendorImageUrl] = useState(vendor.imageUrl);
  const [menuItems, setMenuItems] = useState(vendor.menu);

  useEffect(() => {
    setVendorName(vendor.name);
    setVendorDescription(vendor.cuisine);
    setVendorCategory(vendor.category_id.toString());
    setVendorImageUrl(vendor.imageUrl);
    setMenuItems(vendor.menu);
  }, [vendor]);

  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { id: 0, name: '', description: '', price: 0, imageUrl: '' }]);
  };

  const handleMenuItemChange = (index, event) => {
    const values = [...menuItems];
    if (values[index]) {
      values[index][event.target.name] = event.target.value;
      setMenuItems(values);
    }
  };

  const handleSave = async () => {
    try {
      await updateVendor({ ...vendor, name: vendorName, cuisine: vendorDescription, category_id: parseInt(vendorCategory), imageUrl: vendorImageUrl });

      for (const item of menuItems) {
        if (item.id) {
          await updateDish(item);
        } else {
          await addDish(item, vendor.id);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error updating vendor:', error.message);
    }
  };

  const handleDeleteMenuItem = async (dishId: number) => {
    try {
      await deleteDish(dishId);
      setMenuItems(menuItems.filter(item => item.id !== dishId));
    } catch (error) {
      console.error('Error deleting menu item:', error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Edit Vendor</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label htmlFor="vendorName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Name</label>
            <input
              id="vendorName"
              type="text"
              placeholder="e.g., Pizza Palace"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="vendorCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Category</label>
            <select
              id="vendorCategory"
              value={vendorCategory}
              onChange={(e) => setVendorCategory(e.target.value)}
              required
              className="input-field"
            >
              <option value="" disabled>Select a category</option>
              <option value="1">Restaurant</option>
              <option value="2">Cafe</option>
              <option value="3">Groceries</option>
              <option value="4">Pharmacy</option>
              <option value="5">Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="vendorDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Description</label>
            <textarea
              id="vendorDescription"
              placeholder="e.g., Serving the best pizza in town"
              value={vendorDescription}
              onChange={(e) => setVendorDescription(e.target.value)}
              required
              className="input-field min-h-[80px]"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="vendorImageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Image URL</label>
            <input
              id="vendorImageUrl"
              type="text"
              placeholder="e.g., https://example.com/image.jpg"
              value={vendorImageUrl}
              onChange={(e) => setVendorImageUrl(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Menu Items</h3>
          <div className="space-y-4">
            {menuItems && menuItems.map((item, index) => (
              <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg dark:border-slate-700">
                <input
                  type="text"
                  name="name"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => handleMenuItemChange(index, e)}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Item Description"
                  value={item.description}
                  onChange={(e) => handleMenuItemChange(index, e)}
                  required
                  className="input-field"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Item Price"
                  value={item.price}
                  onChange={(e) => handleMenuItemChange(index, e)}
                  required
                  className="input-field"
                />
                <button type="button" onClick={() => handleDeleteMenuItem(item.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddMenuItem} className="btn-secondary mt-4">
            Add Menu Item
          </button>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="button" onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVendorForm;
