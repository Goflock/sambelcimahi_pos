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
