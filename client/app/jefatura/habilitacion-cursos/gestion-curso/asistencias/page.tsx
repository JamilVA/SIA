/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { axiosInstance as axios } from '../../../../../utils/axios.instance';
import { classNames } from 'primereact/utils';
import { ProgressBar } from 'primereact/progressbar';
import { Checkbox } from 'primereact/checkbox';
import { redirect, useSearchParams } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSession } from "next-auth/react";

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function AsistenciasPage() {

    const searchParams = useSearchParams();
    const codigoSesion = searchParams.get('codigo');
    const codigoCursoCalificacion = codigoSesion?.slice(-9)

    const [estudiantes, setEstudiantes] = useState<Array<any>>([])
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false)
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [visible, setVisible] = useState(false)
    const [pdfAsistenciaURL, setPdfAsistenciaURL] = useState('')
    const { data: session, status } = useSession();

    const fetchMatriculados = async () => {
        await axios.get('/curso-calificacion/asistentes', {
            params: {
                codigoCursoCalificacion: codigoCursoCalificacion,
                codigoSesion: codigoSesion
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
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
        if (status === 'authenticated') {
            fetchMatriculados();
        }
    }, [status]);

    const obtenerPDFAsistencias = async () => {
        await axios.get('/pdf/lista-asistencia', {
            params: { codigoCurso: codigoCursoCalificacion, codigoSesion: codigoSesion },
            responseType: 'blob'
        })
            .then(response => {
                // console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                setPdfAsistenciaURL(url);
                setVisible(true)
                //URL.revokeObjectURL(url);
            })
            .catch(error => {
                //// console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "Error al generar el pdf" : error.message,
                    life: 3000
                })
            })
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label={"Hora de ingreso: " + '0'} size='small' icon="pi pi-clock" disabled={true} severity="success" className=" mr-2" />
                    <Button label={"Hora de salida: " + '0'} size='small' icon="pi pi-clock" disabled={true}  severity="warning" className=" mr-2" />
                </div>
            </React.Fragment>
        );
    };

    const asistenciasBodyTemplate = (rowData: any) => {
        return (
            <>
                <ProgressBar value={rowData.Asistencias} ></ProgressBar>
            </>
        );
    };

    const habilitadoBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Habilitado, 'text-red-500 pi-times-circle': !rowData.Habilitado })}></i>;
    };

    const asistenciaBodyTemplate = (rowData: any) => {
        return <Checkbox checked={rowData.Asistencia} disabled={true}></Checkbox>
    };


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div>
                <h5 className="m-0 mb-2">Registro de asistencias</h5>
                <Button className='px-2 py-1 border-none'
                    size='small'
                    label="Vista PDF"
                    icon="pi pi-file-pdf"
                    onClick={() => obtenerPDFAsistencias()}
                />
            </div>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const footer = `${estudiantes ? estudiantes.length : 0} estudiantes matriculados`;

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

    if (!session) {
        redirect('/')
    } else if (session?.user.codigoDocente == 0) {
        redirect('/pages/notfound')
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={estudiantes}
                        dataKey="Estudiante.Codigo"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage="No se han encontrado estudiantes"
                        header={header}
                        footer={footer}
                        sortField='Estudiante.Persona.Paterno'
                        sortOrder={1}
                    >
                        <Column field="Numero" header="#" headerStyle={{ minWidth: '3rem' }}></Column>
                        <Column field="Estudiante" header="Estudiante" headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="Asistencias" header="Asistencias" body={asistenciasBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
                        <Column field="Habilitado" align='center' header="Habilitado" body={habilitadoBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="Estado" align='center' header="Asistencia" body={asistenciaBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog header="Vista PDF de asistencias" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                        <iframe src={pdfAsistenciaURL} width="100%" height="99%"></iframe>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};