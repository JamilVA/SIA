'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Fieldset } from 'primereact/fieldset';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import axios from 'axios';

const Page = () => {

    const EmptyPago = {
        Codigo: 0,
        NumeroComprobante: '',
        Fecha: '',
        EstadoPago: '',
        Estudiante: { CodigoSunedu: '' },
        ConceptoPago: { Codigo: 0, Denominacion: '', Monto: 0 },
    }

    const [pagosM, setPagosM] = useState([EmptyPago]);
    const [pagosO, setPagosO] = useState([EmptyPago]);
    const dt = useRef<DataTable<any>>(null);
    const toast = useRef<Toast>(null);

    const d = {
        codigo: 4
    }

    useEffect(() => {
        fetchPagos(d);
    }, []);

    const fetchPagos = async (data: object) => {
        await axios.post("http://127.0.0.1:3001/api/pago/estudiante", data).then(response => {
            console.log(response.data);
            let _pagosM = response.data.pagos.filter((x: any) => x.ConceptoPago.Codigo == 1);
            let _pagosO = response.data.pagos.filter((x: any) => x.ConceptoPago.Codigo != 1);
            setPagosM(_pagosM);
            setPagosO(_pagosO);
        })
            .catch(error => {
                console.log("Error en carga de pagos: ", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            })
    }

    const formatCurrency = (value: number) => {
        return value.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        });
    };

    const estadoBodyTemplate = (rowData: any) => {
        return <span className={`pago-badge status-${rowData.EstadoPago.toLowerCase()}`}>{rowData.EstadoPago}</span>;
    };

    const montoBodyTemplate = (rowData: any) => {
        return formatCurrency(Number.parseInt(rowData.ConceptoPago.Monto));
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                        
                    <Fieldset legend="Matrículas" toggleable>
                        <Toast ref={toast} />
                        <DataTable
                            ref={dt}
                            value={pagosM}
                            dataKey="Codigo"
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                            emptyMessage="No payments found."
                            responsiveLayout="scroll"
                        >
                            <Column field="Nombre" header="N°" />
                            <Column field="Fecha" header="Fecha" />
                            <Column field="ConceptoPago.Denominacion" header="Concepto" />
                            <Column field="ConceptoPago.Monto" header="Monto" body={montoBodyTemplate} />
                            <Column field="NumeroComprobante" header="Comprobante" />
                            <Column field="EstadoPago" header="Estado" body={estadoBodyTemplate} />
                        </DataTable>
                    </Fieldset>

                    <Fieldset className='mt-5' legend="Otros" toggleable>
                        <Toast ref={toast} />
                        <DataTable
                            ref={dt}
                            value={pagosO}
                            dataKey="Codigo"
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                            emptyMessage="No payments found."
                            responsiveLayout="scroll"
                        >
                            <Column field="Nombre" header="N°" />
                            <Column field="Fecha" header="Fecha" />
                            <Column field="ConceptoPago.Denominacion" header="Concepto" />
                            <Column field="ConceptoPago.Monto" header="Monto" body={montoBodyTemplate} />
                            <Column field="NumeroComprobante" header="Comprobante" />
                            <Column field="EstadoPago" header="Estado" body={estadoBodyTemplate} />
                        </DataTable>
                    </Fieldset>
                </div>
            </div>
        </div>
    )
}

export default Page;