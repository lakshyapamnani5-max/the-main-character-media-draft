import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  Send, 
  Save, 
  Calculator, 
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  EventCharge, 
  Quotation, 
  QuoteItem, 
  Client, 
  Enquiry 
} from '../../types';
import { StorageService } from '../../services/storage';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { QuotePreviewModal } from './QuotePreviewModal';

interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteData: Partial<Quotation>) => Quotation;
  initialQuote?: Quotation | null;
  preloadedCharge?: EventCharge | null;
  preloadedEnquiry?: Enquiry | null;
  preloadedClient?: Client | null;
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuote,
  preloadedCharge,
  preloadedEnquiry,
  preloadedClient
}) => {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [enquiryId, setEnquiryId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientInstagram, setClientInstagram] = useState('');

  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(18);
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>('');
  const [customAdvance, setCustomAdvance] = useState(false);

  const [notes, setNotes] = useState('Capture formatted exclusively for 9:16 social storytelling with high-bitrate audio and wireless lavalier microphones.');
  const [terms, setTerms] = useState(
    '1. 50% advance booking deposit required to lock team & equipment on the roster.\n' +
    '2. Remaining 50% balance payable on or before event day.\n' +
    '3. Raw uncut footage transferred on-site via AirDrop / portable SSD at the end of each shoot.\n' +
    '4. Edited 9:16 high-definition reels delivered within 5-7 working days.'
  );

  const [customItemName, setCustomItemName] = useState('');
  const [customItemRate, setCustomItemRate] = useState<number | ''>('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [selectedChargeIdToAdd, setSelectedChargeIdToAdd] = useState('');

  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const activeCharges = StorageService.getActiveEventCharges();
  const existingClients = StorageService.getClients();

  useEffect(() => {
    if (isOpen) {
      if (initialQuote) {
        setQuoteNumber(initialQuote.quoteNumber);
        setClientId(initialQuote.clientId || '');
        setEnquiryId(initialQuote.enquiryId || '');
        setClientName(initialQuote.clientName);
        setClientPhone(initialQuote.clientPhone);
        setClientEmail(initialQuote.clientEmail);
        setClientAddress(initialQuote.clientAddress || '');
        setClientInstagram(initialQuote.clientInstagram || '');
        setEventName(initialQuote.eventName);
        setEventType(initialQuote.eventType);
        setEventDate(initialQuote.eventDate);
        setVenue(initialQuote.venue);
        setItems(initialQuote.items);
        setDiscountType(initialQuote.discountType);
        setDiscountValue(initialQuote.discountValue);
        setTaxPercentage(initialQuote.taxPercentage);
        setAdvanceAmount(initialQuote.advanceAmount);
        setCustomAdvance(true);
        setNotes(initialQuote.notes);
        setTerms(initialQuote.terms);
      } else {
        const nextNum = StorageService.getNextQuoteNumber();
        setQuoteNumber(nextNum);
        
        // Check if preloaded from Enquiry
        if (preloadedEnquiry) {
          setEnquiryId(preloadedEnquiry.id);
          setClientName(preloadedEnquiry.clientName);
          setClientPhone(preloadedEnquiry.phone);
          setClientEmail(preloadedEnquiry.email);
          setEventName(preloadedEnquiry.eventName);
          setEventType(preloadedEnquiry.eventType);
          setEventDate(preloadedEnquiry.date);
          setVenue(preloadedEnquiry.venue);
        } else if (preloadedClient) {
          setClientId(preloadedClient.id);
          setClientName(preloadedClient.name);
          setClientPhone(preloadedClient.phone);
          setClientEmail(preloadedClient.email);
          setClientAddress(preloadedClient.address || '');
          setClientInstagram(preloadedClient.instagram || '');
          setEventName(`${preloadedClient.name.split('&')[0].trim()} Wedding Shoot`);
        } else {
          setClientId('');
          setEnquiryId('');
          setClientName('');
          setClientPhone('');
          setClientEmail('');
          setClientAddress('');
          setClientInstagram('');
          setEventName('');
          setEventType('Wedding');
          setEventDate('');
          setVenue('');
        }

        // Check if preloaded with an event charge
        if (preloadedCharge) {
          const snapshotted: QuoteItem = {
            id: `qi-${Date.now()}`,
            chargeId: preloadedCharge.id,
            name: preloadedCharge.name,
            description: preloadedCharge.description,
            rate: preloadedCharge.price,
            quantity: 1,
            crewRequirement: preloadedCharge.crewRequirement,
            duration: preloadedCharge.duration,
            includedServices: preloadedCharge.includedServices ? [...preloadedCharge.includedServices] : [],
            amount: preloadedCharge.price
          };
          setItems([snapshotted]);
        } else {
          // Default empty or preselect Wedding Day
          const defaultWedding = activeCharges.find(c => c.name === 'Wedding Day');
          if (defaultWedding) {
            setItems([{
              id: `qi-${Date.now()}`,
              chargeId: defaultWedding.id,
              name: defaultWedding.name,
              description: defaultWedding.description,
              rate: defaultWedding.price,
              quantity: 1,
              crewRequirement: defaultWedding.crewRequirement,
              duration: defaultWedding.duration,
              includedServices: defaultWedding.includedServices ? [...defaultWedding.includedServices] : [],
              amount: defaultWedding.price
            }]);
          } else {
            setItems([]);
          }
        }

        setDiscountType('flat');
        setDiscountValue(0);
        setTaxPercentage(18);
        setAdvanceAmount('');
        setCustomAdvance(false);
      }
    }
  }, [isOpen, initialQuote, preloadedCharge, preloadedEnquiry, preloadedClient]);

  if (!isOpen) return null;

  // Real-time calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
  const discountAmount = discountType === 'percentage' 
    ? Math.round((subtotal * discountValue) / 100) 
    : Number(discountValue) || 0;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((afterDiscount * taxPercentage) / 100);
  const grandTotal = afterDiscount + taxAmount;
  
  const calculatedAdvance = customAdvance && advanceAmount !== '' 
    ? Number(advanceAmount) 
    : Math.round(grandTotal * 0.5);

  const balanceAmount = Math.max(0, grandTotal - calculatedAdvance);

  // Snapshotting Event Charge from Catalogue
  const handleAddChargeFromCatalogue = (chargeId: string) => {
    const charge = activeCharges.find(c => c.id === chargeId);
    if (!charge) return;

    // SNAPSHOT Name, Description, and Price
    const snapshottedItem: QuoteItem = {
      id: `qi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chargeId: charge.id,
      name: charge.name,
      description: charge.description,
      rate: charge.price,
      quantity: 1,
      crewRequirement: charge.crewRequirement,
      duration: charge.duration,
      includedServices: charge.includedServices ? [...charge.includedServices] : [],
      amount: charge.price
    };

    setItems([...items, snapshottedItem]);
    setSelectedChargeIdToAdd('');
  };

  // Add Custom Item
  const handleAddCustomItem = () => {
    if (!customItemName.trim() || customItemRate === '') return;

    const customItem: QuoteItem = {
      id: `qi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: customItemName.trim(),
      description: customItemDesc.trim(),
      rate: Number(customItemRate),
      quantity: 1,
      amount: Number(customItemRate)
    };

    setItems([...items, customItem]);
    setCustomItemName('');
    setCustomItemRate('');
    setCustomItemDesc('');
  };

  const handleUpdateItemQuantity = (index: number, qty: number) => {
    const newItems = [...items];
    const validQty = Math.max(1, qty);
    newItems[index].quantity = validQty;
    newItems[index].amount = newItems[index].rate * validQty;
    setItems(newItems);
  };

  const handleUpdateItemRate = (index: number, newRate: number) => {
    const newItems = [...items];
    newItems[index].rate = newRate;
    newItems[index].amount = newRate * newItems[index].quantity;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSelectExistingClient = (id: string) => {
    setClientId(id);
    const cli = existingClients.find(c => c.id === id);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone);
      setClientEmail(cli.email);
      setClientAddress(cli.address || '');
      setClientInstagram(cli.instagram || '');
    }
  };

  const constructQuotationObject = (status: Quotation['status']): Quotation => {
    return {
      id: initialQuote?.id || `qtn-${Date.now()}`,
      quoteNumber,
      clientId: clientId || undefined,
      enquiryId: enquiryId || undefined,
      clientName: clientName.trim() || 'Valued Client',
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      clientAddress: clientAddress.trim(),
      clientInstagram: clientInstagram.trim(),
      eventName: eventName.trim() || 'Wedding Celebration',
      eventType,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      venue: venue.trim() || 'Venue TBD',
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxPercentage,
      taxAmount,
      grandTotal,
      advanceAmount: calculatedAdvance,
      balanceAmount,
      notes,
      terms,
      status,
      createdAt: initialQuote?.createdAt || new Date().toISOString(),
      validUntil: initialQuote?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sentAt: status === 'Sent' ? new Date().toISOString() : initialQuote?.sentAt
    };
  };

  const handleSaveDraft = () => {
    const quote = constructQuotationObject('Draft');
    onSave(quote);
    onClose();
  };

  const handleSendQuote = () => {
    const quote = constructQuotationObject('Sent');
    onSave(quote);
    onClose();
  };

  const handleOpenPreview = () => {
    const quote = constructQuotationObject(initialQuote?.status || 'Draft');
    setPreviewQuote(quote);
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = () => {
    const quote = constructQuotationObject(initialQuote?.status || 'Draft');
    PDFGeneratorService.downloadQuotationPDF(quote);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#181818] text-white">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded border border-[#C58B39] bg-[#222] text-[#C58B39] font-serif font-bold flex items-center justify-center text-sm">
              M
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
                Quotation Builder
              </div>
              <h2 className="font-serif text-lg font-bold text-[#FAF8F5]">
                {initialQuote ? `Edit Quote ${initialQuote.quoteNumber}` : 'Create Custom Quote'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#FAF8F5] bg-[#282828] px-2.5 py-1 rounded border border-[#3A3A3A]">
              {quoteNumber}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 text-xs bg-[#FAF8F5]">
          
          {/* Section 1: Client & Event Information */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
              <span className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide">
                1. Client & Event Profile
              </span>

              {/* Existing client picker */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-[11px]">Select existing client:</span>
                <select
                  value={clientId}
                  onChange={(e) => handleSelectExistingClient(e.target.value)}
                  className="px-2 py-1 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
                >
                  <option value="">-- New Client --</option>
                  {existingClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Client / Couple Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rhea & Siddharth"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98201 00000"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="couple@gmail.com"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Rhea & Sid Wedding Celebration"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Haldi Ceremony">Haldi Ceremony</option>
                  <option value="Mehendi Soirée">Mehendi Soirée</option>
                  <option value="Sangeet Gala">Sangeet Gala</option>
                  <option value="Reception Evening">Reception Evening</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Pre-Wedding Cinematic">Pre-Wedding Cinematic</option>
                  <option value="Multi-Day Royal Wedding">Multi-Day Royal Wedding</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Shoot Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Venue & City</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Taj Lake Palace, Udaipur"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items & Event Charges Selection (Snapshotted) */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
              <div>
                <span className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide block">
                  2. Select Event Charges & Add-ons
                </span>
                <span className="text-[11px] text-neutral-500">
                  Services are snapshotted upon addition; future master rate card changes will not affect this quote.
                </span>
              </div>

              {/* Quick Catalogue Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedChargeIdToAdd}
                  onChange={(e) => {
                    if (e.target.value) handleAddChargeFromCatalogue(e.target.value);
                  }}
                  className="px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 bg-white font-medium focus:border-[#C58B39]"
                >
                  <option value="">+ Add from Master Rate Card...</option>
                  {activeCharges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — ₹{c.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Items Table */}
            <div className="overflow-x-auto border border-[#E8E3D9] rounded">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] font-medium text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Service Name & Deliverables</th>
                    <th className="py-2.5 px-3 text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 text-right w-32">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right w-32">Total (₹)</th>
                    <th className="py-2.5 px-2 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE1]">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-400 italic">
                        No services added to this quote yet. Pick from master charges above or add custom item below.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-[#FAF8F5]/80">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900">{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                              {item.description}
                            </div>
                          )}
                          {item.includedServices && item.includedServices.length > 0 && (
                            <div className="text-[10px] text-[#8C6428] mt-0.5 font-medium">
                              Includes: {item.includedServices.slice(0, 4).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(index, Number(e.target.value))}
                            className="w-14 px-1.5 py-1 text-center border border-[#DCD6C8] rounded font-mono tabular-nums bg-white"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={item.rate}
                            onChange={(e) => handleUpdateItemRate(index, Number(e.target.value))}
                            className="w-24 px-2 py-1 text-right border border-[#DCD6C8] rounded font-mono tabular-nums bg-white"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-neutral-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Custom Item Row */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <span className="font-medium text-neutral-700 whitespace-nowrap">Add Custom Item:</span>
              <input
                type="text"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="e.g. Destination Travel & Crew Logistics"
                className="flex-1 px-2.5 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900"
              />
              <input
                type="number"
                min="0"
                step="500"
                value={customItemRate}
                onChange={(e) => setCustomItemRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Rate (₹)"
                className="w-28 px-2.5 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 font-mono tabular-nums"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="px-3.5 py-1.5 bg-[#181818] text-white rounded hover:bg-[#2A2A2A] font-medium whitespace-nowrap"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Section 3: Financial Calculations & Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Notes & Terms */}
            <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs space-y-4">
              <span className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide block pb-2 border-b border-[#F0ECE1]">
                3. Commercial Terms & Production Notes
              </span>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Quotation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD6C8] rounded bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Standard Terms & Conditions</label>
                <textarea
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD6C8] rounded bg-white text-neutral-900 font-mono text-[11px] focus:outline-none focus:border-[#C58B39]"
                />
              </div>
            </div>

            {/* Right: Automated Financial Calculations */}
            <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div>
                <span className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide block pb-2 border-b border-[#F0ECE1]">
                  4. Automated Pricing Calculations
                </span>

                <div className="space-y-2.5 pt-2 text-xs">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between items-center gap-2 pt-1 border-t border-[#F0ECE1]">
                    <div className="flex items-center gap-1.5">
                      <span>Discount:</span>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percentage')}
                        className="px-1.5 py-0.5 border border-[#DCD6C8] rounded bg-white text-[11px]"
                      >
                        <option value="flat">Flat (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-16 px-1.5 py-0.5 border border-[#DCD6C8] rounded text-right font-mono"
                      />
                    </div>
                    <span className="font-mono text-neutral-800 tabular-nums">
                      - ₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center gap-2 pt-1 border-t border-[#F0ECE1]">
                    <div className="flex items-center gap-1.5">
                      <span>Tax / GST:</span>
                      <select
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(Number(e.target.value))}
                        className="px-1.5 py-0.5 border border-[#DCD6C8] rounded bg-white text-[11px]"
                      >
                        <option value={18}>18% GST (Standard)</option>
                        <option value={12}>12% GST</option>
                        <option value={5}>5% GST</option>
                        <option value={0}>0% Tax Exempt</option>
                      </select>
                    </div>
                    <span className="font-mono text-neutral-800 tabular-nums">
                      + ₹{taxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-[#181818] font-serif font-bold text-base text-[#181818]">
                    <span>Grand Total:</span>
                    <span className="font-mono text-lg text-[#C58B39] tabular-nums">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Advance Amount */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#F0ECE1]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-700">Advance Due:</span>
                      <label className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={customAdvance}
                          onChange={(e) => setCustomAdvance(e.target.checked)}
                          className="rounded text-[#C58B39]"
                        />
                        <span>Custom</span>
                      </label>
                    </div>

                    {customAdvance ? (
                      <input
                        type="number"
                        min="0"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                        placeholder={String(Math.round(grandTotal * 0.5))}
                        className="w-28 px-2 py-0.5 border border-[#DCD6C8] rounded text-right font-mono tabular-nums"
                      />
                    ) : (
                      <span className="font-mono font-medium text-neutral-900 tabular-nums">
                        ₹{calculatedAdvance.toLocaleString('en-IN')} (50%)
                      </span>
                    )}
                  </div>

                  {/* Balance Amount */}
                  <div className="flex justify-between items-center pt-1 font-medium text-neutral-800">
                    <span>Balance Due on Shoot:</span>
                    <span className="font-mono text-sm font-bold text-[#D97706] tabular-nums">
                      ₹{balanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-[11px] text-neutral-500">
                Initial quote status will be set as <strong className="text-neutral-800">Draft</strong> or <strong className="text-neutral-800">Sent</strong> upon submission.
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions matching user brief */}
        <div className="p-4 sm:p-5 border-t border-[#E8E3D9] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPreview}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-900 bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#DDD6C8] rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={handleSendQuote}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Send Quote</span>
            </button>
          </div>
        </div>

      </div>

      {/* Embedded Live Preview Modal */}
      {previewQuote && (
        <QuotePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          quote={previewQuote}
        />
      )}
    </div>
  );
};
