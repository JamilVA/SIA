/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import Link from 'next/link';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';

export default function RegistrarPagoPage () {

    const pagoVacio = {
        Codigo: 0,
        NroTransaccion: '',
        Fecha: '',
        EstadoPago: '',
        Estudiante: { CodigoSunedu: '' },
        ConceptoPago: { Codigo: 0, Denominacion: '', Monto: 0 }
    }

    const [conceptos, setConceptos] = useState<Array<any>>([])

    const estados = ['r', 'a', 'u'];

    const [pagos, setPagos] = useState([pagoVacio])
    const [anularPagoDialog, setAnularPagoDialog] = useState(false);
    const [codigoAnular, setCodigoAnular] = useState(0);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchPagos = async () => {
        await axios("http://localhost:3001/api/pago")
            .then(response => {
                console.log(response.data.pagos)
                setPagos(response.data.pagos)
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setPagos([]);
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Erro en la carga de datos',
                    life: 3000
                });
            })
    }

    const fetchConceptos = async () => {
        await axios("http://localhost:3001/api/pago/conceptos")
            .then(response => {
                setConceptos(response.data.conceptos)
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los conceptos de pago',
                    life: 3000
                });
            })
    }

    useEffect(() => {
        fetchPagos();
        fetchConceptos()
        initFilters();
    }, []);

    const hideDeleteProductDialog = () => {
        setAnularPagoDialog(false);
    };

    const confirmAnularPago = (rowData: any) => {
        setCodigoAnular(rowData.Codigo)
        setAnularPagoDialog(true);
    };

    const anularPago = async () => {
        await axios.put('http://localhost:3001/api/pago', {
            codigo: codigoAnular
        }).then(response => {
            console.log("Pago anulado: ", response.data)
            const newData = pagos.map(pago => {
                if (pago.Codigo === codigoAnular) {
                    return {
                        ...pago,
                        EstadoPago: 'A'
                    };
                } else {
                    return pago;
                }

            });
            setPagos(newData);
            toast.current?.show({
                severity: 'success',
                summary: 'Operación exitosa',
                detail: 'El pago ha sido anulado',
                life: 3000
            });
        }).catch(error => {
            console.log("Ha ocurrido un error: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Operación fallida',
                detail: 'Ha ocurrido un error al intentar anular el pago',
                life: 3000
            });
        })

        setAnularPagoDialog(false);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Link href='/tesoreria/pagos/registrar'>
                        <Button label="Registrar pago" icon="pi pi-plus" severity="success" className=" mr-2" />
                    </Link>
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return <Button icon="pi pi-times" rounded severity="warning" onClick={() => confirmAnularPago(rowData)} />
    };

    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={anularPago} />
        </>
    );

    const clearFilter1 = () => {
        initFilters();
    };

    const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter1} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange1} placeholder="Keyword Search" />
                </span>
            </div>
        );
    };

    const formatDate = (value: Date) => {
        return value.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        });
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            'ConceptoPago.Denominacion': {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            Fecha: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
            },
            EstadoPago: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },       
        });
        setGlobalFilterValue('');
    };

    const conceptoFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Dropdown
            value={options.value}
            options={conceptos}
            optionLabel='Denominacion'
            optionValue='Denominacion'
            onChange={(e) => options.filterCallback(e.value, options.index)}
            placeholder="Concepto"
            className="p-column-filter"
            showClear />;
    };

    const dateBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.Fecha));
    };

    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" mask="99/99/9999" />;
    };

    const montoBodyTemplate = (rowData: any) => {
        return formatCurrency(Number.parseInt(rowData.ConceptoPago.Monto));
    };

    const estadoBodyTemplate = (rowData: any) => {
        return <span className={`pago-badge status-${rowData.EstadoPago.toLowerCase()}`}>{rowData.EstadoPago}</span>;
    };

    const estadoFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Dropdown value={options.value} options={estados} onChange={(e) => options.filterCallback(e.value, options.index)} itemTemplate={estadoItemTemplate} placeholder="Select a Status" className="p-column-filter" showClear />;
    };

    const estadoItemTemplate = (option: any) => {
        return <span className={`pago-badge status-${option}`}>{option}</span>;
    };

    const header1 = renderHeader1();

    return (

        <div className="col-12">
            <h2>Gestión de Pagos</h2>
            <div>
                <Toast ref={toast} />
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable
                    value={pagos}
                    paginator
                    className="p-datatable-gridlines"
                    showGridlines
                    rows={10}
                    dataKey="Codigo"
                    filters={filters}
                    filterDisplay="menu"
                    loading={loading}
                    emptyMessage="Ningún pago encontrado"
                    header={header1}
                >
                    <Column field='Codigo' header="Cod." sortable style={{ minWidth: '6rem' }} />
                    <Column field='NroTransaccion' header="Nro. Transaccion" sortable style={{ minWidth: '12rem' }} />
                    <Column field='Fecha' header="Fecha" body={dateBodyTemplate} showFilterMenuOptions={false} filterField="Fecha" dataType="date" style={{ minWidth: '12rem' }} filter filterElement={dateFilterTemplate} />
                    <Column field="EstadoPago" header="Estado" body={estadoBodyTemplate} showFilterMenuOptions={false} filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '8rem' }} filter filterElement={estadoFilterTemplate} />
                    <Column field="Estudiante.CodigoSunedu" header="Cód. Estudiante" style={{ minWidth: '10rem' }} />
                    <Column
                        header="Concepto"
                        filterField="ConceptoPago.Denominacion"
                        showFilterMenuOptions={false}
                        filterMenuStyle={{ width: '14rem' }}
                        style={{ minWidth: '10rem' }}
                        field='ConceptoPago.Denominacion'
                        filter
                        filterElement={conceptoFilterTemplate}
                    />
                    <Column field='ConceptoPago.Monto' header="Monto" body={montoBodyTemplate} style={{ minWidth: '8rem' }} />
                    <Column body={actionBodyTemplate} headerStyle={{ minWidth: '4rem' }}></Column>
                </DataTable>

                <Dialog visible={anularPagoDialog} style={{ width: '450px' }} header="Anular pago" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                    <div className="flex align-items-center justify-content-center">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />

                        <span>
                            ¿Está seguro de que desea anular el pago?
                        </span>

                    </div>
                </Dialog>

            </div>
        </div>

    );
};
