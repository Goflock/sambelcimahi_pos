#!/bin/bash

# Brands
mkdir -p app/admin/master/brands
cat > app/admin/master/brands/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function BrandsPage() {
    return (
        <MasterCrud
            title="Daftar Brand"
            endpoint="brands"
            columns={[
                { key: 'name', label: 'Nama' },
                { key: 'description', label: 'Deskripsi' },
            ]}
            fields={[
                { key: 'name', label: 'Nama Brand', type: 'text', required: true },
                { key: 'description', label: 'Deskripsi', type: 'textarea' },
            ]}
        />
    );
}
EOF

# Units
mkdir -p app/admin/master/units
cat > app/admin/master/units/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function UnitsPage() {
    return (
        <MasterCrud
            title="Satuan Unit"
            endpoint="units"
            columns={[
                { key: 'name', label: 'Nama' },
                { key: 'symbol', label: 'Simbol' },
            ]}
            fields={[
                { key: 'name', label: 'Nama Unit', type: 'text', required: true },
                { key: 'symbol', label: 'Simbol (kg, pcs)', type: 'text' },
            ]}
        />
    );
}
EOF

# Warehouses
mkdir -p app/admin/master/warehouses
cat > app/admin/master/warehouses/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function WarehousesPage() {
    return (
        <MasterCrud
            title="Gudang"
            endpoint="warehouses"
            columns={[
                { key: 'name', label: 'Nama Gudang' },
                { key: 'address', label: 'Alamat' },
            ]}
            fields={[
                { key: 'name', label: 'Nama Gudang', type: 'text', required: true },
                { key: 'address', label: 'Alamat', type: 'textarea' },
            ]}
        />
    );
}
EOF

# Taxes
mkdir -p app/admin/master/taxes
cat > app/admin/master/taxes/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function TaxesPage() {
    return (
        <MasterCrud
            title="Pajak"
            endpoint="taxes"
            columns={[
                { key: 'name', label: 'Nama Pajak' },
                { key: 'rate', label: 'Persentase (%)', render: (val: any) => \`\${val}%\` },
                { key: 'isDefault', label: 'Default', render: (val: any) => val ? 'Ya' : 'Tidak' },
            ]}
            fields={[
                { key: 'name', label: 'Nama Pajak', type: 'text', required: true },
                { key: 'rate', label: 'Rate (%)', type: 'number', required: true },
                { key: 'isDefault', label: 'Set sebagai Default', type: 'checkbox' },
            ]}
        />
    );
}
EOF

# Currencies
mkdir -p app/admin/master/currencies
cat > app/admin/master/currencies/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function CurrenciesPage() {
    return (
        <MasterCrud
            title="Mata Uang"
            endpoint="currencies"
            columns={[
                { key: 'code', label: 'Kode' },
                { key: 'name', label: 'Nama' },
                { key: 'symbol', label: 'Simbol' },
                { key: 'rate', label: 'Rate' },
            ]}
            fields={[
                { key: 'code', label: 'Kode (IDR, USD)', type: 'text', required: true },
                { key: 'name', label: 'Nama Mata Uang', type: 'text', required: true },
                { key: 'symbol', label: 'Simbol (Rp, $)', type: 'text', required: true },
                { key: 'rate', label: 'Exchange Rate', type: 'number', required: true },
            ]}
        />
    );
}
EOF

# Customer Groups
mkdir -p app/admin/master/customer-groups
cat > app/admin/master/customer-groups/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function CustomerGroupsPage() {
    return (
        <MasterCrud
            title="Grup Pelanggan"
            endpoint="customer-groups"
            columns={[
                { key: 'name', label: 'Nama Grup' },
                { key: 'discount', label: 'Diskon (%)', render: (val: any) => \`\${val}%\` },
            ]}
            fields={[
                { key: 'name', label: 'Nama Grup', type: 'text', required: true },
                { key: 'discount', label: 'Diskon (%)', type: 'number' },
            ]}
        />
    );
}
EOF

# Discounts (Marketing)
mkdir -p app/admin/marketing/discounts
cat > app/admin/marketing/discounts/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function DiscountsPage() {
    return (
        <MasterCrud
            title="Diskon & Promosi"
            endpoint="discounts"
            columns={[
                { key: 'name', label: 'Nama Promo' },
                { key: 'type', label: 'Tipe' },
                { key: 'value', label: 'Nilai' },
                { key: 'isActive', label: 'Status', render: (val: any) => val ? 'Aktif' : 'Nonaktif' },
                { key: 'startDate', label: 'Mulai', render: (val: any) => new Date(val).toLocaleDateString() },
            ]}
            fields={[
                { key: 'name', label: 'Nama Promo', type: 'text', required: true },
                { 
                    key: 'type', 
                    label: 'Tipe Diskon', 
                    type: 'select', 
                    required: true,
                    options: [
                        { label: 'Persentase', value: 'PERCENTAGE' },
                        { label: 'Nominal Tetap', value: 'FIXED_AMOUNT' }
                    ]
                },
                { key: 'value', label: 'Nilai Diskon', type: 'number', required: true },
                { key: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true }, // Simple usage, might need better date picker
                { key: 'endDate', label: 'Tanggal Berakhir', type: 'date' },
                { key: 'isActive', label: 'Aktif', type: 'checkbox' },
            ]}
        />
    );
}
EOF

# Roles (User Management)
mkdir -p app/admin/users/roles
cat > app/admin/users/roles/page.tsx <<EOF
import MasterCrud from '@/components/admin/MasterCrud';

export default function RolesPage() {
    return (
        <MasterCrud
            title="Manajemen Role"
            endpoint="roles"
            columns={[
                { key: 'name', label: 'Nama Role' },
                { key: 'description', label: 'Deskripsi' },
            ]}
            fields={[
                { key: 'name', label: 'Nama Role', type: 'text', required: true },
                { key: 'description', label: 'Deskripsi', type: 'textarea' },
            ]}
        />
    );
}
EOF
