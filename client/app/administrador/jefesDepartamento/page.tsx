'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Calendar } from 'primereact/calendar';
import { CalendarChangeEvent } from 'primereact/calendar';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';

export default function JefeDepartamentosDemo() {
    let emptyJefeDepartamento: {
        Codigo: null | string;
        Estado: boolean | string;
        Departamento: string;
        FechaAlta: string | Date;
        FechaBaja: string | Date;
        Paterno: string;
        Materno: string;
        Nombres: string;
        RutaFoto: string;
        CodigoPersona: null | string;
        FechaNacimiento: string | Date;
        Sexo: string;
        DNI: string;
        Email: string;
    } = {
        Codigo: null,
        CodigoPersona: null,
        Estado: true,
        Departamento: '',
        FechaAlta: '',
        FechaBaja: '',
        Paterno: '',
        Materno: '',
        Nombres: '',
        RutaFoto: '',
        FechaNacimiento: '',
        Sexo: '',
        DNI: '',
        Email: ''
    };

    const departamentos = [{ Denominacion: 'Artistas Profesionales' }, { Denominacion: 'Profesionales Pedagógicos' }];

    const [jefeDepartamentoDialog, setJefeDepartamentoDialog] = useState(false);
    const [deleteJefeDepartamentoDialog, setDeleteJefeDepartamentoDialog] = useState(false);
    const [advertencia, setAdvertencia] = useState({ activo: false, mensaje: '' });
    const [jefeDepartamento, setJefeDepartamento] = useState(emptyJefeDepartamento);
    const [jefeDepartamentos, setJefeDepartamentos] = useState<(typeof jefeDepartamento)[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await axios('http://localhost:3001/api/jefeDepartamento');

            const jefeDepartamentosConNombreCompleto = result.data.jefesDepartamento.map((jefeDepartamento: any) => ({
                ...jefeDepartamento,
                NombreCompleto: `${jefeDepartamento.Persona.Nombres} ${jefeDepartamento.Persona.Paterno} ${jefeDepartamento.Persona.Materno}`
            }));

            // Establecer los jefeDepartamentos en el Estado
            setJefeDepartamentos(jefeDepartamentosConNombreCompleto);
            console.log(jefeDepartamentosConNombreCompleto);
        } catch (e) {
            console.log(e);
        }
    };

    const openNew = () => {
        setJefeDepartamento(emptyJefeDepartamento);
        setSubmitted(false);
        setJefeDepartamentoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setJefeDepartamentoDialog(false);
    };

    const hideDeleteJefeDepartamentoDialog = () => {
        setDeleteJefeDepartamentoDialog(false);
    };

    const saveJefeDepartamento = () => {
        setSubmitted(true);

        if (
            jefeDepartamento.Nombres.trim() &&
            jefeDepartamento.Paterno.trim() &&
            jefeDepartamento.Materno.trim() &&
            jefeDepartamento.FechaNacimiento &&
            jefeDepartamento.Sexo &&
            jefeDepartamento.DNI.trim() &&
            jefeDepartamento.Email.trim() &&
            validarDNI(jefeDepartamento.DNI.trim()) &&
            validarEmail(jefeDepartamento.Email.trim())
        ) {
            let _jefeDepartamento = { ...jefeDepartamento };

            if (jefeDepartamento.Codigo) {
                axios
                    .put('http://localhost:3001/api/jefeDepartamento', {
                        codigo: _jefeDepartamento.Codigo,
                        departamento: _jefeDepartamento.Departamento,
                        paterno: _jefeDepartamento.Paterno,
                        materno: _jefeDepartamento.Materno,
                        nombres: _jefeDepartamento.Nombres,
                        email: _jefeDepartamento.Email,
                        sexo: _jefeDepartamento.Sexo,
                        fechaNacimiento: _jefeDepartamento.FechaNacimiento,
                        DNI: _jefeDepartamento.DNI,
                        rutaFoto: _jefeDepartamento.RutaFoto,
                        codigoPersona: _jefeDepartamento.CodigoPersona
                    })
                    .then((response) => {
                        console.log(response);
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Jefe de Departamento actualizado con éxito', life: 3000 });
                        fetchData();
                    });
                fetchData();
            } else {
                axios
                    .post('http://localhost:3001/api/jefeDepartamento', {
                        departamento: _jefeDepartamento.Departamento,
                        fechaAlta: new Date(),
                        paterno: _jefeDepartamento.Paterno,
                        materno: _jefeDepartamento.Materno,
                        nombres: _jefeDepartamento.Nombres,
                        email: _jefeDepartamento.Email,
                        sexo: _jefeDepartamento.Sexo,
                        fechaNacimiento: _jefeDepartamento.FechaNacimiento,
                        DNI: _jefeDepartamento.DNI,
                        rutaFoto: _jefeDepartamento.RutaFoto
                    })
                    .then((response) => {
                        console.log(response.data);
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Jefe de Departamento creado con éxito', life: 3000 });
                        fetchData();
                    });
            }
            setJefeDepartamentoDialog(false);
            setJefeDepartamento(emptyJefeDepartamento);
        }
    };

    const validarEmail = (Email: string) => {
        const emailExists = jefeDepartamentos.some((doc: any) => {
            return doc.Persona.Email === Email;
        });

        console.log('Email:', emailExists);

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

        const dniExists = jefeDepartamentos.some((doc: any) => {
            return doc.Persona.DNI === DNI;
        });

        console.log('dniExists:', dniExists);

        if (dniExists) {
            setAdvertencia({ activo: true, mensaje: 'Este DNI ya está registrado. Por favor, ingresa otro.' });
            console.log('El DNI ya existe');
            return false;
        }

        // Si el DNI es válido, oculta la advertencia y devuelve true
        setAdvertencia({ activo: false, mensaje: '' });
        return true;
    };

    const HideAdvertencia = () => {
        setAdvertencia({ activo: false, mensaje: '' });
    };

    const editJefeDepartamento = (jefeDepartamento: any) => {
        let tempJefeDepartamento = {
            Codigo: jefeDepartamento.Codigo,
            Departamento: jefeDepartamento.Departamento,
            FechaAlta: jefeDepartamento.FechaAlta,
            FechaBaja: jefeDepartamento.FechaBaja,
            Estado: jefeDepartamento.Estado,
            Paterno: jefeDepartamento.Persona.Paterno,
            Materno: jefeDepartamento.Persona.Materno,
            Nombres: jefeDepartamento.Persona.Nombres,
            RutaFoto: jefeDepartamento.Persona.RutaFoto,
            CodigoPersona: jefeDepartamento.CodigoPersona,
            FechaNacimiento: new Date(jefeDepartamento.Persona.FechaNacimiento),
            Sexo: jefeDepartamento.Persona.Sexo,
            DNI: jefeDepartamento.Persona.DNI,
            Email: jefeDepartamento.Persona.Email
        };

        setJefeDepartamento(tempJefeDepartamento);
        console.log(jefeDepartamento);
        setJefeDepartamentoDialog(true);
    };

    const confirmDeleteJefeDepartamento = (jefeDepartamento: any) => {
        setJefeDepartamento(jefeDepartamento);
        setDeleteJefeDepartamentoDialog(true);
    };

    const deleteJefeDepartamento = (rowData: any) => {
        console.log(rowData.Codigo);

        axios
            .put('http://localhost:3001/api/jefeDepartamento', {
                codigo: rowData.Codigo,
                estado: false,
                fechaBaja: new Date()
            })
            .then((response) => {
                console.log(response.data);
                fetchData();
                setDeleteJefeDepartamentoDialog(false);
                setJefeDepartamento(emptyJefeDepartamento);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Jefe de Departamento Eliminado', life: 3000 });
            });
    };

    const exportCSV = () => {
        dt.current!.exportCSV();
    };

    const onSexoChange = (e: any) => {
        let _jefeDepartamento = { ...jefeDepartamento };

        _jefeDepartamento['Sexo'] = e.value;
        setJefeDepartamento(_jefeDepartamento);
        console.log(jefeDepartamento);
    };

    const onFileSelect = (e: any) => {
        // Aquí se puede manejar el archivo seleccionado
        console.log(e.files);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof typeof emptyJefeDepartamento) => {
        const val = (e.target && e.target.value) || '';
        let _jefeDepartamento = { ...jefeDepartamento };

        _jefeDepartamento[`${name}`] = val;

        setJefeDepartamento(_jefeDepartamento);
        console.log(jefeDepartamento);
    };

    const onDropdownChange = (e: any, name: keyof typeof emptyJefeDepartamento) => {
        const val = (e.target && e.target.value) || '';
        let _jefeDepartamento = { ...jefeDepartamento };

        _jefeDepartamento[`${name}`] = val;

        setJefeDepartamento(_jefeDepartamento);
        console.log(jefeDepartamento);
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;
        let _jefeDepartamento = { ...jefeDepartamento };
        _jefeDepartamento['FechaNacimiento'] = selectedDate;
        setJefeDepartamento(_jefeDepartamento);
        console.log(jefeDepartamento);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo Jefe de Departamento" icon="pi pi-plus" severity="success" onClick={openNew} />
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

    const departamentoBodyTemplate = (rowData: any) => {
        return rowData.Departamento;
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
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editJefeDepartamento(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteJefeDepartamento(rowData)} />
                {/* <InputSwitch checked={rowData.Estado} onChange={(e) => confirmDeleteJefeDepartamento(rowData)} /> */}
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Lista de Jefes de Departamento</h4>
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
    const jefeDepartamentoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveJefeDepartamento} />
        </React.Fragment>
    );
    const deleteJefeDepartamentoDialogFooter = (jefeDepartamento: any) => {
        return (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteJefeDepartamentoDialog} />
                <Button label="Si" icon="pi pi-check" severity="danger" onClick={() => deleteJefeDepartamento(jefeDepartamento)} />
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
                    value={jefeDepartamentos}
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
                    <Column field="Departamento" header="Departamento" body={departamentoBodyTemplate} sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="Persona.DNI" header="DNI" body={DNIBodyTemplate} style={{ minWidth: '6rem' }}></Column>
                    <Column field="Persona.Email" header="Correo" body={emailBodyTemplate} style={{ minWidth: '16rem' }}></Column>
                    <Column header="Estado" dataType="boolean" sortable style={{ minWidth: '4rem' }} body={estadoBodyTemplate} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog
                visible={jefeDepartamentoDialog}
                style={{ width: '40rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Datos del Jefe de Departamento"
                modal
                className="p-fluid"
                footer={jefeDepartamentoDialogFooter}
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="imagen" className="font-bold">
                        Foto
                    </label>
                    <FileUpload name="foto" url="/api/upload" accept="image/*" chooseLabel="Cargar Imagen" uploadLabel="Confirmar" cancelLabel="Cancelar" className="p-mb-3" maxFileSize={5 * 1024 * 1024} customUpload uploadHandler={onFileSelect} />
                </div>

                <div className="field">
                    <label htmlFor="Nombres" className="font-bold">
                        Nombres
                    </label>
                    <InputText id="Nombres" value={jefeDepartamento.Nombres} onChange={(e) => onInputChange(e, 'Nombres')} required autoFocus maxLength={40} className={classNames({ 'p-invalid': submitted && !jefeDepartamento.Nombres })} />
                    {submitted && !jefeDepartamento.Nombres && <small className="p-error">Ingrese el nombre.</small>}
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="Paterno" className="font-bold">
                            Apellido Paterno
                        </label>
                        <InputText id="Paterno" value={jefeDepartamento.Paterno} onChange={(e) => onInputChange(e, 'Paterno')} required maxLength={20} className={classNames({ 'p-invalid': submitted && !jefeDepartamento.Paterno })} />
                        {submitted && !jefeDepartamento.Paterno && <small className="p-error">Ingrese el Apellido Paterno.</small>}
                    </div>
                    <div className="field col">
                        <label htmlFor="Materno" className="font-bold">
                            Apellido Materno
                        </label>
                        <InputText id="Materno" value={jefeDepartamento.Materno} onChange={(e) => onInputChange(e, 'Materno')} required maxLength={20} className={classNames({ 'p-invalid': submitted && !jefeDepartamento.Materno })} />
                        {submitted && !jefeDepartamento.Materno && <small className="p-error">Ingrese el Apellido Materno.</small>}
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="FechaNacimiento" className="font-bold">
                            Fecha de Nacimiento
                        </label>
                        <Calendar id="FechaNacimiento" value={jefeDepartamento.FechaNacimiento} onChange={(e) => onCalendarChange(e)} required className={classNames({ 'p-invalid': submitted && !jefeDepartamento.FechaNacimiento })} />
                        {submitted && !jefeDepartamento.FechaNacimiento && <small className="p-error">Ingrese la Fecha de Nacimiento.</small>}
                    </div>

                    <div className="field col">
                        <label className="mb-3 font-bold">Sexo</label>
                        <div className="formgrid grid">
                            <div className="field-radiobutton col-6">
                                <RadioButton inputId="Sexo1" name="Sexo" value="M" onChange={onSexoChange} checked={jefeDepartamento.Sexo === 'M'} />
                                <label htmlFor="Sexo1">Masculino</label>
                            </div>
                            <div className="field-radiobutton col-6">
                                <RadioButton inputId="Sexo2" name="Sexo" value="F" onChange={onSexoChange} checked={jefeDepartamento.Sexo === 'F'} />
                                <label htmlFor="Sexo2">Femenino</label>
                            </div>
                        </div>
                        {submitted && !jefeDepartamento.Sexo && <small className="p-error">Seleccione el sexo.</small>}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="Email" className="font-bold">
                        Correo
                    </label>
                    <InputText id="Email" value={jefeDepartamento.Email} onChange={(e) => onInputChange(e, 'Email')} required maxLength={45} className={classNames({ 'p-invalid': submitted && !jefeDepartamento.Email })} />
                    {submitted && !jefeDepartamento.Email && <small className="p-error">Ingrese el Correo.</small>}
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="DNI" className="font-bold">
                            DNI
                        </label>
                        <InputText id="DNI" value={jefeDepartamento.DNI} onChange={(e) => onInputChange(e, 'DNI')} required maxLength={8} className={classNames({ 'p-invalid': submitted && !jefeDepartamento.DNI })} />
                        {submitted && !jefeDepartamento.DNI && <small className="p-error">Ingrese el DNI.</small>}
                    </div>
                    <div className="field col">
                        <label htmlFor="Departamento" className="font-bold">
                            Departamento
                        </label>
                        <Dropdown
                            value={jefeDepartamento.Departamento}
                            options={departamentos}
                            optionLabel="Denominacion"
                            optionValue="Denominacion"
                            name="Departamento"
                            onChange={(e) => {
                                onDropdownChange(e, 'Departamento');
                            }}
                            placeholder="Seleccione el Departamento"
                            className="p-column-filter"
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={deleteJefeDepartamentoDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteJefeDepartamentoDialogFooter(jefeDepartamento)}
                onHide={hideDeleteJefeDepartamentoDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {jefeDepartamento && <span>¿Esta seguro de que desea eliminar al Jefe de Departamento?</span>}
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
