import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import './AddVendorForm.css';

const AddVendorForm = () => {
  const { dataState, addVendor } = useData();
  const { categories } = dataState;
  const [vendorName, setVendorName] = useState('');
  const [vendorDescription, setVendorDescription] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');
  const [vendorImageUrl, setVendorImageUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [menuItems, setMenuItems] = useState([{ name: '', description: '', price: '' }]);

  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { name: '', description: '', price: '' }]);
  };

  const handleMenuItemChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newMenuItems = menuItems.map((item, i) => {
      if (i === index) {
        return { ...item, [name]: value };
      }
      return item;
    });
    setMenuItems(newMenuItems);
  };

  const handleRemoveMenuItem = (index: number) => {
    const newMenuItems = menuItems.filter((_, i) => i !== index);
    setMenuItems(newMenuItems);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const menuWithNumericPrices = menuItems.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
      }));

      await addVendor({
        name: vendorName,
        description: vendorDescription,
        category_id: parseInt(vendorCategory),
        imageUrl: vendorImageUrl,
        email: email,
        password: password,
        cuisine: '', // Add a default value for cuisine
        rating: 0, // Add a default value for rating
        deliveryTime: 0, // Add a default value for deliveryTime
        menu: menuWithNumericPrices,
      });

      // Reset form
      setVendorName('');
      setVendorDescription('');
      setVendorCategory('');
      setVendorImageUrl('');
      setEmail('');
      setPassword('');
      setMenuItems([{ name: '', description: '', price: '' }]);
    } catch (error) {
      console.error('Error adding vendor:', error.message);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">Add New Vendor</h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="vendorName" className="form-label">Vendor Name</label>
            <input
              id="vendorName"
              type="text"
              placeholder="e.g., Pizza Palace"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendorCategory" className="form-label">Vendor Category</label>
            <select
              id="vendorCategory"
              value={vendorCategory}
              onChange={(e) => setVendorCategory(e.target.value)}
              required
              className="form-select"
            >
              <option value="" disabled>Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="vendorDescription" className="form-label">Vendor Description</label>
            <textarea
              id="vendorDescription"
              placeholder="e.g., Serving the best pizza in town"
              value={vendorDescription}
              onChange={(e) => setVendorDescription(e.target.value)}
              required
              className="form-textarea"
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="vendorImageUrl" className="form-label">Vendor Image URL</label>
            <input
              id="vendorImageUrl"
              type="text"
              placeholder="e.g., https://example.com/image.jpg"
              value={vendorImageUrl}
              onChange={(e) => setVendorImageUrl(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Vendor Email</label>
            <input
              id="email"
              type="email"
              placeholder="e.g., manager@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>

        <div>
          <h3 className="menu-section-title">Menu Items</h3>
          <div>
            {menuItems && menuItems.map((item, index) => (
              <div key={index} className="menu-item-grid">
                <input
                  type="text"
                  name="name"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => handleMenuItemChange(index, e)}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Item Description"
                  value={item.description}
                  onChange={(e) => handleMenuItemChange(index, e)}
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Item Price"
                  value={item.price}
                  onChange={(e) => handleMenuItemChange(index, e)}
                  required
                  className="form-input"
                />
                <button type="button" onClick={() => handleRemoveMenuItem(index)} className="btn btn-danger">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddMenuItem} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Add Menu Item
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Add Vendor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVendorForm;
