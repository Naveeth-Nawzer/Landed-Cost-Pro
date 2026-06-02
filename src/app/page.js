'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  // --- State Management ---
  const [shippingCost, setShippingCost] = useState(80000);
  const [products, setProducts] = useState([
    { id: 1, name: 'Taps', qty: 100, price: 100 },
    { id: 2, name: 'Tubes', qty: 200, price: 400 },
    { id: 3, name: 'Carpets', qty: 200, price: 350 },
  ]);
  const [showMobileDetails, setShowMobileDetails] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Derived Data ---
  const totalItemValue = products.reduce((sum, p) => sum + (p.qty * p.price), 0);
  const totalLandedValue = totalItemValue + shippingCost;

  const getProductAllocation = () => {
    if (totalItemValue === 0) {
      const equalShare = products.length > 0 ? shippingCost / products.length : 0;
      return products.map(p => ({
        ...p,
        allocatedShipping: equalShare,
        landedPerUnit: p.qty > 0 ? (p.qty * p.price + equalShare) / p.qty : 0
      }));
    }
    return products.map(p => {
      const subtotal = p.qty * p.price;
      const allocationRatio = subtotal / totalItemValue;
      const allocatedShipping = shippingCost * allocationRatio;
      const landedPerUnit = p.qty > 0 ? (subtotal + allocatedShipping) / p.qty : 0;
      return { ...p, allocatedShipping, landedPerUnit };
    });
  };

  const allocations = getProductAllocation();

  // --- Handlers ---
  const handleShippingChange = (e) => {
    setShippingCost(parseFloat(e.target.value) || 0);
  };

  const updateProduct = (id, field, value) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addProduct = () => {
    const newId = Date.now();
    setProducts(prev => [...prev, {
      id: newId,
      name: 'New Product',
      qty: 1,
      price: 0
    }]);
    setTimeout(() => {
      const newCard = document.getElementById(`product-${newId}`);
      newCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleMobileDetails = () => {
    setShowMobileDetails(prev => !prev);
  };

  // Format currency
  const formatLKR = (value) => {
    return `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatLKRWithDecimals = (value) => {
    return `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!mounted) return null;

  return (
    <div className="gradient-bg text-on-surface flex flex-col min-h-screen transition-all duration-700">
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest/80 backdrop-blur-md border-b border-border-muted w-full top-0 sticky z-50">
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full max-w-7xl mx-auto">
          <h1 className="font-headline-md text-headline-sm md:text-headline-md text-primary tracking-tight">Landed Cost Pro</h1>
          <div className="hidden md:flex gap-md items-center">
            <span className="font-label-caps text-on-surface-variant flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Precision Finance Dashboard
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-lg max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-lg items-start">
          {/* Sidebar: Shipping & Summary for Desktop */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-24 space-y-lg order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Shipping Details Section */}
            <section>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-xs ml-1">SHIPPING DETAILS</h2>
              <div className="bg-surface-container-lowest border border-border-muted rounded-xl p-md shadow-sm hover-scale group">
                <label className="block font-body-sm text-body-sm text-on-surface-variant mb-base" htmlFor="shipping-cost">
                  Total Shipping Cost
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-md font-numeric-data text-numeric-data text-on-surface-variant group-focus-within:text-secondary transition-colors">
                    LKR
                  </span>
                  <input
                    className="w-full h-12 pl-[52px] pr-md bg-white border border-border-muted rounded-lg font-numeric-data text-numeric-data input-focus-ring outline-none transition-all"
                    id="shipping-cost"
                    type="number"
                    value={shippingCost}
                    onChange={handleShippingChange}
                  />
                </div>
              </div>
            </section>

            {/* Desktop Summary Card */}
            <section className="hidden lg:block glass-sidebar rounded-2xl p-lg text-on-secondary shadow-xl hover-scale">
              <h3 className="font-label-caps text-[10px] uppercase opacity-80 mb-base tracking-widest">Total Landed Value</h3>
              <div className="font-display-lg text-display-lg mb-md pulse-total">{formatLKR(totalLandedValue)}</div>
              <div className="space-y-md pt-md border-t border-white/20">
                <div className="flex justify-between font-body-sm">
                  <span className="opacity-80">Items Subtotal</span>
                  <span className="font-semibold">{formatLKR(totalItemValue)}</span>
                </div>
                <div className="flex justify-between font-body-sm">
                  <span className="opacity-80">Shipping</span>
                  <span className="font-semibold">{formatLKR(shippingCost)}</span>
                </div>
                <div className="pt-md">
                  <h4 className="font-label-caps text-[10px] opacity-70 mb-sm uppercase tracking-widest">Allocation Breakdown</h4>
                  <div className="space-y-base max-h-48 overflow-y-auto no-scrollbar">
                    {allocations.map(prod => (
                      <div key={prod.id} className="flex justify-between items-center text-sm py-1 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors px-1 rounded">
                        <span className="opacity-90 truncate max-w-[120px]">{prod.name}</span>
                        <span className="font-mono text-[13px] font-medium">{formatLKRWithDecimals(prod.landedPerUnit)} / unit</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* Main Panel: Products */}
          <section className="flex-1 w-full order-2 lg:order-1">
            <div className="flex justify-between items-center mb-md px-1 animate-slide-up" style={{ animationDelay: '0s' }}>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant">PRODUCTS</h2>
              <span className="font-label-caps text-label-caps text-on-primary-container bg-primary-fixed/50 backdrop-blur-sm px-xs rounded-full py-0.5 border border-primary-fixed">
                {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>
            <div className="space-y-md">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className="product-card bg-surface-container-lowest border border-border-muted rounded-xl p-md transition-all hover-scale shadow-sm hover:shadow-md animate-slide-up"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-md">
                    <div className="flex-1">
                      <label className="block font-label-caps text-[10px] text-on-surface-variant mb-base ml-1">PRODUCT NAME</label>
                      <input
                        className="w-full font-headline-sm text-headline-sm text-primary border-none p-0 focus:ring-0 bg-transparent placeholder-surface-variant outline-none"
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        placeholder="Product name"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-md md:w-80">
                      <div>
                        <label className="block font-body-sm text-body-sm text-on-surface-variant mb-base ml-1">Quantity</label>
                        <input
                          className="qty w-full h-11 border border-border-muted rounded-lg px-md font-numeric-data text-numeric-data input-focus-ring outline-none bg-surface-container-lowest"
                          type="number"
                          value={product.qty}
                          onChange={(e) => updateProduct(product.id, 'qty', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block font-body-sm text-body-sm text-on-surface-variant mb-base ml-1">Unit Price (LKR)</label>
                        <input
                          className="price w-full h-11 border border-border-muted rounded-lg px-md font-numeric-data text-numeric-data input-focus-ring outline-none bg-surface-container-lowest"
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="md:text-right md:min-w-[140px]">
                      <label className="block md:hidden font-body-sm text-body-sm text-on-surface-variant mb-base ml-1">Subtotal</label>
                      <span className="subtotal font-numeric-data text-numeric-data text-secondary font-bold block pt-2 md:pt-0">
                        {formatLKR(product.qty * product.price)}
                      </span>
                    </div>
                    <button
                      className="text-error opacity-40 hover:opacity-100 hover:scale-110 p-1 self-end md:self-center transition-all"
                      onClick={() => removeProduct(product.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-lg h-14 bg-white/50 backdrop-blur-sm border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-xs text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-white transition-all group animate-slide-up"
              onClick={addProduct}
              style={{ animationDelay: '0.4s' }}
            >
              <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
              <span className="font-label-caps text-label-caps">ADD NEW PRODUCT</span>
            </button>
          </section>
        </div>
      </main>

      {/* Mobile Summary Sticky Section */}
      <section className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary text-on-secondary p-md z-40 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transform transition-transform duration-300">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-label-caps text-[10px] uppercase opacity-80 tracking-widest">Final Landed Values</h3>
              <div className="flex items-baseline gap-xs">
                <span className="font-display-lg text-display-lg pulse-total">{formatLKR(totalLandedValue)}</span>
                <span className="font-body-sm text-body-sm opacity-70">Incl. Shipping</span>
              </div>
            </div>
            <button
              className="bg-white/20 p-2 rounded-xl backdrop-blur-sm active:scale-95 transition-transform"
              onClick={toggleMobileDetails}
            >
              <span className="material-symbols-outlined">{showMobileDetails ? 'expand_more' : 'expand_less'}</span>
            </button>
          </div>
          <div className={`mt-md pt-md border-t border-white/20 space-y-md overflow-y-auto max-h-60 no-scrollbar transition-all duration-300 ${showMobileDetails ? 'hidden' : 'block'}`}>
            <div className="flex justify-between font-body-sm">
              <span>Total Item Value</span>
              <span>{formatLKR(totalItemValue)}</span>
            </div>
            <div className="flex justify-between font-body-sm">
              <span>Total Shipping</span>
              <span>{formatLKR(shippingCost)}</span>
            </div>
            <div className="space-y-xs pt-xs">
              <h4 className="font-label-caps text-[10px] opacity-70 tracking-widest">ALLOCATION PER PRODUCT</h4>
              <div className="space-y-base">
                {allocations.map(prod => (
                  <div key={prod.id} className="flex justify-between items-center text-sm py-1 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors px-1 rounded">
                    <span className="opacity-90 truncate max-w-[120px]">{prod.name}</span>
                    <span className="font-mono text-[13px] font-medium">{formatLKRWithDecimals(prod.landedPerUnit)} / unit</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}