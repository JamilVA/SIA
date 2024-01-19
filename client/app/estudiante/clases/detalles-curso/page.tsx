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
        Numero: '0',
        Descripcion: '',
        CodigoSemanaAcademica: ''
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

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/sesion/estudiante', {
                params: {
                    CodigoCursoCalificacion: codigoCurso
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

    const saveSesion = () => {
        let _sesion = { ...sesion };
        console.log('Sesion recibida para crear', _sesion);

        axios
            .post('http://localhost:3001/api/sesion', {
                codigo: _sesion.Codigo,
                numero: _sesion.Numero,
                descripcion: _sesion.Descripcion,
                codigoSemanaAcademica: _sesion.CodigoSemanaAcademica
            })
            .then((response) => {
                console.log(response.data);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Sesion creada con éxito', life: 3000 });
                cargarDatos();
            });
        setSesionDialog(false);
        setSesion(sesionVacia);
    };

    const saveCurso = () => {
        let _cursoCalificacion = { ...cursoCalificacion };
        console.log('Curso recibida para editar', _cursoCalificacion);

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

    const openNew = (rowData: any) => {
        const cantidadSesionesSemana = sesiones.filter((s) => s.CodigoSemanaAcademica == rowData.Codigo).length;
        console.log(cantidadSesionesSemana);
        if (cantidadSesionesSemana == 2) {
            toast.current!.show({ severity: 'error', summary: 'Advertencia', detail: 'El límite de sesiones por semana es de 2', life: 3000 });
        } else {
            let _sesion = sesionVacia;
            _sesion[`Codigo`] = cantidadSesionesSemana + 1 + rowData.Codigo;
            _sesion[`Numero`] = String(cantidadSesionesSemana + 1 + (parseInt(rowData.Codigo.slice(0, 2)) - 1) * 20);
            _sesion[`CodigoSemanaAcademica`] = rowData.Codigo;
            setSesion(_sesion);
            console.log('Sesion:', _sesion);
            console.log('Rowdata:', rowData);
            setSemana(rowData);
            setSesionDialog(true);
        }
    };

    const editSesion = (sesion: typeof sesionVacia) => {
        let tempSesion = {
            Codigo: sesion.Codigo,
            Descripcion: sesion.Descripcion,
            Numero: sesion.Numero,
            CodigoSemanaAcademica: sesion.CodigoSemanaAcademica
        };

        setSesion(tempSesion);
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

    const onInputSesionChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof typeof sesionVacia) => {
        const val = (e.target && e.target.value) || '';
        let _sesion = { ...sesion };
        _sesion[name] = val;
        setSesion(_sesion);
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

    const estadoBodyTemplate = (rowData: any) => {
        console.log('Rowdata Para Estado:', rowData);
        const icono = (
            <span className={`icono-${rowData.Estado}`}>
                <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>
            </span>
        );

        return (
            <>
                {icono}
                <Tooltip target={`.icono-${rowData.Estado}`}>
                    <span>Asistencia</span>
                </Tooltip>
            </>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <Link href={`/estudiante/clases/detalles-curso/recursos?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Recursos" icon="pi pi-file" className="p-button-help p-button-sm mr-1" style={{ padding: '0.75em', fontSize: '0.75em' }} text />
                </Link>
                <Link href={`/estudiante/clases/detalles-curso/actividades?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Actividades" icon="pi pi-book" className="p-button-success p-button-sm mr-5" style={{ padding: '0.75em', fontSize: '0.75em' }} text />
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
                    <Column headerStyle={{ display: 'none' }} body={estadoBodyTemplate} style={{ minWidth: '14rem' }}></Column>
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

    const header = <img alt="Card" src="https://primefaces.org/cdn/primereact/images/usercard.png" />;
    const footer = (
        <>
            <Button label="Save" icon="pi pi-check" />
            <Button label="Cancel" severity="secondary" icon="pi pi-times" style={{ marginLeft: '0.5em' }} />
        </>
    );
    const title = (curso: typeof cursoVacio) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h4>
                    {curso.Nombre}
                    <Button tooltip="Editar" icon="pi pi-pencil" className="p-button-warning p-button-sm ml-3 pb-1" style={{ padding: '0.75em' }} onClick={() => editCurso(cursoCalificacion)} text />
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
                        <img style={{ borderRadius: 'var(--border-radius)' }} alt="Card" className="md:w-5 w-5 mt-1 shadow-1" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQION7iLAgrmjNpsU01XdpcD7fU-ZnfaLfEWestMmrvQQ&s" />
                        <h5 style={{ color: 'var(--surface-700)' }}>MALPICA RODRIGUEZ MANUEL ENRIQUE</h5>
                    </div>
                    <div className="mt-4">
                        <p>
                            <b>Email: </b>mmalpica@gmail.com
                        </p>
                        <p>
                            <b>DNI: </b>40936598
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
                            <h4>Calificaciones</h4>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
            <Dialog visible={sesionDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos de la sesión" modal className="p-fluid" footer={sesionDialogFooter} onHide={hideSesionDialog}>
                {/* <div className="field">
                    <label htmlFor="imagen" className="font-bold">
                        Foto
                    </label>
                    <FileUpload name="foto" url="/api/upload" accept="image/*" chooseLabel="Cargar Imagen" uploadLabel="Confirmar" cancelLabel="Cancelar" className="p-mb-3" maxFileSize={5 * 1024 * 1024} customUpload uploadHandler={onFileSelect} />
                </div> */}

                <div className="field">
                    <label htmlFor="nombres" className="font-bold">
                        Nombre de la sesión
                    </label>
                    <InputText id="nombres" value={sesion.Descripcion} onChange={(e) => onInputSesionChange(e, 'Descripcion')} required autoFocus maxLength={40} className={classNames({ 'p-invalid': submitted && !sesion.Descripcion })} />
                    {submitted && !sesion.Descripcion && <small className="p-error">Ingrese el nombre de la sesión.</small>}
                </div>
            </Dialog>
            <Dialog visible={cursoCDialog} style={{ width: '60rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos del curso" modal className="p-fluid" footer={cursoCDialogFooter} onHide={hideCursoCDialog}>
                <div className="field">
                    {/* <InputText id="Nombre" value={curso.Nombre + ' (' + curso.Codigo + ')'} disabled /> */}
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
                        <InputTextarea id="competencia" value={(cursoCalificacion && cursoCalificacion.Competencia) || ''} onChange={(e) => onInputCursoChange(e, 'Competencia')} />
                    </div>
                    <div className="field col">
                        <label htmlFor="capacidad" className="font-bold">
                            Capacidad
                        </label>
                        <InputTextarea id="capacidad" value={(cursoCalificacion && cursoCalificacion.Capacidad) || ''} onChange={(e) => onInputCursoChange(e, 'Capacidad')} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
