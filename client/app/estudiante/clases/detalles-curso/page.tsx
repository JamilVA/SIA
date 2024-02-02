'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';

import { TabView, TabPanel } from 'primereact/tabview';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';

import 'primeflex/primeflex.css';

import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { Timeline } from 'primereact/timeline';

export default function Curso() {
    const searchParams = useSearchParams();
    const codigoCurso = searchParams.get('codigoS');
    const codigoEstudiante = searchParams.get('codigoE');

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const cursoCVacio = {
        Codigo: '',
        RutaSyllabus: '',
        RutaNormas: '',
        RutaPresentacionCurso: '',
        RutaPresentacionDocente: '',
        Capacidad: '',
        Competencia: '',
        CodigoCurso: ''
    };

    const cursoVacio = {
        Codigo: '',
        Nombre: '',
        HorasTeoria: 0,
        HorasPractica: 0,
        Creditos: 0,
        Nivel: 0,
        Semestre: 0
    };

    const sesionVacia = {
        Codigo: '',
        CodigoSemanaAcademica: '',
        Numero: '0',
        Descripcion: '',
        LinkClaseVirtual: '',
        Fecha: new Date,
        HoraInicio: '',
        HoraFin: '',
    };

    const semanaVacia = {
        Codigo: '',
        Descripcion: '',
        CodigoUnidadAcademica: ''
    };

    const unidadVacia = {
        Codigo: '',
        Denominacion: '',
        CodigoCursoCalificacion: ''
    };

    const matriculaVacia = {
        CodigoCursoCalificacion: '',
        CodigoEstudiante: '',
        FechaMatricula: '',
        Habilitado: false,
        Nota1: 0,
        Nota2: 0,
        Nota3: 0,
        Nota4: 0,
        NotaRecuperacion: 0,
        NotaAplazado: 0,
        NotaFinal: 0
    };

    const [cursoCalificacion, setCursoCalificaion] = useState(cursoCVacio);
    const [curso, setCurso] = useState(cursoVacio);
    const [sesion, setSesion] = useState(sesionVacia);
    const [sesiones, setSesiones] = useState<(typeof sesionVacia)[]>([]);
    const [semana, setSemana] = useState(sesionVacia);
    const [semanas, setSemanas] = useState<(typeof semanaVacia)[]>([]);
    const [unidades, setUnidades] = useState<(typeof unidadVacia)[]>([]);

    const [submitted, setSubmitted] = useState(false);
    const [sesionDialog, setSesionDialog] = useState(false);
    const [cursoCDialog, setCursoCDialog] = useState(false);
    const [matricula, setMatricula] = useState(matriculaVacia)

    useEffect(() => {
        cargarDatos();
        cargarNotas();
    }, []);

    const cargarDatos = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/sesion/estudiante', {
                params: {
                    CodigoCursoCalificacion: codigoCurso,
                    CodigoEstudiante: codigoEstudiante,
                }
            });

            const { curso, unidades, semanas, sesiones } = data;
            setCursoCalificaion(curso), setCurso(curso.Curso);
            setUnidades(unidades);
            setSemanas(semanas);
            setSesiones(sesiones);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    };

    const cargarNotas = async () => {
        await axios.get('http://localhost:3001/api/estudiante/notas', {
            params: {
                codigoCurso: codigoCurso,
                codigoEstudiante: codigoEstudiante
            }
        })
            .then(response => {
                let matricula = response.data.matricula
                setMatricula(matricula)
            })
            .catch(error => {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response ? error.response.data.error : error.message,
                    life: 3000
                });
            })
    }

    const filtrarSemanas = (Semanas: (typeof semanaVacia)[], Codigo: string) => {
        return Semanas.filter((s) => s.CodigoUnidadAcademica === Codigo);
    };

    const filtrarSesiones = (Sesiones: (typeof sesionVacia)[], Codigo: string) => {
        return Sesiones.filter((s) => s.CodigoSemanaAcademica === Codigo);
    };

    const numeroBodyTemplate = (rowData: any) => {
        return rowData.Numero;
    };

    const sesionBodyTemplate = (rowData: any) => {
        return rowData.Descripcion;
    };

    const fechaBodyTemplate = (rowData: any) => {
        if (rowData.Fecha) {
            const fecha = new Date(rowData.Fecha + 'T00:00:00');
            return fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
            }).toUpperCase() + ' ' + rowData.HoraInicio.slice(0, 5);
        }
    };

    const estadoBodyTemplate = (rowData: any) => {
        console.log('Rowdata para Asitencia', rowData)
        if (rowData.Asistencia && rowData.Asistencia.length > 0) {
            console.log('Rowdata Para Estado:', rowData.Asistencia[0].Estado);
            const icono = (
                <span className={`icono-${rowData.Asistencia[0].Estado}`}>
                    <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Asistencia[0].Estado, 'text-red-500 pi-times-circle': !rowData.Asistencia[0].Estado })}></i>
                </span>
            );

            return (
                <>
                    {icono}
                    <Tooltip target={`.icono-${rowData.Asistencia[0].Estado}`}>
                        <span>Asistencia</span>
                    </Tooltip>
                </>
            );
        } else {
            const icono = (
                <span className={`icono-x`}>
                    <i className={classNames('pi', 'text-red-500 pi-times-circle')}></i>
                </span>
            );

            return (
                <>
                    {icono}
                    <Tooltip target={`.icono-x`}>
                        <span>Asistencia</span>
                    </Tooltip>
                </>
            );
        }

    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <Link href={`/estudiante/clases/detalles-curso/recursos?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Recursos" icon="pi pi-folder-open" className="p-button-help mr-1"/>
                </Link>
                <Link href={`/estudiante/clases/detalles-curso/actividades?codigo=${rowData.Codigo}&codigoE=${codigoEstudiante}`}>
                    <Button tooltip="Actividades" icon="pi pi-book" className="p-button-success mr-5"  />
                </Link>
            </React.Fragment>
        );
    };

    const headerSemana = (rowData: typeof semanaVacia) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h6 className="m-0">
                    <i className="pi pi-calendar mr-3"></i> {rowData.Descripcion}
                </h6>
            </div>
        );
    };

    const headerUnidad = (rowData: typeof unidadVacia) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h5 className="m-0 text-primary">
                    <i className="pi pi-book mr-3"></i> {rowData.Denominacion}
                </h5>
            </div>
        );
    };

    const semanaBodyTempalte = (rowData: typeof semanaVacia) => {
        return (
            <React.Fragment>
                <DataTable ref={dt} value={filtrarSesiones(sesiones, rowData.Codigo)} header={headerSemana(rowData)} dataKey="Codigo">
                    <Column headerStyle={{ display: 'none' }} body={numeroBodyTemplate} style={{ minWidth: '1rem' }}></Column>
                    <Column headerStyle={{ display: 'none' }} body={sesionBodyTemplate} style={{ minWidth: '14rem' }}></Column>
                    <Column headerStyle={{ display: 'none' }} body={fechaBodyTemplate} style={{ minWidth: '8rem' }}></Column>
                    <Column headerStyle={{ display: 'none' }} body={estadoBodyTemplate} style={{ minWidth: '2rem' }}></Column>
                    <Column headerStyle={{ display: 'none' }} className={classNames({ 'text-right': true })} body={actionBodyTemplate} style={{ minWidth: '8rem', paddingRight: '1rem' }}></Column>
                </DataTable>
            </React.Fragment>
        );
    };

    const unidadBodyTemplate = (rowData: typeof unidadVacia) => {
        return (
            <React.Fragment>
                <DataTable className="m-0" ref={dt} value={filtrarSemanas(semanas, rowData.Codigo)} header={headerUnidad(rowData)} dataKey="Codigo">
                    <Column headerStyle={{ display: 'none' }} body={semanaBodyTempalte} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </React.Fragment>
        );
    };

    const title = (curso: typeof cursoVacio) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h4>
                    {curso.Nombre}
                </h4>
            </div>
        );
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-3 m-0">
                <div className="card">
                    <div className="text-center">
                        <img style={{ borderRadius: 'var(--border-radius)' }} alt="Card" className="md:w-5 w-5 mt-1 shadow-1" src="/images/usuario.png" />
                        <h5 style={{ color: 'var(--surface-700)' }}>JAMIL JOAO VASQUEZ ALAYO</h5>
                    </div>
                    <div className="mt-4">
                        <p>
                            <b>Email: </b>jamilvasquez@gmail.com
                        </p>
                        <p>
                            <b>DNI: </b>71584962
                        </p>
                    </div>
                </div>
                <div className="card"></div>
            </div>
            <div className="col-9 m-0">
                <div>
                    <Card title={title(curso)} subTitle={'Codigo (' + curso.Codigo + ')'} style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}></Card>
                    <TabView>
                        <TabPanel header="Sesiones" leftIcon="pi pi-list mr-2">
                            <DataTable ref={dt} value={unidades} dataKey="Codigo" emptyMessage="No se han encontrado cursos a matricular">
                                <Column headerStyle={{ display: 'none' }} body={unidadBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                            </DataTable>
                        </TabPanel>
                        <TabPanel header="Calificaciones" leftIcon="pi pi-check-square mr-2">
                            <div className="grid mb-2">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        NOTA 1: <span style={matricula.Nota1 < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.Nota1}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid mb-2">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        NOTA 2: <span style={matricula.Nota2 < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.Nota2}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid mb-2">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        NOTA 3: <span style={matricula.Nota3 < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.Nota3}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid mb-2">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        NOTA 4: <span style={matricula.Nota4 < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.Nota4}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid mb-2">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        RECUPERACIÓN: <span style={matricula.NotaRecuperacion < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.NotaRecuperacion}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid mb-2">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        APLAZADO: <span style={matricula.NotaAplazado < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.NotaAplazado}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid">
                                <div className="col-fixed">
                                    <div className="text-center p-2" style={{ backgroundColor: 'var(--gray-300)', borderRadius: '50%' }}>
                                        <i className="pi pi-book" style={{ color: 'green' }}></i>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="p-2 border-round-sm font-bold" style={{ backgroundColor: 'var(--gray-200)' }}>
                                        NOTA FINAL: <span style={matricula.NotaFinal < 11 ? { color: 'red' } : { color: 'blue' }}>{matricula.NotaFinal}</span>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
}
