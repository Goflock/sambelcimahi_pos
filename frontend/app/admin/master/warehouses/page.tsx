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
