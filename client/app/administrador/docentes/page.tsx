'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Calendar } from 'primereact/calendar';
import { CalendarChangeEvent } from 'primereact/calendar';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';

export default function DocentesDemo() {
    let emptyDocente: {
        codigo: null | string;
        condicionLaboral: string;
        estado: boolean | string;
        paterno: string;
        materno: string;
        nombres: string;
        rutaFoto: string;
        codigoPersona: string;
        fechaNacimiento: string | Date;
        sexo: string;
        DNI: string;
        email: string;
    } = {
        codigo: null,
        codigoPersona: '',
        condicionLaboral: '',
        estado: true,
        paterno: '',
        materno: '',
        nombres: '',
        rutaFoto: '',
        fechaNacimiento: '',
        sexo: '',
        DNI: '',
        email: ''
    };

    const [docenteDialog, setDocenteDialog] = useState(false);
    const [cambioDNI, setCambioDNI] = useState(false);
    const [cambioEmail, setCambioEmail] = useState(false);
    const [cambioImagen, setCambioImagen] = useState(false);
    const [deleteDocenteDialog, setDeleteDocenteDialog] = useState(false);
    const [advertencia, setAdvertencia] = useState({ activo: false, mensaje: '' });
    const [docente, setDocente] = useState(emptyDocente);
    const [docentes, setDocentes] = useState<(typeof docente)[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);

    const [imagenURL, setImagenURL] = useState<string | null>(null);
    const [archivo, setArchivo] = useState<FileUploadFilesEvent | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await axios.get('http://localhost:3001/api/docente');

            const docentesConNombreCompleto = result.data.docentes.map((docente: any) => ({
                ...docente,
                NombreCompleto: `${docente.Persona.Nombres} ${docente.Persona.Paterno} ${docente.Persona.Materno}`
            }));

            // Establecer los docentes en el estado
            setDocentes(docentesConNombreCompleto);
            console.log(result.data);
        } catch (e) {
            console.log(e);
            toast.current?.show({
                severity: 'error',
                summary: 'Operacion fallida',
                detail: 'Ha ocurrido un error al procesar la solicitud',
                life: 3000
            });
        }
    };

    const openNew = () => {
        setDocente(emptyDocente);
        setCambioEmail(false);
        setCambioDNI(false);
        setSubmitted(false);
        setDocenteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDocenteDialog(false);
        setCambioEmail(false);
        setCambioDNI(false);
        setImagenURL(null)
    };

    const hideDeleteDocenteDialog = () => {
        setDeleteDocenteDialog(false);
        setCambioEmail(false);
        setCambioDNI(false);
    };

    const saveDocente = () => {
        setSubmitted(true);

        if (docente.nombres.trim() && docente.paterno.trim() && docente.materno.trim() && docente.fechaNacimiento && docente.sexo && docente.DNI.trim() && docente.email.trim() && docente.condicionLaboral.trim()) {
            let _docente = { ...docente };

            if (!docente.codigo) {
                if (validarDNI(docente.DNI.trim()) && validarEmail(docente.email.trim())) {
                    axios
                        .post('http://localhost:3001/api/docente', {
                            paterno: _docente.paterno,
                            materno: _docente.materno,
                            nombres: _docente.nombres,
                            email: _docente.email,
                            sexo: _docente.sexo,
                            fechaNacimiento: _docente.fechaNacimiento,
                            DNI: _docente.DNI,
                            rutaFoto: _docente.rutaFoto,
                            condicionLaboral: _docente.condicionLaboral
                        })
                        .then((response) => {
                            console.log(response.data);
                            subirArchivo(response.data.docente.CodigoPersona);
                            toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Docente creado con éxito', life: 3000 });
                            fetchData();
                        });
                    setDocenteDialog(false);
                    setDocente(emptyDocente);

                    setCambioEmail(false);
                    setCambioDNI(false);
                }
            } else if ((!cambioDNI || (cambioDNI && validarDNI(docente.DNI.trim()))) && (!cambioEmail || (cambioEmail && validarEmail(docente.email.trim())))) {
                axios
                    .put('http://localhost:3001/api/docente', {
                        codigo: _docente.codigo,
                        paterno: _docente.paterno,
                        materno: _docente.materno,
                        nombres: _docente.nombres,
                        email: _docente.email,
                        sexo: _docente.sexo,
                        fechaNacimiento: _docente.fechaNacimiento,
                        DNI: _docente.DNI,
                        rutaFoto: _docente.rutaFoto,
                        codigoPersona: _docente.codigoPersona,
                        condicionLaboral: _docente.condicionLaboral
                    })
                    .then((response) => {
                        console.log(response);
                        if (cambioImagen) {
                            subirArchivo(_docente.codigoPersona);
                        }
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Docente actualizado con éxito', life: 3000 });
                        fetchData();
                    });
                setDocenteDialog(false);
                setDocente(emptyDocente);

                setCambioEmail(false);
                setCambioDNI(false);
            }
        }
    };

    const validarEmail = (email: string) => {
        const emailExists = docentes.some((doc: any) => {
            return doc.Persona.Email === email;
        });

        if (emailExists) {
            setAdvertencia({ activo: true, mensaje: 'Este correo ya está registrado. Por favor, ingresa otro.' });
            return false;
        }
        // Si el DNI es válido, oculta la advertencia y devuelve true
        setAdvertencia({ activo: false, mensaje: '' });
        return true;
    };

    const validarDNI = (DNI: string) => {
        // Expresión regular para verificar que el DNI contenga solo números
        const regexSoloNumeros = /^[0-9]+$/;

        // Expresión regular para verificar que el DNI tenga exactamente 8 dígitos
        const regexOchoDigitos = /^[0-9]{8}$/;

        if (!regexSoloNumeros.test(DNI)) {
            setAdvertencia({ activo: true, mensaje: 'Por favor, ingrese un DNI válido.' });
            return false;
        }

        if (!regexOchoDigitos.test(DNI)) {
            setAdvertencia({ activo: true, mensaje: 'El DNI debe tener exactamente 8 dígitos.' });
            return false;
        }

        const dniExists = docentes.some((doc: any) => {
            return doc.Persona.DNI === DNI;
        });

        if (dniExists) {
            setAdvertencia({ activo: true, mensaje: 'Este DNI ya está registrado. Por favor, ingresa otro.' });
            return false;
        }

        // Si el DNI es válido, oculta la advertencia y devuelve true
        setAdvertencia({ activo: false, mensaje: '' });
        return true;
    };

    const HideAdvertencia = () => {
        setAdvertencia({ activo: false, mensaje: '' });
    };

    const editDocente = (docente: any) => {
        let tempDocente = {
            codigo: docente.Codigo,
            condicionLaboral: docente.CondicionLaboral,
            estado: docente.Estado,
            paterno: docente.Persona.Paterno,
            materno: docente.Persona.Materno,
            nombres: docente.Persona.Nombres,
            rutaFoto: docente.Persona.RutaFoto,
            codigoPersona: docente.CodigoPersona,
            fechaNacimiento: new Date(docente.Persona.FechaNacimiento),
            sexo: docente.Persona.Sexo,
            DNI: docente.Persona.DNI,
            email: docente.Persona.Email
        };

        obtenerArchivo(docente.Persona.RutaFoto);
        setDocente(tempDocente);
        console.log('D', tempDocente);
        setDocenteDialog(true);
    };

    const confirmDeleteDocente = (docente: any) => {
        setDocente(docente);
        setDeleteDocenteDialog(true);
    };

    const deleteDocente = (rowData: any) => {
        const _estado = rowData.Estado ? false : true;
        axios
            .put('http://localhost:3001/api/docente', {
                codigo: rowData.Codigo,
                estado: _estado
            })
            .then((response) => {
                console.log(response.data);
                fetchData();
                setDeleteDocenteDialog(false);
                setDocente(emptyDocente);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: rowData.Estado ? 'Docente deshabilitado' : 'Docente habilitado', life: 3000 });
            });
    };

    const modificarRuta = async (codigo: string, ruta: string) => {
        console.log('Docente Recibido:', codigo);
        try {
            axios
                .put('http://localhost:3001/api/docente/actualizar-foto', {
                    codigoPersona: codigo,
                    rutaFoto: ruta
                })
                .then((response) => {
                    console.log('Ruta Actualizada', response);
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Docente actualizado con éxito', life: 3000 });
                    fetchData();
                });
            setDocente(emptyDocente);
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

    const subirArchivo = async (codigo: string) => {
        console.log('Docente recibido para ruta', docente)
        try {
            console.log('Archivo Recibido:', archivo);
            const file = archivo!.files[0];
            const formData = new FormData();
            formData.append('file', file);
            console.log('Archivo Recibido:', file.name);

            await axios.post('http://localhost:3001/api/files/upload', formData).then((response) => {
                console.log(response.data.path);
                let _docente = { ...docente, rutaFoto: response.data.filename };
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
                modificarRuta(codigo, response.data.filename);
                setArchivo(null);
                setCambioImagen(false);
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

    const exportCSV = () => {
        dt.current!.exportCSV();
    };

    const onCondicionLaboralChange = (e: any) => {
        let _docente = { ...docente };

        _docente['condicionLaboral'] = e.value;

        setDocente(_docente);
    };

    const onSexoChange = (e: any) => {
        let _docente = { ...docente };

        _docente['sexo'] = e.value;
        setDocente(_docente);
    };

    const handleUpload = (event: FileUploadFilesEvent) => {
        setCambioImagen(true);
        setArchivo(event);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof typeof emptyDocente) => {
        const val = (e.target && e.target.value) || '';
        let _docente = { ...docente };

        if (name == 'email') {
            _docente[`${name}`] = val;
            setCambioEmail(true);
        } else {
            _docente[`${name}`] = (val.toUpperCase());
        }

        if (name == 'DNI') {
            setCambioDNI(true);
        }

        setDocente(_docente);
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;
        let _docente = { ...docente };
        _docente['fechaNacimiento'] = selectedDate;
        setDocente(_docente);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo Docente" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
                <Button type="button" icon="pi pi-file-excel" severity="success" rounded data-pr-tooltip="XLS" />
                <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded data-pr-tooltip="PDF" />
            </div>
        );
    };

    const nombreBodyTemplate = (rowData: any) => {
        return rowData.Persona.Nombres + ' ' + rowData.Persona.Paterno + ' ' + rowData.Persona.Materno;
    };
    const condicionLaboralBodyTemplate = (rowData: any) => {
        return rowData.CondicionLaboral;
    };

    const emailBodyTemplate = (rowData: any) => {
        return rowData.Persona.Email;
    };

    const DNIBodyTemplate = (rowData: any) => {
        return rowData.Persona.DNI;
    };

    const estadoBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" severity="warning" onClick={() => editDocente(rowData)} />
                <Button icon="pi pi-power-off" rounded outlined severity={rowData.Estado ? 'danger' : 'info'} onClick={() => confirmDeleteDocente(rowData)} />
            </React.Fragment>
        );
    };

    const obtenerArchivo = async (ruta: string) => {
        if (ruta === '') {
            return
        }
        try {
            const response = await axios.get('http://localhost:3001/api/files/download', {
                params: { fileName: ruta },
                responseType: 'arraybuffer',  // Especificar el tipo de respuesta como 'arraybuffer'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            setImagenURL(url);
        } catch (error) {
            console.error('Error al obtener el archivo:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error de carga de archivo',
                life: 3000,
            });
        }
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Lista de Docentes</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter}
                    onInput={(e) => {
                        if (e.target) {
                            setGlobalFilter((e.target as HTMLInputElement).value);
                        }
                    }}
                    placeholder="Buscar..."
                />
            </span>
        </div>
    );
    const docenteDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveDocente} />
        </React.Fragment>
    );
    const deleteDocenteDialogFooter = (docente: any) => {
        return (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDocenteDialog} />
                <Button label="Si" icon="pi pi-check" severity="danger" onClick={() => deleteDocente(docente)} />
            </React.Fragment>
        );
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable
                    ref={dt}
                    value={docentes}
                    dataKey="Codigo"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column field="NombreCompleto" header="Nombre Completo" body={nombreBodyTemplate} sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="Persona.DNI" header="DNI" body={DNIBodyTemplate} style={{ minWidth: '6rem' }}></Column>
                    <Column header="Condición Laboral" body={condicionLaboralBodyTemplate} sortable style={{ minWidth: '6rem' }}></Column>
                    <Column field="Persona.Email" header="Correo" body={emailBodyTemplate} style={{ minWidth: '16rem' }}></Column>
                    <Column header="Estado" dataType="boolean" sortable style={{ minWidth: '4rem' }} body={estadoBodyTemplate} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={docenteDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos del Docente" modal className="p-fluid" footer={docenteDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="imagen" className="font-bold">
                        Foto
                    </label>
                    {/* Modifica el evento onUpload para utilizar la nueva función handleFileUpload */}
                    <br />
                    {/* Renderizar la imagen si hay una URL */}
                    {imagenURL && (
                        <div className="field">
                            <Image src={imagenURL} zoomSrc={imagenURL} alt="Foto Docente" width="80" height="80" preview />
                        </div>
                    )}
                    <FileUpload
                        name="foto"
                        // url={'/uploads/'+docente.rutaFoto}
                        accept="image/*"
                        chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }}
                        chooseLabel="Cargar imagen"
                        mode="basic"
                        maxFileSize={5000000}
                        auto
                        customUpload={true}
                        uploadHandler={(e) => handleUpload(e)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="nombres" className="font-bold">
                        Nombres
                    </label>
                    <InputText id="nombres" value={docente.nombres} onChange={(e) => onInputChange(e, 'nombres')} required autoFocus maxLength={40} className={classNames({ 'p-invalid': submitted && !docente.nombres })} />
                    {submitted && !docente.nombres && <small className="p-error">Ingrese el nombre.</small>}
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="paterno" className="font-bold">
                            Apellido Paterno
                        </label>
                        <InputText id="paterno" value={docente.paterno} onChange={(e) => onInputChange(e, 'paterno')} required maxLength={20} className={classNames({ 'p-invalid': submitted && !docente.paterno })} />
                        {submitted && !docente.paterno && <small className="p-error">Ingrese el Apellido Paterno.</small>}
                    </div>
                    <div className="field col">
                        <label htmlFor="materno" className="font-bold">
                            Apellido Materno
                        </label>
                        <InputText id="materno" value={docente.materno} onChange={(e) => onInputChange(e, 'materno')} required maxLength={20} className={classNames({ 'p-invalid': submitted && !docente.materno })} />
                        {submitted && !docente.materno && <small className="p-error">Ingrese el Apellido Materno.</small>}
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="fechaNacimiento" className="font-bold">
                            Fecha de Nacimiento
                        </label>
                        <Calendar id="fechaNacimiento" value={docente.fechaNacimiento} onChange={(e) => onCalendarChange(e)} showIcon required className={classNames({ 'p-invalid': submitted && !docente.fechaNacimiento })} />
                        {submitted && !docente.fechaNacimiento && <small className="p-error">Ingrese la Fecha de Nacimiento.</small>}
                    </div>

                    <div className="field col">
                        <label className="mb-3 font-bold">Sexo</label>
                        <div className="formgrid grid">
                            <div className="field-radiobutton col-6">
                                <RadioButton inputId="sexo1" name="sexo" value="M" onChange={onSexoChange} checked={docente.sexo === 'M'} />
                                <label htmlFor="sexo1">Masculino</label>
                            </div>
                            <div className="field-radiobutton col-6">
                                <RadioButton inputId="sexo2" name="sexo" value="F" onChange={onSexoChange} checked={docente.sexo === 'F'} />
                                <label htmlFor="sexo2">Femenino</label>
                            </div>
                        </div>
                        {submitted && !docente.sexo && <small className="p-error">Seleccione el sexo.</small>}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="email" className="font-bold">
                        Correo
                    </label>
                    <InputText id="email" value={docente.email} onChange={(e) => onInputChange(e, 'email')} required maxLength={45} className={classNames({ 'p-invalid': submitted && !docente.email })} />
                    {submitted && !docente.email && <small className="p-error">Ingrese el Correo.</small>}
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="DNI" className="font-bold">
                            DNI
                        </label>
                        <InputText id="DNI" value={docente.DNI} onChange={(e) => onInputChange(e, 'DNI')} required maxLength={8} className={classNames({ 'p-invalid': submitted && !docente.DNI })} />
                        {submitted && !docente.DNI && <small className="p-error">Ingrese el DNI.</small>}
                    </div>
                    <div className="field col">
                        <label className="mb-3 font-bold">Condicion Laboral</label>
                        <div className="formgrid grid">
                            <div className="field-radiobutton col-6">
                                <RadioButton inputId="condicionLaboral1" name="condicionLaboral" value="Nombrado" onChange={onCondicionLaboralChange} checked={docente.condicionLaboral === 'Nombrado'} />
                                <label htmlFor="condicionLaboral1">Nombrado</label>
                            </div>
                            <div className="field-radiobutton col-6">
                                <RadioButton inputId="condicionLaboral2" name="condicionLaboral" value="Contratado" onChange={onCondicionLaboralChange} checked={docente.condicionLaboral === 'Contratado'} />
                                <label htmlFor="condicionLaboral2">Contratado</label>
                            </div>
                        </div>
                        {submitted && !docente.condicionLaboral && <small className="p-error">Seleccione la condición laboral.</small>}
                    </div>
                </div>
            </Dialog>

            <Dialog visible={deleteDocenteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteDocenteDialogFooter(docente)} onHide={hideDeleteDocenteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {docente && <span>¿Esta seguro de que desea {docente.estado ? 'desabilitar' : 'habilitar'} al Docente?</span>}
                </div>
            </Dialog>

            <Dialog
                visible={advertencia.activo}
                onHide={HideAdvertencia}
                header="Advertencia"
                modal
                footer={
                    <div>
                        <Button label="Aceptar" icon="pi pi-check" onClick={HideAdvertencia} />
                    </div>
                }
            >
                <div>
                    <p>{advertencia.mensaje}</p>
                </div>
            </Dialog>
        </div>
    );
}
