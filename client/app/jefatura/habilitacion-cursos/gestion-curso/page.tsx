'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';

const { startOfWeek, addWeeks, format } = require('date-fns');

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';

import 'primeflex/primeflex.css';

import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { CalendarChangeEvent } from 'primereact/calendar';

export default function Curso() {
    const searchParamas = useSearchParams();
    const codigoCurso = searchParamas.get('codigo');

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
        Fecha: new Date(),
        HoraInicio: '',
        HoraFin: '',
        EstadoAsistencia: 0
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

    const horarioVacio = {
        Codigo: 0,
        Dia: '',
        HoraInicio: '00:00:00',
        HoraFin: '00:00:00',
        NombreAula: '',
        NumeroAula: ''
    };

    const [cursoCalificacion, setCursoCalificaion] = useState(cursoCVacio);
    const [curso, setCurso] = useState(cursoVacio);
    const [sesion, setSesion] = useState({
        ...sesionVacia,
        Fecha: new Date()
    });
    const [sesiones, setSesiones] = useState<(typeof sesionVacia)[]>([]);
    const [semana, setSemana] = useState(sesionVacia);
    const [semanas, setSemanas] = useState<(typeof semanaVacia)[]>([]);
    const [unidades, setUnidades] = useState<(typeof unidadVacia)[]>([]);
    const [horarios, setHorarios] = useState<(typeof horarioVacio)[]>([]);

    const [submitted, setSubmitted] = useState(false);
    const [modified, setModified] = useState(false);
    const [sesionDialog, setSesionDialog] = useState(false);
    const [cursoCDialog, setCursoCDialog] = useState(false);

    const [fechaInicioClases, setFechaInicioClases] = useState<Date>();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/sesion/docente', {
                params: {
                    CodigoCursoCalificacion: codigoCurso
                }
            });

            const { curso, unidades, semanas, sesiones } = data;
            const fechaInicio = new Date(curso.Periodo.FechaInicio);

            setFechaInicioClases(fechaInicio); // 4 de marzo de 2024 (meses en JavaScript son 0-indexados)
            setCursoCalificaion(curso);
            setHorarios(curso.Horarios);
            setCurso(curso.Curso);
            setUnidades(unidades);
            setSemanas(semanas);
            setSesiones(sesiones);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    };

    const saveSesion = () => {
        let _sesion = { ...sesion };

        if (modified) {
            axios
                .put('http://localhost:3001/api/sesion', {
                    codigo: _sesion.Codigo,
                    descripcion: _sesion.Descripcion,
                    linkClaseVirtual: _sesion.LinkClaseVirtual,
                    fecha: _sesion.Fecha,
                    horaInicio: _sesion.HoraInicio,
                    horaFin: _sesion.HoraFin
                })
                .then((response) => {
                    console.log(response.data);
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Sesion modificada con éxito', life: 3000 });
                    cargarDatos();
                });
            setSesionDialog(false);
            setSesion(sesionVacia);
        } else {
            axios
                .post('http://localhost:3001/api/sesion', {
                    codigo: _sesion.Codigo,
                    numero: _sesion.Numero,
                    descripcion: _sesion.Descripcion,
                    codigoSemanaAcademica: _sesion.CodigoSemanaAcademica,
                    linkClaseVirtual: _sesion.LinkClaseVirtual,
                    fecha: _sesion.Fecha,
                    horaInicio: _sesion.HoraInicio,
                    horaFin: _sesion.HoraFin
                })
                .then((response) => {
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Sesion creada con éxito', life: 3000 });
                    cargarDatos();
                });
            setSesionDialog(false);
            setSesion(sesionVacia);
        }
    };

    const saveCurso = () => {
        let _cursoCalificacion = { ...cursoCalificacion };
        axios
            .put('http://localhost:3001/api/curso-calificacion', {
                codigo: _cursoCalificacion.Codigo,
                competencia: _cursoCalificacion.Competencia,
                capacidad: _cursoCalificacion.Capacidad,
                rutaSyllabus: _cursoCalificacion.RutaSyllabus,
                rutaNormas: _cursoCalificacion.RutaNormas,
                rutaPresentacionCurso: _cursoCalificacion.RutaPresentacionCurso,
                rutaPresentacionDocente: _cursoCalificacion.RutaPresentacionDocente
            })
            .then((response) => {
                console.log(response);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Curso actualizado con éxito', life: 3000 });
                cargarDatos();
            });
        setCursoCDialog(false);
        setCursoCalificaion(cursoCVacio);
    };


    const editSesion = (sesion: typeof sesionVacia) => {
        let tempSesion = {
            Codigo: sesion.Codigo,
            CodigoSemanaAcademica: sesion.CodigoSemanaAcademica,
            Descripcion: sesion.Descripcion,
            LinkClaseVirtual: sesion.LinkClaseVirtual,
            Numero: sesion.Numero,
            Fecha: new Date(sesion.Fecha + 'T00:00:00'),
            HoraInicio: sesion.HoraInicio,
            HoraFin: sesion.HoraFin,
            EstadoAsistencia: sesion.EstadoAsistencia
        };

        setSesion(tempSesion);
        setModified(true);
        setSesionDialog(true);
    };

    const editCurso = (curso: typeof cursoCVacio) => {
        const tempCursoC = {
            Codigo: curso.Codigo,
            RutaSyllabus: curso.RutaSyllabus,
            RutaNormas: curso.RutaNormas,
            RutaPresentacionCurso: curso.RutaPresentacionCurso,
            RutaPresentacionDocente: curso.RutaPresentacionDocente,
            Capacidad: curso.Capacidad,
            Competencia: curso.Competencia,
            CodigoCurso: curso.CodigoCurso
        };
        setCursoCalificaion(tempCursoC);
        setCursoCDialog(true);
    };

    const calcularFecha = (dia: string, numeroSemana: number) => {
        const primerDiaSemanaInicio = startOfWeek(fechaInicioClases, { weekStartsOn: 0 });

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const indiceDia = diasSemana.indexOf(dia);

        const fechaCalculada = addWeeks(primerDiaSemanaInicio, numeroSemana - 1); 

        const fechaFinal = new Date(fechaCalculada);
        fechaFinal.setDate(fechaCalculada.getDate() + ((indiceDia - fechaCalculada.getDay() + 7) % 7));

        const formatoFecha = fechaFinal.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        console.log(`Fecha para ${dia} de la semana ${numeroSemana}: ${formatoFecha}`);
        return fechaFinal;
    };

    const onInputCursoChange = (e: React.ChangeEvent<HTMLTextAreaElement>, name: keyof typeof cursoCVacio) => {
        const val = (e.target && e.target.value) || '';
        let _cursoCalificacion = { ...cursoCalificacion };
        _cursoCalificacion[name] = val;
        setCursoCalificaion(_cursoCalificacion);
    };

    const onUpload = () => {
        toast.current!.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    };

    const hideSesionDialog = () => {
        setSubmitted(false);
        setSesionDialog(false);
    };

    const hideCursoCDialog = () => {
        setSubmitted(false);
        setCursoCDialog(false);
    };

    const deshabilitarAsistencia = async (codigo: string) => {
        await axios
            .put(
                'http://localhost:3001/api/sesion/deshabilitar-asistencia',
                {},
                {
                    params: {
                        codigo: codigo
                    }
                }
            )
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Asistencia Deshabilitada',
                    detail: response.data.message,
                    life: 3000
                });
                cargarDatos();
            })
            .catch((error) => {
                console.error(error.data);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            });
        setSesion(sesionVacia);
    };
    const habilitarAsistencia = async (codigo: string) => {
        await axios
            .put(
                'http://localhost:3001/api/sesion/habilitar-asistencia',
                {},
                {
                    params: {
                        codigo: codigo
                    }
                }
            )
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Asistencia Habilitada',
                    detail: response.data.message,
                    life: 3000
                });
                cargarDatos();
            })
            .catch((error) => {
                console.error(error.data);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            });
        setSesion(sesionVacia);
    };

    const handleClick = async (sesion: typeof sesionVacia) => {
        if (!!sesion.EstadoAsistencia === true) {
            await deshabilitarAsistencia(sesion.Codigo);
        } else {
            await habilitarAsistencia(sesion.Codigo);
        }
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;

        let _sesion = { ...sesion };
        _sesion.Fecha = selectedDate;

        setSesion(_sesion);
        console.log(_sesion);
    };

    const sesionDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideSesionDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveSesion} />
        </React.Fragment>
    );

    const cursoCDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideCursoCDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveCurso} />
        </React.Fragment>
    );

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
            return (
                fecha
                    .toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    })
                    .toUpperCase() +
                ' ' +
                rowData.HoraInicio.slice(0, 5)
            );
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <InputSwitch tooltip={rowData.EstadoAsistencia ? 'Deshabilitar asistencia' : 'Habilitar asistencia'} checked={!!rowData.EstadoAsistencia} onChange={() => handleClick(rowData)} />
                <Button tooltip="Editar" icon="pi pi-pencil" className="p-button-warning p-button-sm ml-5 mr-8" style={{ padding: '0.75em', fontSize: '0.75em' }} onClick={() => editSesion(rowData)} />
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
                    <Column className={classNames({ 'text-right': true })} headerStyle={{ display: 'none' }} body={actionBodyTemplate} style={{ minWidth: '5rem', paddingRight: '1rem' }}></Column>
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
        <div>
            <Toast ref={toast} />
            <Card title={title(curso)} subTitle={'Codigo (' + curso.Codigo + ')'} style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}></Card>
            <DataTable ref={dt} value={unidades} dataKey="Codigo" emptyMessage="No se han encontrado cursos a matricular">
                <Column headerStyle={{ display: 'none' }} body={unidadBodyTemplate} style={{ minWidth: '4rem' }}></Column>
            </DataTable>
            <Dialog visible={sesionDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos de la sesión" modal className="p-fluid" footer={sesionDialogFooter} onHide={hideSesionDialog}>
                <div className="field col">
                    <label htmlFor="fecha" className="font-bold">
                        Fecha de la sesión
                    </label>
                    <Calendar id="fecha" value={sesion.Fecha} onChange={(e) => onCalendarChange(e)} showIcon required className={classNames({ 'p-invalid': submitted && !sesion.Fecha })} />
                    {submitted && !sesion.Fecha && <small className="p-error">Ingrese la Fecha.</small>}
                </div>
            </Dialog>
            <Dialog visible={cursoCDialog} style={{ width: '60rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos del curso" modal className="p-fluid" footer={cursoCDialogFooter} onHide={hideCursoCDialog}>
                <div className="field">
                    <div className="text-center">
                        <span className="text-primary" style={{ fontWeight: 'bold' }}>
                            {curso.Nombre}
                        </span>
                        <span className="text-primary"> ({curso.Codigo})</span>
                        <br />
                        <small className="text-muted">PINTURA</small>
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="nivel" className="font-bold">
                            Año
                        </label>
                        <InputText id="nivel" value={curso.Nivel.toString()} disabled />
                    </div>
                    <div className="field col">
                        <label htmlFor="semestre" className="font-bold">
                            Semestre
                        </label>
                        <InputText id="semestre" value={curso.Semestre.toString()} disabled />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="horasTeoria" className="font-bold">
                            Horas Teoria
                        </label>
                        <InputText id="horasTeoria" value={curso.HorasTeoria.toString()} disabled />
                    </div>
                    <div className="field col">
                        <label htmlFor="horasPractica" className="font-bold">
                            Horas Práctica
                        </label>
                        <InputText id="horasPractica" value={curso.HorasPractica.toString()} disabled />
                    </div>
                    <div className="field col">
                        <label htmlFor="semestre" className="font-bold">
                            Créditos
                        </label>
                        <InputText id="semestre" value={curso.Semestre.toString()} disabled />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="rutaSyllabus" className="font-bold">
                            Syllabus
                        </label>
                        <FileUpload mode="basic" name="rutaSyllabus" id="rutaSyllabus" url="/api/upload" accept="pdf/*" maxFileSize={1000000} onUpload={onUpload} chooseLabel="Subir" />
                    </div>
                    <div className="field col">
                        <label htmlFor="rutaNormas" className="font-bold">
                            Normas de convivencia
                        </label>
                        <FileUpload mode="basic" name="rutaNormas" id="rutaNormas" url="/api/upload" accept="pdf/*" maxFileSize={1000000} onUpload={onUpload} chooseLabel="Subir" />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="rutaPresentacionCurso" className="font-bold">
                            Presentación del curso
                        </label>
                        <FileUpload mode="basic" name="rutaPresentacionCurso" id="rutaPresentacionCurso" url="/api/upload" accept="pdf/*" maxFileSize={1000000} onUpload={onUpload} chooseLabel="Subir" />
                    </div>
                    <div className="field col">
                        <label htmlFor="rutaPresentacionDocente" className="font-bold">
                            Presentación del docente
                        </label>
                        <FileUpload mode="basic" name="rutaPresentacionDocente" id="rutaPresentacionDocente" url="/api/upload" accept="pdf/*" maxFileSize={1000000} onUpload={onUpload} chooseLabel="Subir" />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="competencia" className="font-bold">
                            Competencia
                        </label>
                        <InputTextarea id="competencia" value={cursoCalificacion.Competencia || ''} onChange={(e) => onInputCursoChange(e, 'Competencia')} />
                    </div>
                    <div className="field col">
                        <label htmlFor="capacidad" className="font-bold">
                            Capacidad
                        </label>
                        <InputTextarea id="capacidad" value={cursoCalificacion.Capacidad || ''} onChange={(e) => onInputCursoChange(e, 'Capacidad')} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
