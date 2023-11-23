/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function PeriodoPage () {

    const periodoVacio = {
        Codigo: '',
        Denominacion: '',
        FechaInicio: '',
        FechaFin: '',
        InicioMatricula: '',
        FinMatricula: '',
        Estado: false
    }
    const [periodos, setPeriodos] = useState([periodoVacio])
    const [loading, setLoading] = useState(true)
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [periodo, setPeriodo] = useState(periodoVacio);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchPeriodos = async () => {
        await axios.get('http://localhost:3001/api/periodo')
        .then(response => {
            setPeriodos(response.data.periodos)
            setLoading(false)
        })
        .catch (error => {
            setLoading(false)
            setPeriodos([])
            console.log("Error de carga: ", error)
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Erro en la carga de datos',
                life: 3000
            });
        })
    }

    useEffect(() => {
        fetchPeriodos()
    }, []);

    const openNew = () => {
        setPeriodo(periodoVacio);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

           

            // setProducts(_products);
            // setProductDialog(false);
            // setPeriodo(emptyProduct);
        
    };

    const editProduct = (periodo: any) => {
        setPeriodo({ ...periodo });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (periodo: any) => {
        setPeriodo(periodo);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        // let _products = (products as any)?.filter((val: any) => val.id !== periodo.id);
        // setProducts(_products);
        // setDeleteProductDialog(false);
        // setPeriodo(emptyProduct);
        // toast.current?.show({
        //     severity: 'success',
        //     summary: 'Successful',
        //     detail: 'periodo Deleted',
        //     life: 3000
        // });
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, denominacion: string) => {
        const val = (e.target && e.target.value) || '';
        let _periodo = { ...periodo };
        _periodo.Denominacion = val;

        setPeriodo(_periodo);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} /> */}
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

    const codeBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.Codigo}
            </>
        );
    };

    const nameBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.Denominacion}
            </>
        );
    };

    const dateInicioBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.FechaInicio));
    };

    const dateFinBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.FechaFin));
    };

    const dateInicioMatriculaBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.InicioMatricula));
    };

    const dateFinMatriculaBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.FinMatricula));
    };

    const formatDate = (value: Date) => {
        return value.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const statusBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`periodo-badge status-${rowData.inventoryStatus?.toLowerCase()}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestionar Periodos Académicos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={periodos}                                              
                        dataKey="Codigo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron periodos registrados"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="Codigo" header="Code" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="Denominacion" header="Denominacion" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>                       
                        <Column field='FechaInicio' header="Fecha de inicio" body={dateInicioBodyTemplate} dataType="date" headerStyle={{ minWidth: '10rem' }} />
                        <Column field='FechaFin' header="Fecha de fin" body={dateFinBodyTemplate} dataType="date" headerStyle={{ minWidth: '10rem' }} />
                        <Column field='InicioMatricula' header="Inicio matrículas" body={dateInicioBodyTemplate} dataType="date" headerStyle={{ minWidth: '10rem' }} />
                        <Column field='FinMatricula' header="Fin matrículas" body={dateFinMatriculaBodyTemplate} dataType="date" headerStyle={{ minWidth: '10rem' }} />
                        <Column field="Estado" header="Estado" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="periodo Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>                        
                        <div className="field">
                            <label htmlFor="denominacion">Denominación</label>
                            <InputText
                                id="denominacion"
                                value={periodo.Denominacion}
                                onChange={(e) => onInputChange(e, 'denominacion')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !periodo.Denominacion
                                })}
                            />
                            {submitted && !periodo.Denominacion && <small className="p-invalid">Name is required.</small>}
                        </div>
                                                                      
                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {periodo && (
                                <span>
                                    {/* Are you sure you want to delete <b>{periodo.name}</b>? */}
                                </span>
                            )}
                        </div>
                    </Dialog>                   
                </div>
            </div>
        </div>
    );
};


