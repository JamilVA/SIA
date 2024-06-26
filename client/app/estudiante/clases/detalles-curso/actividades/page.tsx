/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { BlockUI } from 'primereact/blockui';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import React, { useEffect, useRef, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { axiosInstance as axios } from '../../../../../utils/axios.instance';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function ActividadesPage() {
    const searchParams = useSearchParams();
    const codigoSesion = searchParams.get('codigo');
    const { data: session, status } = useSession();

    const actividadEstudianteVacio = {
        CodigoActividad: 0,
        CodigoEstudiante: 0,
        Nota: 0,
        Observacion: '',
        RutaTarea: ''
    };

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
    const [actividad, setActividad] = useState(emptyActividad);
    const [fileName, setFileName] = useState('');
    const [archivo, setArchivo] = useState<FileUploadFilesEvent | null>(null);

    const toast = useRef<Toast>(null);

    const [totalSize, setTotalSize] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);

    const fetchActividades = async () => {
        await axios
            .get('/actividad/estudiante', {
                params: {
                    codigoSesion: codigoSesion,
                    codigoEstudiante: session?.user.codigoEstudiante
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                // console.log(response);
                setActividades(response.data.actividades);
            })
            .catch((error) => {
                // console.error(error);
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
            try {
                const data = await axios.get('/actividadEstudiante', {
                    params: {
                        codigoActividad: actividad.Codigo,
                        codigoEstudiante: session?.user.codigoEstudiante
                    },
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                });
                // console.log('Recurso:', data);
            } catch (error) {
                // console.error(error);
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
        if (status === 'authenticated') {
            fetchActividades();
            obtenerActividadEstudiante();
        }
    }, [status]);

    const onTemplateSelect = (e: FileUploadFilesEvent, actividad: typeof emptyActividad, subido: boolean) => {
        let _totalSize = totalSize;
        let files = e.files;

        Object.keys(files).forEach((key: any) => {
            _totalSize += files[key].size || 0;
        });

        setArchivo(e);
        setActividad(actividad);

        // console.log(e);

        setTotalSize(_totalSize);
    };

    const crearActividarEstudiante = async (actividad: typeof emptyActividad, callback: any) => {
        // console.log('ActividadRecibida', actividad);
        let _fileName = '';

        try {
            // console.log('Archivo Recibido:', archivo);
            const file = archivo!.files[0];
            const formData = new FormData();
            formData.append('file', file);
            // console.log('Archivo Recibido:', file.name);

            await axios.post('/files/upload', formData).then((response) => {
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
                setArchivo(null);
                setActividad(emptyActividad);
                setTotalSize(0);
                _fileName = response.data.filename;
            });

            const response = await axios.post('/actividadEstudiante', {
                CodigoActividad: actividad.Codigo,
                CodigoEstudiante: session?.user.codigoEstudiante,
                RutaTarea: _fileName
            },
            {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: response.data.message,
                life: 3000
            });

            fetchActividades();
        } catch (error) {
            // console.error('Error:', error);
        }

        callback();
    };

    const onTemplateClear = () => {
        setTotalSize(0);
    };

    const descargarArchivo = async (ruta: string) => {
        await axios
            .get('/files/download', {
                params: { fileName: ruta },
                responseType: 'arraybuffer'
            })
            .then((response) => {
                //// console.log(response); 
                const file = new File([response.data], ruta);        
                const url = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;            
                link.click();
                URL.revokeObjectURL(url);
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? 'El archivo no existe' : error.message,
                    life: 3000
                });
            });
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

    const verificarHoraCierre = () => {
        const horaActual = new Date();

        setActividades((prevActividades) => {
            return prevActividades.map((actividad) => {
                const fechaCierre = new Date(actividad.FechaCierre);

                fechaCierre.setMinutes(fechaCierre.getMinutes() - 3);

                const actividadAbierta = horaActual <= fechaCierre && horaActual >= new Date(actividad.FechaApertura);
                return { ...actividad, actividadAbierta };
            });
        });
    };

    // Verificar la hora de cierre cada minuto (60000 milisegundos)
    useEffect(() => {
        const intervalId = setInterval(verificarHoraCierre, 15000);

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);

    const actividadTemplate = (actividad: any) => {
        // console.log(actividad?.ActividadEstudiantes);
        let actividadAbierta = false;
        let actividadSubida = false;

        if (actividad) {
            actividadAbierta = new Date() < new Date(actividad.FechaCierre) && new Date() >= new Date(actividad.FechaApertura);
        }
        if (actividad?.ActividadEstudiantes[0]?.RutaTarea) {
            actividadSubida = true;
        }

        const severityFecha = actividadAbierta ? 'success' : 'danger';
        const mensajeFecha = actividadAbierta ? 'Abierto' : 'Cerrado';

        const severityArchivo = actividadSubida ? 'success' : 'danger';
        const mensajeArchivo = actividadSubida ? 'Tarea registrada' : 'Tarea no registrada';

        return (
            <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-start">
                    <div className="col-12">
                        <div className="col-12 flex flex-column align-items-center sm:align-items-start">
                            <h3 className="font-bold text-primary">{actividad?.Titulo}</h3>
                            <Button icon="pi pi-download" label="Descargar archivo guía" severity="info" className="button-sm mr-2" onClick={() => descargarArchivo(actividad.RutaRecursoGuia)} />
                            <div className="flex align-items-center gap-3">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-clock mr-2"></i>
                                    <span className="font-semibold">
                                        <strong>Apertura: </strong>
                                        {formatDate(new Date(actividad?.FechaApertura))}
                                    </span>
                                    <span className="font-semibold">
                                        <strong>Cierre: </strong>
                                        {formatDate(new Date(actividad?.FechaCierre))}
                                    </span>
                                    <Tag severity={severityFecha} value={mensajeFecha}></Tag>
                                </span>
                            </div>
                            <div style={{ minWidth: '90%' }}>
                                <h6>Subir Actividad:</h6>
                                <BlockUI blocked={!actividadAbierta}>
                                    <Tooltip target=".custom-choose-btn" content="Examinar" position="bottom" />
                                    <Tooltip target=".custom-upload-btn" content="Subir" position="bottom" />
                                    <Tooltip target=".custom-cancel-btn" content="Cancelar" position="bottom" />

                                    <FileUpload
                                        ref={fileUploadRef}
                                        maxFileSize={5000000}
                                        onSelect={(e) => onTemplateSelect(e, actividad, actividadSubida)}
                                        onClear={onTemplateClear}
                                        headerTemplate={headerTemplate}
                                        itemTemplate={itemTemplate}
                                        emptyTemplate={emptyTemplate}
                                        chooseOptions={chooseOptions}
                                        uploadOptions={uploadOptions}
                                        cancelOptions={cancelOptions}
                                        style={{ width: '100%' }}
                                    />
                                </BlockUI>
                            </div>
                            <Tag severity={severityArchivo} value={mensajeArchivo}></Tag>
                            <br />
                            {actividadSubida && <Button icon="pi pi-file" label="Mi archivo registrado" severity="secondary" className="button-sm mr-2" onClick={() => descargarArchivo(actividad?.ActividadEstudiantes[0]?.RutaTarea)} />} <br />
                    
                            {actividad?.ActividadEstudiantes[0]?.Nota && (
                                <>
                                    <Panel header={'NOTA: ' + (actividad?.ActividadEstudiantes[0]?.Nota ?? '')} toggleable style={{width: '90%'}}>
                                        <p className="m-0">{actividad?.ActividadEstudiantes[0]?.Observacion ?? ''}</p>
                                    </Panel>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Divider />
            </div>
            
        );
    };

    const headerTemplate = (options: any) => {
        const { className, chooseButton, cancelButton } = options;
        const value = totalSize / 50000;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formatedValue} / 5 MB</span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const itemTemplate = (file: any, props: any) => {
        return (
            <div>
                <div className="flex align-items-center flex-wrap">
                    <div className="flex align-items-center" style={{ width: '40%' }}>
                        <img alt={file.name} role="presentation" src="/images/upload.png" width={50} />
                        <span className="flex flex-column text-left ml-3">
                            {file.name}
                            <small>{new Date().toLocaleDateString()}</small>
                        </span>
                    </div>
                    <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
                    <Button icon="pi pi-upload" tooltip="Subir tarea" className="ml-auto" severity="success" outlined rounded size="small" onClick={() => crearActividarEstudiante(actividad, props.onRemove)} />
                </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-folder mt-3 p-5" style={{ fontSize: '2.5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Arrastre su archivo aqui
                </span>
            </div>
        );
    };

    const chooseOptions = { icon: 'pi pi-fw pi-folder', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined display:none' };
    const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

    if (status === 'loading') {
        return (
            <>
                <div className="flex items-center justify-center align-content-center" style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        );
    }

    if (!session) {
        redirect('/')
    } else if (session?.user.nivelUsuario != 4) {
        redirect('/pages/notfound');
    }

    return (
        <div className="card">
            <Toast ref={toast} />
            <h3>Lista de Actividades</h3>
            <DataView value={actividades} itemTemplate={actividadTemplate} />
        </div>
    );
}
