'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { redirect } from 'next/navigation';

export default function Page () {
    const EmptyPago = {
        Codigo: 0,
        NroTransaccion: '',
        Fecha: '',
        EstadoPago: '',
        Estudiante: { CodigoSunedu: '' },
        ConceptoPago: { Codigo: 0, Denominacion: '', Monto: 0 }
    };

    const { data: session, status } = useSession();
    const [pagosM, setPagosM] = useState([EmptyPago]);
    const [pagosO, setPagosO] = useState([EmptyPago]);
    const dt = useRef<DataTable<any>>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchPagos();
        }
    }, [status]);

    const fetchPagos = async () => {
        await axios
            .get('/pago/estudiante', {
                params: {
                    codigo: session?.user.codigoEstudiante
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                console.log(response.data);
                let _pagosM = response.data.pagos.filter((x: any) => x.CodigoConceptoPago == '0802');
                let _pagosO = response.data.pagos.filter((x: any) => x.ConceptoPago.Codigo != '0802');
                setPagosM(_pagosM);
                setPagosO(_pagosO);
            })
            .catch((error) => {
                console.log('Error en carga de pagos: ', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            });
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        });
    };

    const estadoBodyTemplate = (rowData: any) => {
        const id = `tooltip-${rowData.Codigo}`;
        let tooltipContent = '';

        switch (rowData.EstadoPago) {
            case 'R':
                tooltipContent = 'Regular';
                break;
            case 'A':
                tooltipContent = 'Anulado';
                break;
            case 'U':
                tooltipContent = 'Utilizado';
                break;
            default:
                tooltipContent = 'Estado desconocido';
        }
    
        return (
            <React.Fragment>
                <span id={id} className={`pago-badge status-${rowData.EstadoPago.toLowerCase()}`}>
                    {rowData.EstadoPago}
                </span>
                <Tooltip target={`#${id}`} position="top" content={tooltipContent} />
            </React.Fragment>
        );
    };

    const montoBodyTemplate = (rowData: any) => {
        return formatCurrency(Number.parseInt(rowData.ConceptoPago.Monto));
    };

    if (status === 'loading') {
        return (
            <>
                <div className="flex items-center justify-center align-content-center" style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        );
    }

    if (session?.user.nivelUsuario != 4) {
        redirect('/pages/notfound')
    }

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className="m-3 mt-4">INFORMACIÓN DE PAGOS</h5>
            </div>
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <h5 className="mt-0" style={{ color: 'blue' }}>
                        {' '}
                        <i className="pi pi-book"></i> Matrículas
                    </h5>
                    <DataTable
                        ref={dt}
                        value={pagosM}
                        dataKey="Codigo"
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                        emptyMessage="No se encontraron pagos"
                        responsiveLayout="scroll"
                    >
                        <Column sortable field="Fecha" header="Fecha" />
                        <Column sortable field="ConceptoPago.Denominacion" header="Concepto" />
                        <Column sortable field="ConceptoPago.Monto" header="Monto" body={montoBodyTemplate} />
                        <Column field="NroTransaccion" header="Nro. Transaccion" />
                        <Column sortable field="EstadoPago" header="Estado" body={estadoBodyTemplate} />
                    </DataTable>

                    <h5 className="mt-5" style={{ color: 'blue' }}>
                        {' '}
                        <i className="pi pi-credit-card"></i> Otros
                    </h5>
                    <Toast ref={toast} />
                    <DataTable
                        ref={dt}
                        value={pagosO}
                        dataKey="Codigo"
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                        emptyMessage="No se encontraron pagos"
                        responsiveLayout="scroll"
                    >
                        <Column sortable field="Fecha" header="Fecha" />
                        <Column sortable field="ConceptoPago.Denominacion" header="Concepto" />
                        <Column sortable field="ConceptoPago.Monto" header="Monto" body={montoBodyTemplate} />
                        <Column field="Nrotransaccion" header="Nro. Transacción" />
                        <Column sortable field="EstadoPago" header="Estado" body={estadoBodyTemplate} />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};


