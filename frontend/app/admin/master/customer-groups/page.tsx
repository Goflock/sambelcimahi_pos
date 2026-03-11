import MasterCrud from '@/components/admin/MasterCrud';

export default function CustomerGroupsPage() {
    return (
        <MasterCrud
            title="Grup Pelanggan"
            endpoint="customer-groups"
            columns={[
                { key: 'name', label: 'Nama Grup' },
                { key: 'discount', label: 'Diskon (%)', render: (val: any) => `${val}%` },
            ]}
            fields={[
                { key: 'name', label: 'Nama Grup', type: 'text', required: true },
                { key: 'discount', label: 'Diskon (%)', type: 'number' },
            ]}
        />
    );
}
