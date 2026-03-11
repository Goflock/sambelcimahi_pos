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
