/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
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
    const [recursoDialog, setRecursoDialog] = useState(false);
    const [deleteRecursoDialog, setDeleteRecursoDialog] = useState(false);
    const [recurso, setRecurso] = useState(recursoVacio);
    const [archivo, setArchivo] = useState<FileUploadFilesEvent | null>(null);
    const [sesion, setSesion] = useState(sesionVacia);
    const [submitted, setSubmitted] = useState(false);
    const [modificar, setModificar] = useState(false);
    const toast = useRef<Toast>(null);

    const fetchActividades = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/recursoAcademico', {
                params: { codigoSesion: codigoSesion }
            });
            setRecursos(response.data.recursosAcademicos);
            setSesion(response.data.sesion);
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

    const openNew = () => {
        setRecurso(recursoVacio);
        setSubmitted(false);
        setRecursoDialog(true);
        setModificar(false);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRecursoDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteRecursoDialog(false);
    };

    const saveActividad = async () => {
        setSubmitted(true);

        if (recurso.Titulo.length === 0) {
            return;
        }
        setRecursoDialog(false);

        if (!modificar) {
            crearRecurso();
        } else {
            modificarRecurso(recurso);
            subirArchivo(recurso)
        }

        setRecurso(recursoVacio);
    };

    const crearRecurso = async () => {
        try {
            const response = await axios.post('http://localhost:3001/api/recursoAcademico', recurso);
            let _recursos = [...recursos];
            _recursos.push(response.data.recursoAcademico);
            subirArchivo(response.data.recursoAcademico)
            setRecursos(_recursos);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: response.data.message,
                life: 3000
            });
            fetchActividades();
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el Recurso Académico',
                life: 3000
            });
        }
    };

    const modificarRecurso = async (recurso: any) => {
        try {
            const response = await axios.put('http://localhost:3001/api/recursoAcademico', recurso);
            let _recursos = recursos.map((value) => (value.Codigo === recurso.Codigo ? recurso : value));
            setRecursos(_recursos);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: response.data.message,
                life: 3000
            });
            fetchActividades();
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo modificar el Recurso Académico',
                life: 3000
            });
        }
    };

    const editRecurso = (recurso: typeof recursoVacio) => {
        setRecurso({ ...recurso });
        setRecursoDialog(true);
        setModificar(true);
    };

    const confirmDeleteRecurso = (recurso: typeof recursoVacio) => {
        setRecurso(recurso);
        setDeleteRecursoDialog(true);
    };

    const deleteRecurso = async () => {
        setDeleteRecursoDialog(false);
        try {
            await axios.delete('http://localhost:3001/api/recursoAcademico', {
                params: { codigo: recurso.Codigo }
            });
            let _recursos = recursos.filter((val) => val.Codigo !== recurso.Codigo);
            setRecursos(_recursos);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Recurso eliminado exitosamente',
                life: 3000
            });
            fetchActividades();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el Recurso',
                life: 3000
            });
        }
        setRecurso(recursoVacio);
    };

    const subirArchivo =  async (recurso: typeof recursoVacio) => {

        try {
            const file = archivo!.files[0];
            const tipoArchivo = file.name.split('.')[1];
            const formData = new FormData();
            formData.append('file', file);
            console.log('Archivo Recibido:', file.name);
            console.log('Tipo de Archivo:', file.name.split('.')[1]);

            await axios.post('http://localhost:3001/api/files/upload', formData).then((response) => {
                console.log(response.data.path);
                let _recurso = { ...recurso, Ruta: response.data.filename, Tipo: tipoArchivo};
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
                modificarRecurso(_recurso);
                setRecurso(recursoVacio);
                setArchivo(null);
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


    const descargarArchivo = async (ruta: string) => {
        await axios.get('http://localhost:3001/api/files/download', {
            params: { fileName: ruta },
            responseType: 'arraybuffer' 
        })
            .then(response => {
                //console.log(response); 
                const file = new File([response.data], ruta);        
                const url = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;            
                link.click();
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                //console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "El archivo no existe" : error.message,
                    life: 3000
                })
            })
    };

    const handleUpload = (event: FileUploadFilesEvent, rowData: typeof recursoVacio) =>{
        setArchivo(event)
        setRecurso(rowData)
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        let _recursos = { ...recurso, Titulo: val };

        setRecurso(_recursos);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo recurso" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveActividad} />
        </>
    );

    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteRecurso} />
        </>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h3 className="text-primary">Sesion: {sesion.Descripcion}</h3>
            <h5>Recursos Académicos</h5>
            <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

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
                            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                                <Button icon="pi pi-pencil" rounded severity="warning" className="mr-2" onClick={() => editRecurso(recurso)} />
                                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteRecurso(recurso)} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <Dialog visible={recursoDialog} style={{ width: '450px' }} header="Detalles del recurso" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name">Título</label>
                    <InputText
                        id="name"
                        value={recurso.Titulo}
                        onChange={(e) => onInputChange(e)}
                        required
                        autoFocus
                        maxLength={100}
                        className={classNames({
                            'p-invalid': submitted && !recurso.Titulo
                        })}
                    />
                    {submitted && !recurso.Titulo && <small className="p-invalid">Título es requerido.</small>}
                </div>
                <div className="field">
                    <FileUpload chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }} chooseLabel="Subir archivo" mode="basic" maxFileSize={5000000} auto customUpload={true} uploadHandler={(e) => handleUpload(e, recurso)} />
                </div>
            </Dialog>

            <Dialog visible={deleteRecursoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {recurso && (
                        <span>
                            ¿Seguro de que desea eliminar <b>{recurso.Titulo}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
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
