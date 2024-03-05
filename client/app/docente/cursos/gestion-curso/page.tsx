'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';

const { startOfWeek, addWeeks, format } = require('date-fns');

import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';

import 'primeflex/primeflex.css';

import { Toast } from 'primereact/toast';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { SpeedDial } from 'primereact/speeddial';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import Perfil from '../../../../templates/Perfil';

export default function Curso() {
    const searchParamas = useSearchParams();
    const codigoCurso = searchParamas.get('codigo');

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);

    const cursoCVacio = {
        Codigo: '',
        RutaImagenPortada: '',
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
        Semestre: 0,
        CarreraProfesional: {
            Codigo:0,
            NombreCarrera: '',
        }

    };

    const sesionVacia = {
        Codigo: '',
        CodigoSemanaAcademica: '',
        Numero: '0',
        Descripcion: '',
        LinkClaseVirtual: '',
        Fecha: new Date(),
        HoraInicio: '',
        HoraFin: ''
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
    const [sesion, setSesion] = useState(sesionVacia);
    const [sesiones, setSesiones] = useState<(typeof sesionVacia)[]>([]);
    const [semana, setSemana] = useState(sesionVacia);
    const [semanas, setSemanas] = useState<(typeof semanaVacia)[]>([]);
    const [unidades, setUnidades] = useState<(typeof unidadVacia)[]>([]);
    const [horarios, setHorarios] = useState<(typeof horarioVacio)[]>([]);

    const [submitted, setSubmitted] = useState(false);
    const [modified, setModified] = useState(false);
    const [sesionDialog, setSesionDialog] = useState(false);
    const [cursoCDialog, setCursoCDialog] = useState(false);
    const [imagenDialog, setImagenDialog] = useState(false);
    const [imagen, setImagen] = useState<FileUploadFilesEvent | null>(null);
    const [imagenURL, setImagenURL] = useState<string | null>(null);

    const [syllabus, setSyllabus] = useState<FileUploadFilesEvent | null>(null);
    const [presentacionDocente, setPresentacionDocente] = useState<FileUploadFilesEvent | null>(null);
    const [presentacionCurso, setPresentacionCurso] = useState<FileUploadFilesEvent | null>(null);
    const [normas, setNormas] = useState<FileUploadFilesEvent | null>(null);

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

            console.log(data);

            setFechaInicioClases(fechaInicio); // 4 de marzo de 2024 (meses en JavaScript son 0-indexados)
            setCursoCalificaion(curso);
            setHorarios(curso.Horarios);
            setCurso(curso.Curso);
            setUnidades(unidades);
            setSemanas(semanas);
            setSesiones(sesiones);
            if (curso.RutaImagenPortada) {
                obtenerArchivo(curso.RutaImagenPortada);
            } else {
                setImagenURL('/images/banner.jpg');
            }
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

    const obtenerArchivo = async (ruta: string) => {
        if (ruta === '') {
            return;
        }
        try {
            const response = await axios.get('http://localhost:3001/api/files/download', {
                params: { fileName: ruta },
                responseType: 'arraybuffer' // Especificar el tipo de respuesta como 'arraybuffer'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            setImagenURL(url);
        } catch (error) {
            setImagenURL('/images/banner.jpg');
            console.error('Error al obtener el archivo:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error de carga de archivo',
                life: 3000
            });
        }
    };

    const saveCurso = () => {
        try {
            let _cursoCalificacion = { ...cursoCalificacion };

            axios
                .put('http://localhost:3001/api/curso-calificacion', {
                    codigo: _cursoCalificacion.Codigo,
                    competencia: _cursoCalificacion.Competencia,
                    capacidad: _cursoCalificacion.Capacidad
                })
                .then((response) => {
                    console.log(response);
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Curso actualizado con éxito', life: 3000 });
                    cargarDatos();
                });
            setCursoCDialog(false);
            setCursoCalificaion(cursoCVacio);

            if (syllabus?.files.length! > 0) {
                subirArchivo('RutaSyllabus');
            }
            if (normas?.files.length! > 0) {
                subirArchivo('RutaNormas');
            }
            if (presentacionCurso?.files.length! > 0) {
                subirArchivo('RutaPresentacionCurso');
            }
            if (presentacionDocente?.files.length! > 0) {
                subirArchivo('RutaPresentacionDocente');
            }
        } catch (error) {
            console.error('Error al editar información del curso:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al editar información del curso',
                life: 3000
            });
        }
    };

    const openNew = (rowData: any) => {
        if (horarios.length > 0) {
            console.log('Rowdada', rowData);
            console.log('Horarios', horarios);

            const cantidadSesionesSemana = sesiones.filter((s) => s.CodigoSemanaAcademica == rowData.Codigo).length;
            if (cantidadSesionesSemana == 2) {
                toast.current!.show({ severity: 'error', summary: 'Advertencia', detail: 'El límite de sesiones por semana es de 2', life: 3000 });
            } else {
                let _sesion = sesionVacia;
                _sesion[`Codigo`] = cantidadSesionesSemana + 1 + rowData.Codigo;
                _sesion[`Numero`] = String(cantidadSesionesSemana + 1 + (parseInt(rowData.Codigo.slice(0, 2)) - 1) * 2);
                _sesion[`CodigoSemanaAcademica`] = rowData.Codigo;
                _sesion[`Fecha`] = calcularFecha(horarios[cantidadSesionesSemana].Dia, parseInt(rowData.Codigo.slice(0, 2)));
                _sesion[`HoraInicio`] = horarios[cantidadSesionesSemana].HoraInicio;
                _sesion[`HoraFin`] = horarios[cantidadSesionesSemana].HoraFin;
                setSesion(_sesion);
                console.log('Sesion:', _sesion);
                console.log('Rowdata:', rowData);
                setSemana(rowData);
                setSesionDialog(true);
            }
        } else {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Aun no se ha designado el horario del curso',
                life: 3000
            });
        }
    };

    const editSesion = (sesion: typeof sesionVacia) => {
        let tempSesion = {
            Codigo: sesion.Codigo,
            CodigoSemanaAcademica: sesion.CodigoSemanaAcademica,
            Descripcion: sesion.Descripcion,
            LinkClaseVirtual: sesion.LinkClaseVirtual,
            Numero: sesion.Numero,
            Fecha: sesion.Fecha,
            HoraInicio: sesion.HoraInicio,
            HoraFin: sesion.HoraFin
        };

        setSesion(tempSesion);
        setModified(true);
        setSesionDialog(true);
    };

    const editCurso = (curso: typeof cursoCVacio) => {
        const tempCursoC = {
            Codigo: curso.Codigo,
            RutaImagenPortada: curso.RutaImagenPortada,
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
        const primerDiaSemanaInicio = startOfWeek(fechaInicioClases, { weekStartsOn: 0 }); // 0 para el domingo, 1 para el lunes, etc.

        // Mapear los días de la semana a sus índices
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const indiceDia = diasSemana.indexOf(dia);

        // Calcular la fecha basándonos en el número de semanas
        const fechaCalculada = addWeeks(primerDiaSemanaInicio, numeroSemana - 1); // Restamos 1 porque la primera semana es la semana de inicio

        // Obtener la fecha específica para el día de la semana
        const fechaFinal = new Date(fechaCalculada);
        fechaFinal.setDate(fechaCalculada.getDate() + ((indiceDia - fechaCalculada.getDay() + 7) % 7));

        // Formatear la fecha como "dd de mes del año"
        const formatoFecha = fechaFinal.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        console.log(`Fecha para ${dia} de la semana ${numeroSemana}: ${formatoFecha}`);
        return fechaFinal;
    };

    const descargarArchivo = async (ruta: string) => {
        try {
            const response = await axios.get('http://localhost:3001/api/files/download', {
                params: { fileName: ruta }
            });

            console.log(response);

            const blob = new Blob([response.data], { type: response.headers['content-type'] });

            // Crear un objeto URL del blob
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace temporal
            const link = document.createElement('a');
            link.href = url;

            // Establecer el nombre del archivo
            link.download = ruta;

            // Simular un clic en el enlace para iniciar la descarga
            document.body.appendChild(link);
            link.click();

            // Limpiar el enlace después de la descarga
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error de descarga de archivo',
                life: 3000
            });
        }
    };

    const onInputSesionChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof typeof sesionVacia) => {
        const val = (e.target && e.target.value) || '';
        let _sesion = { ...sesion };
        if (name === 'Fecha') {
            return;
        } else {
            _sesion[name] = val;
        }
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

    const hideImagenDialog = () => {
        setImagenDialog(false);
    };

    const cambiarImagen = async () => {
        try {
            const file = imagen!.files[0];
            const formData = new FormData();
            formData.append('file', file);
            console.log('Archivo Recibido:', file.name);

            await axios.post('http://localhost:3001/api/files/upload', formData).then((response) => {
                console.log(response.data.path);
                let _curso = { ...cursoCalificacion, RutaImagenPortada: response.data.filename };
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
                axios
                    .put('http://localhost:3001/api/curso-calificacion', {
                        codigo: _curso.Codigo,
                        rutaImagenPortada: _curso.RutaImagenPortada
                    })
                    .then((response) => {
                        console.log(response);
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Imagen actualizada con éxito', life: 3000 });
                        cargarDatos();
                    });
                setImagen(null);
                hideImagenDialog();
            });
        } catch (error) {
            console.error('Error en la carga del archivo:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error de carga de archivo',
                life: 3000
            });
        }
    };

    const subirArchivo = async (key: keyof typeof cursoCVacio) => {
        console.log('Subir ', key);

        let file: File | undefined; // Declara file fuera del bloque try

        try {
            switch (key) {
                case 'RutaSyllabus':
                    file = syllabus!.files[0];
                    break;
                case 'RutaNormas':
                    file = normas!.files[0];
                    break;
                case 'RutaPresentacionCurso':
                    file = presentacionCurso!.files[0];
                    break;
                case 'RutaPresentacionDocente':
                    file = presentacionDocente!.files[0];
                    break;

                default:
                    break;
            }

            if (!file) {
                throw new Error('No se ha seleccionado ningún archivo.');
            }

            const formData = new FormData();
            formData.append('file', file);
            console.log('Archivo Recibido:', file.name);

            await axios.post('http://localhost:3001/api/files/upload', formData).then((response) => {
                console.log(response.data.path);
                let _curso = { ...cursoCalificacion, [key]: response.data.filename };
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'ArchivoSubido' });
                axios
                    .put('http://localhost:3001/api/curso-calificacion', {
                        codigo: _curso.Codigo,
                        rutaSyllabus: _curso.RutaSyllabus,
                        rutaNormas: _curso.RutaNormas,
                        rutaPresentacionCurso: _curso.RutaPresentacionCurso,
                        rutaPresentacionDocente: _curso.RutaPresentacionDocente
                    })
                    .then((response) => {
                        console.log(response);
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Imagen actualizada con éxito', life: 3000 });
                        cargarDatos();
                    });
                setCursoCalificaion(cursoCVacio);
                switch (key) {
                    case 'RutaSyllabus':
                        setSyllabus(null);
                        break;
                    case 'RutaNormas':
                        setNormas(null);
                        break;
                    case 'RutaPresentacionCurso':
                        setPresentacionCurso(null);
                        break;
                    case 'RutaPresentacionDocente':
                        setPresentacionDocente(null);
                        break;
                    default:
                        break;
                }
            });
        } catch (error) {
            console.error('Error en la carga del archivo:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error de carga de archivo',
                life: 3000
            });
        }
    };

    const handleUpload = (event: FileUploadFilesEvent, key: keyof typeof cursoCVacio) => {
        console.log(event);
        switch (key) {
            case 'RutaImagenPortada':
                setImagen(event);
                break;
            case 'RutaSyllabus':
                setSyllabus(event);
                break;
            case 'RutaPresentacionCurso':
                setPresentacionCurso(event);
                break;
            case 'RutaPresentacionDocente':
                setPresentacionDocente(event);
                break;
            default:
                break;
        }
    };

    const sesionDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideSesionDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveSesion} />
        </React.Fragment>
    );

    const imagenDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideImagenDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={cambiarImagen} />
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
            const hora = new Date(`2000-01-01T${rowData.HoraInicio}`);
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
                hora.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            );
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <Link href={`/docente/cursos/recursos?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Recursos" icon="pi pi-folder-open" className="p-button-help mr-1" style={{ padding: '0.75em', fontSize: '0.75em' }} />
                </Link>

                <Link href={`/docente/cursos/actividades?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Actividades" icon="pi pi-book" className="p-button-success p-button-sm mr-1" style={{ padding: '0.75em', fontSize: '0.75em' }} />
                </Link>

                <Link href={`/docente/cursos/asistencias?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Asistencia" icon="pi pi-list" className="p-button-info p-button-sm mr-1" style={{ padding: '0.75em', fontSize: '0.75em' }} />
                </Link>

                <Button tooltip="Editar" icon="pi pi-pencil" className="p-button-warning p-button-sm mr-3" style={{ padding: '0.75em', fontSize: '0.75em' }} onClick={() => editSesion(rowData)} />
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
                    <Column className={classNames({ 'text-right': true })} headerStyle={{ display: 'none' }} body={actionBodyTemplate} style={{ minWidth: '8rem', paddingRight: '1rem' }}></Column>
                </DataTable>
                <Button tooltip="Nueva Sesion" icon="pi pi-plus" className="p-button-success p-button-sm m-2" style={{ padding: '0.75em' }} onClick={() => openNew(rowData)} outlined />
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

    const header = (
        <>
            <div style={{ position: 'relative', height: '300px' }}>
                <Button icon="pi pi-image" tooltip="Cambiar imagen de fondo" severity="secondary" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '1' }} onClick={() => setImagenDialog(true)} />
                {imagenURL && (
                    <div className="field">
                        <img alt="Card" src={imagenURL} height={300} style={{ objectFit: 'cover' }} />
                    </div>
                )}
            </div>
        </>
    );
    const title = (curso: typeof cursoVacio) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h4>
                    {curso?.Nombre}
                    <Button tooltip="Editar datos del curso" icon="pi pi-pencil" className="p-button-warning p-button-sm ml-3 pb-1" style={{ padding: '0.75em' }} onClick={() => editCurso(cursoCalificacion)} text />
                </h4>
            </div>
        );
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
            </div>
            <div className="col-9 m-0">
                <div>
                    <Card
                        title={title(curso)}
                        header={header}
                        subTitle={'Codigo (' + curso?.Codigo + ')'}
                        style={{
                            border: 'none',
                            borderRadius: 0,
                            boxShadow: 'none'
                        }}
                    ></Card>

                    <TabView>
                        <TabPanel header="Datos del curso" leftIcon="pi pi-info-circle mr-2">
                            <div className="p-fluid">
                                <div className="field">
                                    <div className="text-center">
                                        <span className="text-primary" style={{ fontWeight: 'bold' }}>
                                            {curso?.Nombre}
                                        </span>
                                        <span className="text-primary"> ({curso?.Codigo})</span>
                                        <br />
                                        <small className="text-muted">{curso?.CarreraProfesional?.NombreCarrera}</small>
                                    </div>
                                </div>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label htmlFor="nivel" className="font-bold">
                                            Año
                                        </label>
                                        <InputText id="nivel" value={curso?.Nivel.toString()} disabled />
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="semestre" className="font-bold">
                                            Semestre
                                        </label>
                                        <InputText id="semestre" value={curso?.Semestre.toString()} disabled />
                                    </div>
                                </div>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label htmlFor="horasTeoria" className="font-bold">
                                            Horas Teoria
                                        </label>
                                        <InputText id="horasTeoria" value={curso?.HorasTeoria.toString()} disabled />
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="horasPractica" className="font-bold">
                                            Horas Práctica
                                        </label>
                                        <InputText id="horasPractica" value={curso?.HorasPractica.toString()} disabled />
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="semestre" className="font-bold">
                                            Créditos
                                        </label>
                                        <InputText id="semestre" value={curso?.Semestre.toString()} disabled />
                                    </div>
                                </div>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label htmlFor="rutaSyllabus" className="font-bold">
                                            Syllabus
                                        </label>
                                        <div>
                                            <Button
                                                icon="pi pi-download"
                                                label="Descargar"
                                                severity="info"
                                                className="mr-2"
                                                onClick={() => descargarArchivo(cursoCalificacion.RutaSyllabus)}
                                                disabled={cursoCalificacion.RutaSyllabus == ''}
                                                style={{ width: '150px' }}
                                            />
                                        </div>{' '}
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="rutaNormas" className="font-bold">
                                            Normas de convivencia
                                        </label>
                                        <div>
                                            <Button
                                                icon="pi pi-download"
                                                label="Descargar"
                                                severity="info"
                                                className="mr-2"
                                                onClick={() => descargarArchivo(cursoCalificacion.RutaNormas)}
                                                disabled={cursoCalificacion.RutaNormas == ''}
                                                style={{ width: '150px' }}
                                            />
                                        </div>{' '}
                                    </div>
                                </div>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label htmlFor="rutaPresentacionCurso" className="font-bold">
                                            Presentación del curso
                                        </label>
                                        <div>
                                            <Button
                                                icon="pi pi-download"
                                                label="Descargar"
                                                severity="info"
                                                className="mr-2"
                                                onClick={() => descargarArchivo(cursoCalificacion.RutaPresentacionCurso)}
                                                disabled={cursoCalificacion.RutaPresentacionCurso == ''}
                                                style={{ width: '150px' }}
                                            />
                                        </div>{' '}
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="rutaPresentacionDocente" className="font-bold">
                                            Presentación del docente
                                        </label>
                                        <div>
                                            <Button
                                                icon="pi pi-download"
                                                label="Descargar"
                                                severity="info"
                                                className="mr-2"
                                                onClick={() => descargarArchivo(cursoCalificacion.RutaPresentacionDocente)}
                                                disabled={cursoCalificacion.RutaPresentacionDocente == ''}
                                                style={{ width: '150px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label htmlFor="competencia" className="font-bold">
                                            Competencia
                                        </label>
                                        <InputTextarea id="competencia" value={cursoCalificacion.Competencia || ''} disabled />
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="capacidad" className="font-bold">
                                            Capacidad
                                        </label>
                                        <InputTextarea id="capacidad" value={cursoCalificacion.Capacidad || ''} disabled />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="Sesiones" leftIcon="pi pi-list mr-2">
                            <DataTable ref={dt} value={unidades} dataKey="Codigo" emptyMessage="No se han encontrado cursos a matricular">
                                <Column headerStyle={{ display: 'none' }} body={unidadBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
            <Dialog visible={sesionDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos de la sesión" modal className="p-fluid" footer={sesionDialogFooter} onHide={hideSesionDialog}>
                <div className="field">
                    <label htmlFor="nombres" className="font-bold">
                        Nombre de la sesión
                    </label>
                    <InputText id="nombres" value={sesion.Descripcion} onChange={(e) => onInputSesionChange(e, 'Descripcion')} required autoFocus maxLength={100} className={classNames({ 'p-invalid': submitted && !sesion.Descripcion })} />
                    {submitted && !sesion.Descripcion && <small className="p-error">Ingrese el nombre de la sesión.</small>}
                </div>

                <div className="field">
                    <label htmlFor="linkClaseVirtual" className="font-bold">
                        Enlace para clase virtual
                    </label>
                    <InputText
                        id="linkClaseVirtual"
                        value={sesion.LinkClaseVirtual}
                        onChange={(e) => onInputSesionChange(e, 'LinkClaseVirtual')}
                        required
                        autoFocus
                        maxLength={100}
                        className={classNames({ 'p-invalid': submitted && !sesion.LinkClaseVirtual })}
                    />
                    {submitted && !sesion.LinkClaseVirtual && <small className="p-error">Ingrese el nombre de la sesión.</small>}
                </div>
            </Dialog>
            <Dialog visible={imagenDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Imagen de fondo" modal className="p-fluid" footer={imagenDialogFooter} onHide={hideImagenDialog}>
                <div className="field">
                    <FileUpload chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }} chooseLabel="Subir archivo" accept="image/*" maxFileSize={5000000} auto customUpload={true} uploadHandler={(e) => handleUpload(e, 'RutaImagenPortada')} />
                </div>
            </Dialog>
            <Dialog visible={cursoCDialog} style={{ width: '60rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos del curso" modal className="p-fluid" footer={cursoCDialogFooter} onHide={hideCursoCDialog}>
                <div className="field">
                    <div className="text-center">
                        <span className="text-primary" style={{ fontWeight: 'bold' }}>
                            {curso?.Nombre}
                        </span>
                        <span className="text-primary"> ({curso?.Codigo})</span>
                        <br />
                        <small className="text-muted">{curso?.CarreraProfesional?.NombreCarrera}</small>
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="nivel" className="font-bold">
                            Año
                        </label>
                        <InputText id="nivel" value={curso?.Nivel.toString()} disabled />
                    </div>
                    <div className="field col">
                        <label htmlFor="semestre" className="font-bold">
                            Semestre
                        </label>
                        <InputText id="semestre" value={curso?.Semestre.toString()} disabled />
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
                        <FileUpload
                            chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }}
                            chooseLabel="Subir archivo"
                            accept="application/pdf"
                            maxFileSize={5000000}
                            auto
                            customUpload={true}
                            uploadHandler={(e) => handleUpload(e, 'RutaSyllabus')}
                        />
                    </div>
                    <div className="field col">
                        <label htmlFor="rutaNormas" className="font-bold">
                            Normas de convivencia
                        </label>
                        <FileUpload chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }} chooseLabel="Subir archivo" accept="application/pdf" maxFileSize={5000000} auto customUpload={true} uploadHandler={(e) => handleUpload(e, 'RutaNormas')} />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="rutaPresentacionCurso" className="font-bold">
                            Presentación del curso
                        </label>
                        <FileUpload
                            chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }}
                            chooseLabel="Subir archivo"
                            accept="application/pdf"
                            maxFileSize={5000000}
                            auto
                            customUpload={true}
                            uploadHandler={(e) => handleUpload(e, 'RutaPresentacionCurso')}
                        />
                    </div>
                    <div className="field col">
                        <label htmlFor="rutaPresentacionDocente" className="font-bold">
                            Presentación del docente
                        </label>
                        <FileUpload
                            chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }}
                            chooseLabel="Subir archivo"
                            accept="application/pdf"
                            maxFileSize={5000000}
                            auto
                            customUpload={true}
                            uploadHandler={(e) => handleUpload(e, 'RutaPresentacionDocente')}
                        />
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
