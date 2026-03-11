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
