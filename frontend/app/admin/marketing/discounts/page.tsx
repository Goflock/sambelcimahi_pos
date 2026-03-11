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
