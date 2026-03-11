import MasterCrud from '@/components/admin/MasterCrud';

export default function TaxesPage() {
    return (
        <MasterCrud
            title="Pajak"
            endpoint="taxes"
            columns={[
                { key: 'name', label: 'Nama Pajak' },
                { key: 'rate', label: 'Persentase (%)', render: (val: any) => `${val}%` },
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
