/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../../demo/service/ProductService';
import { Demo } from '../../../../types/types';
import axios from 'axios';
import { classNames } from 'primereact/utils';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function AsistenciasPage() {

    let codigoSesion = '1014P3203252'
    let codigoCursoCalificacion = 'M1103252'

    let emptyProduct: Demo.Product = {
        id: '',
        name: '',
        image: '',
        description: '',
        category: '',
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };

    const [products, setProducts] = useState(null);
    const [estudiantes, setEstudiantes] = useState<Array<any>>([])
    const [product, setProduct] = useState<Demo.Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchMatriculados = async () => {
        await axios.get('http://localhost:3001/api/curso-calificacion/matriculados', {
            params: { codigoCursoCalificacion: codigoCursoCalificacion }
        })
            .then(response => {
                setEstudiantes(response.data.matriculados)
            })
            .catch(error => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'La lista de estudiantes matriculados no se ha podido cargar',
                    life: 3000
                })
            })
    }

    useEffect(() => {
        fetchMatriculados()
    }, []);


    const saveProduct = () => {

    };

    const editProduct = (product: Demo.Product) => {
        setProduct({ ...product });

    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Resgistrar todos" icon="pi pi-plus" severity="success" className=" mr-2" />
                </div>
            </React.Fragment>
        );
    };


    const nameBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Name</span> 
                {rowData.Estudiante.Persona.Nombres + ' ' + rowData.Estudiante.Persona.Paterno + ' ' + rowData.Estudiante.Persona.Materno}
            </>
        );
    };

    const asistenciaBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Category</span>
                <span>{rowData.PorcentajeAsistencia} %</span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Habilitado, 'text-red-500 pi-times-circle': !rowData.Habilitado })}></i>;
    };

    const actionBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <Button icon="pi pi-check" label='Marcar' size='small' severity="success" className="mr-2 px-2 py-1" onClick={() => editProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Registro de asistencias</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={estudiantes}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage="No se han encontrado estudiantes"
                        header={header}
                    >
                        <Column field="Estudiante.Codigo" header="Código" headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="Nombres" header="Estudiante" body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="category" header="Asistencias" body={asistenciaBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="Matriculas.Habilitado" header="Estado" body={statusBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                </div>
            </div>
        </div>
    );
};