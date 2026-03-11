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
