/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { classNames } from 'primereact/utils';
import { ProgressBar } from 'primereact/progressbar';
import { Checkbox } from 'primereact/checkbox';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function AsistenciasPage() {

    let codigoSesion = '2014P3203252'
    let codigoCursoCalificacion = 'P3203252'

    const [estudiantes, setEstudiantes] = useState<Array<any>>([])
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false)
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchMatriculados = async () => {
        await axios.get('http://localhost:3001/api/curso-calificacion/matriculados', {
            params: {
                codigoCursoCalificacion: codigoCursoCalificacion,
                codigoSesion: codigoSesion
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
        fetchMatriculados()
    }, []);

    const marcarAsistencia = async (rowData: any) => {
        const codEstudiante = rowData.Estudiante.Codigo
        await axios.post('http://localhost:3001/api/asistencia/marcar', {
            codigoSesion: codigoSesion,
            codigoEstudiante: codEstudiante,
            codigoCurso: codigoCursoCalificacion
        }).
            then(response => {
                fetchMatriculados()
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                })
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al marcar la asistencia',
                    life: 3000
                })
            })
    }

    const desmarcarAsistencia = async (rowData: any) => {
        const codEstudiante = rowData.Estudiante.Codigo
        await axios.delete('http://localhost:3001/api/asistencia/desmarcar', {
            params: {
                codigoSesion: codigoSesion,
                codigoEstudiante: codEstudiante,
                codigoCurso: codigoCursoCalificacion
            }
        })
            .then(response => {
                fetchMatriculados()
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                })
            })
            .catch(error => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al desmarcar la asistencia',
                    life: 3000
                })
            })
    }

    const marcarIngreso =async () => {
        await axios.post('http://localhost:3001/api/sesion/marcar-ingreso', {}, {
            params: {
                codigoSesion: codigoSesion
            }
        })
        .then(response => {
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: response.data.message,
                life: 3000
            })
        })
        .catch(error => {
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: error.response.data.message,
                life: 3000
            })
        })
    }

    const marcarSalida =async () => {
        await axios.post('http://localhost:3001/api/sesion/marcar-salida', {}, {
            params: {
                codigoSesion: codigoSesion
            }
        })
        .then(response => {
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: response.data.message,
                life: 3000
            })
        })
        .catch(error => {
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: error.response.data.message,
                life: 3000
            })
        })
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Marcar mi ingreso" size='small' icon="pi pi-clock" onClick={marcarIngreso} severity="success" className=" mr-2" />
                    <Button label="Marcar mi salida" size='small' icon="pi pi-clock" onClick={marcarSalida} severity="warning" className=" mr-2" />
                </div>
            </React.Fragment>
        );
    };


    const nameBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.Estudiante.Persona.Paterno + ' ' + rowData.Estudiante.Persona.Materno + ', ' + rowData.Estudiante.Persona.Nombres}
            </>
        );
    };

    const asistenciasBodyTemplate = (rowData: any) => {
        return (
            <>
                <ProgressBar value={rowData.PorcentajeAsistencia} ></ProgressBar>
            </>
        );
    };

    const habilitadoBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Habilitado, 'text-red-500 pi-times-circle': !rowData.Habilitado })}></i>;
    };

    const asistenciaBodyTemplate = (rowData: any) => {
        let asistencia = rowData.Estudiante.Asistencia[0]
        return <Checkbox checked={asistencia === undefined ? false : asistencia.Estado}></Checkbox>
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-check" label='Marcar' size='small' severity="success" className="mr-2 px-2 py-1" onClick={() => marcarAsistencia(rowData)} />
                <Button icon="pi pi-times" label='Desmarcar' size='small' severity="warning" className="mr-2 px-2 py-1" onClick={() => desmarcarAsistencia(rowData)} />
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

    const footer = `${estudiantes ? estudiantes.length : 0} estudiantes matriculados`;

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
                        <Column field="Estudiante.Codigo" header="Código" hidden headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="Estudiante.Persona.Paterno" header="Estudiante" body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="Asistencias" header="Asistencias" body={asistenciasBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="Matriculas.Habilitado" align='center' header="Habilitado" body={habilitadoBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="Asistencia.Estado" align='center' header="Asistencia" body={asistenciaBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                </div>
            </div>
        </div>
    );
};