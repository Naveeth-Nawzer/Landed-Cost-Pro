'use client';

import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [isDownloading, setIsDownloading] = useState(false);
  
  const pdfContentRef = useRef(null);

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
        subtotal: p.qty * p.price,
        allocatedShipping: equalShare,
        landedPerUnit: p.qty > 0 ? (p.qty * p.price + equalShare) / p.qty : 0,
        totalLandedCost: p.qty > 0 ? (p.qty * p.price + equalShare) : 0
      }));
    }
    return products.map(p => {
      const subtotal = p.qty * p.price;
      const allocationRatio = subtotal / totalItemValue;
      const allocatedShipping = shippingCost * allocationRatio;
      const landedPerUnit = p.qty > 0 ? (subtotal + allocatedShipping) / p.qty : 0;
      const totalLandedCost = subtotal + allocatedShipping;
      return { 
        ...p, 
        subtotal, 
        allocatedShipping, 
        landedPerUnit,
        totalLandedCost
      };
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

  // --- Professional PDF Download Function ---
  const downloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      // Create a temporary div for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.fontFamily = 'Hanken Grotesk, sans-serif';
      pdfContainer.style.maxWidth = '800px';
      pdfContainer.style.margin = '0 auto';
      
      // Build the PDF HTML content
      pdfContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Hanken Grotesk', sans-serif;
              padding: 40px;
              color: #191c1e;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #006a61;
            }
            .header h1 {
              color: #000000;
              font-size: 28px;
              margin-bottom: 8px;
            }
            .header p {
              color: #45464d;
              font-size: 12px;
            }
            .company-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding: 15px;
              background: #f7f9fb;
              border-radius: 8px;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              background: linear-gradient(135deg, #004d40 0%, #006a61 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
            }
            .card-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              opacity: 0.8;
              margin-bottom: 8px;
            }
            .card-value {
              font-size: 24px;
              font-weight: 700;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .products-table th {
              background: #006a61;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .products-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            .products-table tr:hover {
              background: #f7f9fb;
            }
            .total-row {
              background: #f0fdf4;
              font-weight: 700;
            }
            .total-row td {
              border-top: 2px solid #006a61;
              font-weight: 700;
            }
            .shipping-section {
              background: #f7f9fb;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 30px;
            }
            .allocation-section {
              background: #f7f9fb;
              padding: 20px;
              border-radius: 12px;
              margin-top: 20px;
            }
            .allocation-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              color: #76777d;
            }
            .text-right {
              text-align: right;
            }
            .font-bold {
              font-weight: 700;
            }
            .text-primary {
              color: #006a61;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LANDED COST PRO</h1>
            <p>Professional Landed Cost Calculation Report</p>
          </div>

          <div class="company-info">
            <div>
              <strong>Report Generated:</strong><br/>
              ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
            <div>
              <strong>Document ID:</strong><br/>
              LCP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Item Value</div>
              <div class="card-value">${formatLKR(totalItemValue)}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Shipping Cost</div>
              <div class="card-value">${formatLKR(shippingCost)}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Landed Value</div>
              <div class="card-value">${formatLKR(totalLandedValue)}</div>
            </div>
          </div>

          <h3 style="margin-bottom: 15px; color: #004d40;">PRODUCT DETAILS</h3>
          <table class="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th class="text-right">Units</th>
                <th class="text-right">Unit Price (LKR)</th>
                <th class="text-right">Per Unit Cost (LKR)</th>
                <th class="text-right">Total Item Cost (LKR)</th>
                <th class="text-right">Total Landed Cost (LKR)</th>
              </tr>
            </thead>
            <tbody>
              ${allocations.map(prod => `
                <tr>
                  <td><strong>${prod.name}</strong></td>
                  <td class="text-right">${prod.qty.toLocaleString()}</td>
                  <td class="text-right">${formatLKR(prod.price)}</td>
                  <td class="text-right">${formatLKRWithDecimals(prod.landedPerUnit)}</td>
                  <td class="text-right">${formatLKR(prod.subtotal)}</td>
                  <td class="text-right">${formatLKR(prod.totalLandedCost)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" class="text-right font-bold">TOTALS:</td>
                <td class="text-right font-bold">${formatLKR(totalItemValue)}</td>
                <td class="text-right font-bold">${formatLKR(totalLandedValue)}</td>
              </tr>
            </tbody>
          </table>

          <div class="shipping-section">
            <h3 style="margin-bottom: 15px; color: #004d40;">SHIPPING COST BREAKDOWN</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Base Shipping Cost:</span>
              <span class="font-bold">${formatLKR(shippingCost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Allocation Method:</span>
              <span>Proportional to Product Value</span>
            </div>
          </div>

          <div class="allocation-section">
            <h3 style="margin-bottom: 15px; color: #004d40;">SHIPPING ALLOCATION PER PRODUCT</h3>
            ${allocations.map(prod => `
              <div class="allocation-item">
                <span><strong>${prod.name}</strong> (${prod.qty} units)</span>
                <span>Shipping: ${formatLKR(prod.allocatedShipping)} | Landed/Unit: ${formatLKRWithDecimals(prod.landedPerUnit)}</span>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>Landed Cost Pro - Precision Finance Dashboard</p>
          </div>
        </body>
        </html>
      `;

      // Temporarily add to body to measure
      document.body.appendChild(pdfContainer);
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';

      // Capture the PDF content
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: 800,
      });

      // Remove temporary element
      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 277; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position - 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add metadata to PDF
      pdf.setProperties({
        title: 'Landed Cost Report',
        subject: 'Landed Cost Calculation',
        author: 'Landed Cost Pro',
        keywords: 'landed cost, shipping, products, logistics',
        creator: 'Landed Cost Pro Dashboard'
      });

      // Save the PDF
      const date = new Date();
      const fileName = `landed-cost-report-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
      <header className="bg-surface-container-lowest/80 backdrop-blur-md border-b border-border-muted w-full top-0 sticky z-50 no-print">
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full max-w-7xl mx-auto">
          <h1 className="font-headline-md text-headline-sm md:text-headline-md text-primary tracking-tight">Landed Cost Pro</h1>
          <div className="hidden md:flex gap-md items-center">
            <span className="font-label-caps text-on-surface-variant flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Precision Finance Dashboard
            </span>
          </div>
          <button 
            onClick={downloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-xs px-md py-2 bg-secondary text-on-secondary rounded-lg font-label-caps text-[12px] hover:bg-on-secondary-fixed-variant transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDownloading ? 'hourglass_empty' : 'file_download'}
            </span>
            <span className="hidden sm:inline">
              {isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-lg max-w-7xl mx-auto w-full pb-[180px]">
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
            <div className="space-y-md mb-xl">
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
                      className="text-error opacity-40 hover:opacity-100 hover:scale-110 p-1 self-end md:self-center transition-all no-print"
                      onClick={() => removeProduct(product.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-lg h-14 bg-white/50 backdrop-blur-sm border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-xs text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-white transition-all group animate-slide-up no-print"
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
      <section className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary text-on-secondary p-md z-50 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transform transition-transform duration-300 no-print">
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

      {/* Loading Overlay for PDF Generation */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] no-print">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            <p className="font-body-md text-on-surface">Generating Professional PDF Report, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}