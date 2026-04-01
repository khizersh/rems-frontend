# Vendor Payment Module

This module handles payments made against vendor invoices in the Purchase Management flow.

## Flow
```
Purchase Order → GRN → Vendor Invoice → Vendor Payment
```

## Components

### VendorPaymentList.js
Main listing page showing all vendor payments with:
- Summary cards (total payments, total amount)
- Filter by vendor
- Paginated table with payment details
- View payment detail modal

### CreateVendorPayment.js
Payment creation form with:
- Invoice selection (only UNPAID/PARTIAL invoices)
- Payment amount validation against pending amount
- Organization account selection with balance check
- Payment mode, reference number, date, remarks
- Invoice summary panel with payment progress

## Routes
- `/dashboard/vendor-invoice-payments` - Payment listing
- `/dashboard/vendor-invoice-payment` - Create new payment
- `/dashboard/vendor-invoice-payment?invoiceId=123` - Create payment for specific invoice

## API Endpoints Used
- `POST /vendorPaymentPO/create` - Create payment
- `GET /vendorPaymentPO/getById/{id}` - Get payment by ID
- `GET /vendorPaymentPO/getByInvoice/{invoiceId}` - Get payments for invoice
- `POST /vendorPaymentPO/getByVendor/{vendorId}` - Get payments by vendor (paginated)
- `POST /vendorPaymentPO/{orgId}/getAll` - Get all payments (paginated)
- `GET /vendorPaymentPO/getTotalPaid/{invoiceId}` - Get payment summary
- `PUT /vendorPaymentPO/update/{paymentId}` - Update payment

## Service Methods
All API calls are handled through `PurchaseManagementService.js`:
- `createVendorPayment(paymentData)`
- `getVendorPaymentById(paymentId)`
- `getPaymentsByInvoice(invoiceId)`
- `getPaymentsByVendor(vendorId, paginationParams)`
- `getAllVendorPayments(orgId, paginationParams)`
- `getTotalPaidForInvoice(invoiceId)`
- `updateVendorPayment(paymentId, paymentData)`

## Integration with VendorInvoiceList
- "Make Payment" action added to invoice rows (for UNPAID/PARTIAL invoices)
- "View Payments" button added to navigate to payment listing

## Features
- Client-side validation for payment amount
- Account balance verification before payment
- Payment progress visualization
- Quick-fill buttons for 100%, 50%, 25% of pending amount
- Responsive design for mobile and desktop
