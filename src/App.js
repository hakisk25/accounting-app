import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simple currency/number helpers
const toNumber = (v) => {
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const FieldLabel = ({ htmlFor, children, required }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1 select-none"
  >
    {children} {required && <span className="text-red-600">*</span>}
  </label>
);

const Input = ({ id, type = "text", required, ...props }) => (
  <input
    id={id}
    type={type}
    required={required}
    className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 px-3 py-2 outline-none transition shadow-sm"
    {...props}
  />
);

const Textarea = ({ id, required, ...props }) => (
  <textarea
    id={id}
    required={required}
    className="w-full rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 px-3 py-2 outline-none transition shadow-sm min-h-[92px]"
    {...props}
  />
);

const DateInput = ({ id, required, value, onChange }) => {
  return (
    <div className="relative">
      <Input id={id} type="date" required={required} value={value} onChange={onChange} />
      {/* Calendar icon */}
    
    </div>
  );
};

const Dropzone = ({ file, setFile }) => {
  const inputRef = useRef(null);
  const [isDragOver, setDragOver] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "rounded-xl border-2 border-dashed p-4 transition cursor-pointer bg-gray-50",
          isDragOver ? "border-gray-900 bg-gray-100" : "border-gray-300",
        ].join(" ")}
        aria-label="Upload or take a photo of receipt"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-500">
              <path d="M9 2a1 1 0 0 0-1 1v1H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-2V3a1 1 0 1 0-2 0v1H10V3a1 1 0 0 0-1-1Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800">Upload / Take Photo of Receipt</p>
            <p>Drag & drop, click to select, or use camera.</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to ~10MB</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={URL.createObjectURL(file)}
                alt="Receipt preview"
                className="h-12 w-12 rounded object-cover border"
              />
              <div className="truncate text-sm">
                <div className="truncate font-medium text-gray-800">{file.name}</div>
                <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-sm text-gray-700 hover:text-black px-2 py-1 rounded-md border border-gray-300"
            >
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const initialState = {
  vendor: "",
  date: "",
  billRef: "",
  description: "",
  accountCode: "",
  quantity: "",
  amount: "",
  taxes: "",
};

const STORAGE_KEY = "accounting-app:draft";

export default function AccountingApp() {
  const [form, setForm] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : initialState;
    } catch {
      return initialState;
    }
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const total = useMemo(() => {
    const qty = toNumber(form.quantity);
    const amt = toNumber(form.amount);
    const tax = toNumber(form.taxes);
    return (qty * amt + tax).toFixed(2);
  }, [form.quantity, form.amount, form.taxes]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setToast({ type: "success", message: "Draft saved locally." });
  };

  const validate = () => {
    // Simple validation for required fields
    const requiredKeys = [
      "vendor",
      "date",
      "billRef",
      "description",
      "accountCode",
      "quantity",
      "amount",
      "taxes",
    ];
    const missing = requiredKeys.filter((k) => !String(form[k]).trim());
    if (missing.length) {
      setToast({ type: "error", message: `Please fill all required fields.` });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setToast({ type: "success", message: "Expense submitted." });
    // Clear draft but keep file preview intact intentionally
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Accounting App</h1>
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="mb-4 text-base font-semibold">New Expense / Receipt</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Vendor */}
            <div>
              <FieldLabel htmlFor="vendor" required>
                Vendor
              </FieldLabel>
              <Input id="vendor" required value={form.vendor} onChange={update("vendor")} placeholder="e.g., ACME Supplies" />
            </div>

            {/* Date */}
            <div>
              <FieldLabel htmlFor="date" required>
                Date
              </FieldLabel>
              <DateInput id="date" required value={form.date} onChange={update("date")} />
            </div>

            {/* Bill Reference */}
            <div className="md:col-span-2">
              <FieldLabel htmlFor="billRef" required>
                Bill Reference
              </FieldLabel>
              <Input id="billRef" required value={form.billRef} onChange={update("billRef")} placeholder="Invoice #, PO #, etc." />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <FieldLabel htmlFor="description" required>
                Description
              </FieldLabel>
              <Textarea id="description" required value={form.description} onChange={update("description")} placeholder="What is this expense for?" />
            </div>

            {/* Account Code */}
            <div>
              <FieldLabel htmlFor="accountCode" required>
                Account Code
              </FieldLabel>
              <Input id="accountCode" required value={form.accountCode} onChange={update("accountCode")} placeholder="e.g., 6001" />
            </div>

            {/* Quantity */}
            <div>
              <FieldLabel htmlFor="quantity" required>
                Quantity
              </FieldLabel>
              <Input id="quantity" type="number" min="0" step="1" required value={form.quantity} onChange={update("quantity")} />
            </div>

            {/* Amount */}
            <div>
              <FieldLabel htmlFor="amount" required>
                Amount
              </FieldLabel>
              <Input id="amount" type="number" min="0" step="0.01" required value={form.amount} onChange={update("amount")} placeholder="Unit price" />
            </div>

            {/* Taxes */}
            <div>
              <FieldLabel htmlFor="taxes" required>
                Taxes
              </FieldLabel>
              <Input id="taxes" type="number" min="0" step="0.01" required value={form.taxes} onChange={update("taxes")} placeholder="Tax amount" />
            </div>

            {/* Upload / Take Photo */}
            <div className="md:col-span-2">
              <FieldLabel htmlFor="receipt">Upload / Take Photo of Receipt</FieldLabel>
              <Dropzone file={file} setFile={setFile} />
            </div>

            {/* Summary (optional, derived) */}
            <div className="md:col-span-2 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-500">All fields marked <span className="text-red-600">*</span> are required.</div>
              <div className="text-sm font-medium">Estimated total: <span className="tabular-nums">${total}</span></div>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex gap-3 pt-1">
              <motion.button
                type="button"
                onClick={handleSave}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              >
                Save
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onAnimationComplete={() => {
              // auto hide after 2.2s
              setTimeout(() => setToast(null), 2200);
            }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div
              className={`rounded-full px-4 py-2 text-sm shadow-lg ${
                toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"
              }`}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
