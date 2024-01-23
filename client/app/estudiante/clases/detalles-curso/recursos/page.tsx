/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export default function ActividadesPage() {
    const searchParams = useSearchParams();
    const codigoSesion = searchParams.get('codigo');

    let recursoVacio = {
        Codigo: 0,
        Titulo: '',
        Ruta: '',
        Tipo: '',
        CodigoSesion: codigoSesion
    };

    const sesionVacia = {
        Codigo: '',
        Numero: '',
        Descripcion: '',
        CodigoSemanaAcademica: ''
    };

    const [recursos, setRecursos] = useState<(typeof recursoVacio)[]>([]);
    const [recurso, setRecurso] = useState(recursoVacio);
    const [sesion, setSesion] = useState(sesionVacia);
    const toast = useRef<Toast>(null);

    const fetchActividades = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/recursoAcademico', {
                params: { codigoSesion: codigoSesion }
            });
            setRecursos(response.data.recursosAcademicos);
            setSesion(response.data.sesion);
            console.log(response.data)
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los Recursos de la Sesión',
                life: 3000
            });
        }
    };

    useEffect(() => {
        fetchActividades();
    }, []);


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

    return (
        <div className="card">
            <Toast ref={toast} />

            <h3 className="text-primary">Sesion: {sesion?.Descripcion || 'Cargando...'}</h3>
            <h5>Recursos Académicos</h5>
            {recursos.map((recurso, index) => (
                <div key={index} className="col-12">
                    <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                        <img className="w-6 sm:w-16rem xl:w-8rem block xl:block mx-auto border-round" src={`/images/${getIconPath(recurso.Tipo)}.png`} alt="Recurso Académico" />
                        <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                                <div className="text-2xl font-bold text-900">{recurso.Titulo}</div>
                                <small>{` (Archivo tipo ${recurso.Tipo} )`}</small>
                                <Button icon="pi pi-download" label='Descargar' severity="success"  className="mr-2" onClick={() => descargarArchivo(recurso.Ruta)} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    function getIconPath(extension: string) {
        switch (extension.toLowerCase()) {
            case 'pdf':
                return 'pdf';
            case 'doc':
            case 'docx':
                return 'word';
            case 'ppt':
                return 'ppt';
            case 'xls':
            case 'xlsx':
                return 'excel';
            case 'mp4':
                return 'video';
            case 'png':
            case 'jpg':
            case 'jpeg':
                return 'imagen';
            // Agrega más casos para otros tipos de archivos...
            default:
                return 'archivo'; // Icono por defecto para tipos desconocidos
        }
    }
}
