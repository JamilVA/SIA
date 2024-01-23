/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'primereact/calendar';

import { useSearchParams } from 'next/navigation';

import axios from 'axios';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function ActividadesPage() {
    const searchParamas = useSearchParams();
    const codigoSesion = searchParamas.get('codigo');

    console.log('Codigo Recibido:', codigoSesion);

    const actividadEstudianteVacio = {
        Nota: 0,
        Observacion:'',
        RutaTarea:''
    }

    let emptyActividad = {
        Codigo: 0,
        Titulo: '',
        RutaRecursoGuia: '',
        FechaApertura: new Date().toISOString(),
        FechaCierre: new Date().toISOString(),
        CodigoSesion: codigoSesion
    };

    const [actividades, setActividades] = useState<(typeof emptyActividad)[]>([]);
    const [actividadEstudiante, setActividadEstudiante] = useState(actividadEstudianteVacio);
    const [archivo, setArchivo] = useState<FileUploadFilesEvent | null>(null);

    const [submitted, setSubmitted] = useState(false);
    const [modificar, setModificar] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchActividades = async () => {
        await axios
            .get('http://localhost:3001/api/actividad/estudiante', {
                params: { 
                    codigoSesion: codigoSesion ,
                    codigoEstudiante: 11 ,
                }
            })
            .then((response) => {
                console.log(response);
                setActividades(response.data.actividades);
            })
            .catch((error) => {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            });


    };

    const obtenerActividadEstudiante = async () => {
        for (const actividad of actividades) {
            console.log('Hola')
            try {
                console.log('Hola') 
                const holiholi = await axios.get('http://localhost:3001/api/actividadEstudiante', {
                    params: {
                        codigoActividad: actividad.Codigo,
                        codigoEstudiante: 11
                    }
                });
                console.log('Recurso:', holiholi);  

            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se a cargado el archivo correctamente',
                    life: 3000
                });
            }
        }
    };

    useEffect(() => {
        fetchActividades();
        obtenerActividadEstudiante();

    }, []);

    

    const handleUpload = (event: FileUploadFilesEvent, rowData: typeof actividadEstudianteVacio) =>{
        setArchivo(event)
        setActividadEstudiante(rowData)
    }

    const descargarArchivo = async (ruta: string) => {
        try {
            const response = await axios.get('http://localhost:3001/api/files/download',{
                params:{ fileName: ruta }
            });

            console.log(response)
    
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

    const itemTemplate = (actividad: any) => {
        return (
            <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <h3 className="font-bold text-primary">{actividad.Titulo}</h3>
                            <Button icon="pi pi-download" label="Descargar archivo guía" severity="success" className="mr-2" onClick={() => descargarArchivo(actividad.RutaRecursoGuia)} />
                            <div className="flex align-items-center gap-3">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-clock mr-2"></i>
                                    <span className="font-semibold">
                                        <strong>Apertura: </strong>
                                        {formatDate(new Date(actividad.FechaApertura))}
                                    </span>
                                    <span className="font-semibold">
                                        <strong>Cierre: </strong>
                                        {formatDate(new Date(actividad.FechaCierre))}
                                    </span>
                                </span>
                            </div>
                            <div className="card">
                                <h6>Subir Actividad:</h6>
                                <FileUpload
                                    name="demo[]"
                                    url={'/api/upload'}
                                    multiple
                                    accept="image/*"
                                    maxFileSize={1000000}
                                    uploadHandler={(e) => handleUpload(e, actividad)}
                                    emptyTemplate={<p className="m-0">Arrastra y suelta archivos aquí para subirlos.</p>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <h3>Lista de Actividades</h3>
            <DataView value={actividades} itemTemplate={itemTemplate} />
        </div>
    );
}
