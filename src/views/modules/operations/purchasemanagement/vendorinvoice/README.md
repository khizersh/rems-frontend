# Vendor Invoice Management Module

This module provides a comprehensive vendor invoice management system for the Real Estate ERP system. It includes functionality for creating, viewing, and managing vendor invoices based on Goods Receipt Notes (GRNs).

## Features

### 1. **VendorInvoiceDashboard** 
- Overview dashboard with statistics and quick actions
- Statistics: Total invoices, pending amounts, payment status breakdown
- Quick navigation to all invoice-related functionalities

### 2. **VendorInvoiceList**
- Display all vendor invoices with pagination
- Filter invoices by:
  - Organization (all invoices)
  - Vendor (specific vendor invoices)
  - Status (UNPAID, PARTIAL, PAID)
- View invoice details in a modal popup
- Actions: View details, create new invoice
- Navigate to pending payment summary

### 3. **CreateVendorInvoice**
- Create new vendor invoices from approved GRNs
- Dynamic form with:
  - Invoice basic information (invoice number, dates, vendor, project)
  - GRN selection based on vendor/project filters
  - Invoice items with quantity, rate, and amount calculations
  - Payment status tracking (UNPAID, PARTIAL, PAID)
- Auto-calculation of totals and pending amounts
- Form validation and error handling

### 4. **VendorInvoiceDetails**
- Comprehensive invoice details view
- Shows invoice information, vendor details, project details
- Displays invoice items in a table format
- Payment history tracking
- Options to create payments and print invoices
- Audit trail information

### 5. **VendorInvoicePendingSummary**
- Summary view of all vendors with pending payments
- Statistics cards showing overall pending status
- Table showing vendor-wise pending amounts
- Quick navigation to vendor-specific invoices
- Total pending amount calculation across all vendors

## API Integration

The module integrates with the following APIs from the Vendor Invoice API documentation:

### Core APIs Used:
- `POST /api/vendorInvoice/create` - Create new invoice
- `GET /api/vendorInvoice/getById/{id}` - Get invoice details
- `POST /api/vendorInvoice/{orgId}/getAll` - Get all invoices by organization
- `POST /api/vendorInvoice/getByVendor/{vendorId}` - Get invoices by vendor
- `POST /api/vendorInvoice/{orgId}/getByStatus/{status}` - Get invoices by status
- `GET /api/vendorInvoice/getPendingAmount/{vendorId}` - Get vendor pending amount

### Supporting APIs:
- Vendor APIs for vendor information
- Project APIs for project information  
- GRN APIs for goods receipt note data
- Payment APIs for payment history

## File Structure

```
vendorinvoice/
├── VendorInvoiceDashboard.js     # Main dashboard with overview
├── VendorInvoiceList.js          # List all invoices with filtering
├── CreateVendorInvoice.js        # Create new invoice form
├── VendorInvoiceDetails.js       # Detailed invoice view
├── VendorInvoicePendingSummary.js # Pending payment summary
├── index.js                      # Component exports
└── README.md                     # This documentation
```

## Usage & Integration

### 1. Import Components
```javascript
import {
  VendorInvoiceDashboard,
  VendorInvoiceList,
  CreateVendorInvoice,
  VendorInvoiceDetails,
  VendorInvoicePendingSummary
} from '../views/modules/operations/purchasemanagement/vendorinvoice';
```

### 2. Router Integration
Add these routes to your React Router configuration:

```javascript
// In your main router file
import { 
  VendorInvoiceDashboard,
  VendorInvoiceList,
  CreateVendorInvoice,
  VendorInvoiceDetails,
  VendorInvoicePendingSummary
} from '../views/modules/operations/purchasemanagement/vendorinvoice';

// Add routes
<Route path="/dashboard/vendor-invoice-dashboard" component={VendorInvoiceDashboard} />
<Route path="/dashboard/vendor-invoices" component={VendorInvoiceList} />
<Route path="/dashboard/create-vendor-invoice" component={CreateVendorInvoice} />
<Route path="/dashboard/vendor-invoice-details/:invoiceId" component={VendorInvoiceDetails} />
<Route path="/dashboard/vendor-invoice-pending-summary" component={VendorInvoicePendingSummary} />
```

### 3. Navigation Links
Add navigation menu items:

```javascript
// In your sidebar/navigation component
const menuItems = [
  {
    title: "Vendor Invoice Dashboard",
    path: "/dashboard/vendor-invoice-dashboard",
    icon: FaFileInvoiceDollar
  },
  {
    title: "All Vendor Invoices", 
    path: "/dashboard/vendor-invoices",
    icon: FaList
  },
  {
    title: "Create Invoice",
    path: "/dashboard/create-vendor-invoice", 
    icon: FaPlus
  },
  {
    title: "Pending Payments",
    path: "/dashboard/vendor-invoice-pending-summary",
    icon: FaChartBar
  }
];
```

## Dependencies

### Required Services:
- `PurchaseManagementService.js` - For all invoice-related API calls
- `httpService.js` - For additional API calls (vendors, projects, etc.)

### Required Contexts:
- `MainContext.js` - For loading states and notifications

### Required Components:
- `DynamicTableComponent.js` - For data tables
- Various React Icons (FaFileInvoiceDollar, FaPlus, FaEye, etc.)

### Required Libraries:
- React Router for navigation
- React hooks (useState, useEffect, useContext)

## Key Features Implementation

### 1. **Status Management**
The system handles three invoice statuses:
- **UNPAID**: No payment received (paidAmount = 0)
- **PARTIAL**: Partial payment received (0 < paidAmount < totalAmount)  
- **PAID**: Full payment received (paidAmount >= totalAmount)

### 2. **Auto-calculations**
- Pending Amount = Total Amount - Paid Amount
- Status is automatically determined based on paid amount
- Invoice item amounts are calculated from quantity × rate

### 3. **Filtering & Search**
- Filter by organization, vendor, or status
- Pagination support for large datasets
- Dynamic vendor list based on organization

### 4. **Responsive Design**
- Mobile-friendly responsive layout
- Tailwind CSS for consistent styling
- Modal popups for detailed views

### 5. **Error Handling**
- Form validation with user-friendly error messages
- API error handling with notifications
- Loading states during data fetching

## Security & Data Flow

### Authentication:
- JWT token authentication for all API calls
- Organization-based data filtering
- User audit trail on all operations

### Data Flow:
1. User selects organization → filters data by orgId
2. Create invoice → requires GRN, vendor, project selection
3. Invoice items → populated from GRN items
4. Payment tracking → updates paid amounts and status
5. Pending amounts → calculated and aggregated for reporting

## Customization

### Styling:
- Uses Tailwind CSS classes
- Color schemes can be modified in component files
- Icons can be replaced with different React Icon sets

### Functionality:
- Additional filters can be added to list views
- Custom validation rules can be added to forms
- New reporting views can be created following the same patterns

### API Integration:
- Additional endpoints can be integrated by updating PurchaseManagementService.js
- Custom business logic can be added to individual components

This module provides a complete vendor invoice management solution that integrates seamlessly with the existing Real Estate ERP system architecture.