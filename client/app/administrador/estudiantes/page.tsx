'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Demo } from '../../../types/types';
import axios from 'axios'
import { Dropdown } from 'primereact/dropdown';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';

export default function Page ()  {

    let emptyEstudiante: Demo.Student = {
        Codigo: '',
        Paterno: '',
        Materno: '',
        Nombres: '',
        Estado: true,
        RutaFoto: '/ruta',
        FechaNacimiento: '',
        Sexo: '',
        DNI: '',
        Email: '',
        CodigoSunedu: '',
        CreditosLlevados: 0,
        CreditosAprobados: 0,
        CodigoCarreraProfesional: 0,
        CodigoPersona: 0
    };

    const [estudiantes, setestudiantes] = useState(null);
    const [estudianteDialog, setEstudianteDialog] = useState(false);
    const [deleteEstudianteDialog, setDeleteEstudianteDialog] = useState(false);
    const [estudiante, setEstudiante] = useState<Demo.Student>(emptyEstudiante);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [state, setState] = useState('');
    const [selectedCarrera, setSelectedCarrera] = useState<number | undefined>();

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const result = await axios("http://localhost:3001/api/estudiante");
            setestudiantes(result.data.estudiantes);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    }

    const openNew = () => {
        setEstudiante(emptyEstudiante);
        setSelectedCarrera(undefined);
        setSubmitted(false);
        setEstudianteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEstudianteDialog(false);
    };

    const hideDeleteEstudianteDialog = () => {
        setDeleteEstudianteDialog(false);
    };

    const onSubmitChange = async (e: React.MouseEvent<HTMLButtonElement>, data: object) => {
        e.preventDefault();
        var response = '';
        try {
            const result = await axios.post("http://127.0.0.1:3001/api/estudiante", data);
            response = result.data.Estado;
            fetchData();

            if (response == "Error") {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al guardar',
                    life: 3000
                });
            } else {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Registro creado',
                    life: 3000
                });
            }
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al guardar',
                life: 3000
            });
        }
    }

    const onUpdate = async (e: React.MouseEvent<HTMLButtonElement>, data: object) => {
        e.preventDefault();
        var response = '';
        try {
            const result = await axios.put("http://127.0.0.1:3001/api/estudiante", data);
            response = result.data.Estado;
            fetchData();

            if (response == "Error") {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar',
                    life: 3000
                });
            } else {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Registro actualizado',
                    life: 3000
                });
            }
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar',
                life: 3000
            });
        }
    }

    const crearSunedu = (n: number | undefined) => {
        if (n == 1) {
            return 'AV';
        } else if (n == 2) {
            return 'MU'
        } else if (n == 3) {
            return 'PI';
        } else {
            return 'ES';
        }
    }

    function isNumeric(val: string) {
        return /^-?\d+$/.test(val);
    }

    const verifyInputs = () => {
        if (estudiante.Paterno.trim() && estudiante.DNI.trim() && isNumeric(estudiante.DNI) && estudiante.DNI.length == 8 && estudiante.Nombres.trim() && estudiante.FechaNacimiento != ''
            && selectedCarrera != undefined && estudiante.Email!.trim() && estudiante.Sexo.trim()) {
            return true
        } else {
            return false
        }
    }

    const saveEstudiante = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSubmitted(true);
        if (verifyInputs()) {
            let _estudiante = { ...estudiante };
            if (estudiante.Codigo != '') {
                _estudiante.CodigoCarreraProfesional = selectedCarrera;
                _estudiante.CodigoSunedu = crearSunedu(selectedCarrera) + _estudiante.DNI;
                onUpdate(e, _estudiante)
            } else {
                _estudiante.CodigoCarreraProfesional = selectedCarrera;
                _estudiante.CodigoSunedu = crearSunedu(selectedCarrera) + _estudiante.DNI;
                onSubmitChange(e, _estudiante)
            }
            setEstudianteDialog(false);
            setEstudiante(emptyEstudiante);
        }
    };

    const editEstudiante = (estudiante: Demo.Student) => {
        let tempEstudiante: Demo.Student = {
            Codigo: estudiante.Codigo,
            Paterno: estudiante.Persona.Paterno,
            Materno: estudiante.Persona.Materno,
            Nombres: estudiante.Persona.Nombres,
            Estado: estudiante.Estado,
            RutaFoto: estudiante.RutaFoto,
            FechaNacimiento: new Date(estudiante.Persona.FechaNacimiento),
            Sexo: estudiante.Persona.Sexo,
            DNI: estudiante.Persona.DNI,
            Email: estudiante.Persona.Email,
            CodigoSunedu: estudiante.Persona.CodigoSunedu,
            CreditosLlevados: estudiante.CreditosLlevados,
            CreditosAprobados: estudiante.CreditosAprobados,
            CodigoCarreraProfesional: estudiante.CodigoCarreraProfesional,
            CodigoPersona: estudiante.CodigoPersona,
        }

        setEstudiante(tempEstudiante);
        setSelectedCarrera(tempEstudiante.CodigoCarreraProfesional);
        setEstudianteDialog(true);
    };

    const confirmDeleteEstudiante = (estudiante: Demo.Student) => {
        setEstudiante(estudiante);
        if (estudiante.Estado == false) {
            setState('habilitar')
        } else {
            setState('deshabilitar')
        }
        setDeleteEstudianteDialog(true);
    };

    const deleteEstudiante = (e: React.MouseEvent<HTMLButtonElement>) => {
        setEstudiante({ ...estudiante });
        let state: boolean;
        if (estudiante.Estado == false) {
            state = true;
        } else {
            state = false;
        }
        setSubmitted(true);
        let _estudiante = { ...estudiante };
        _estudiante.Estado = state;
        onUpdate(e, _estudiante)
        setDeleteEstudianteDialog(false);
        setEstudiante(emptyEstudiante);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _estudiante = { ...estudiante };
        _estudiante[`${name}`] = (val.toUpperCase());

        setEstudiante(_estudiante);
    };

    const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        let _estudiante = { ...estudiante };
        _estudiante['Email'] = (val);

        setEstudiante(_estudiante);
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;
        let _estudiante = { ...estudiante };
        _estudiante['FechaNacimiento'] = selectedDate;
        setEstudiante(_estudiante);
    };

    const onSexoChange = (e: any) => {
        let _estudiante = { ...estudiante };
        _estudiante['Sexo'] = e.value;
        setEstudiante(_estudiante);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (rowData: Demo.Student) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: Demo.Student) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="warning" className="mr-2" onClick={() => editEstudiante(rowData)} />
                <Button icon="pi pi-power-off" rounded severity="danger" onClick={() => confirmDeleteEstudiante(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">GESTIÓN DE ESTUDIANTES</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const estudianteDialogFooter = (
        <>
            <Button label="Cancelar" outlined icon="pi pi-times" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveEstudiante} />
        </>
    );
    const deleteEstudianteDialogFooter = (
        <>
            <Button label="No" outlined icon="pi pi-times" onClick={hideDeleteEstudianteDialog} />
            <Button label="Si" icon="pi pi-check" onClick={deleteEstudiante} />
        </>
    );

    const carreras = [
        { name: 'Artes visuales', value: 1 },
        { name: 'Música', value: 2 },
        { name: 'Pintura', value: 3 },
        { name: 'Escultura', value: 4 },
    ]

    const onSelectCarrera = (e: number) => {
        setSelectedCarrera(e);
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={estudiantes}
                        dataKey="Codigo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                        globalFilter={globalFilter}
                        emptyMessage="No students found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="CodigoSunedu" header="COD" sortable />
                        <Column field="CarreraProfesional.NombreCarrera" header="Carrera" sortable />
                        <Column field="Persona.DNI" header="DNI" sortable />
                        <Column field="Persona.Paterno" header="Paterno" sortable />
                        <Column field="Persona.Materno" header="Materno" sortable />
                        <Column field="Persona.Nombres" header="Nombres" sortable />
                        <Column field="AnioIngreso" header="Ingreso" sortable />
                        <Column field="Estado" body={statusBodyTemplate} header="Estado" sortable />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={estudianteDialog} style={{ width: '650px' }} header="Detalles de estudiante" modal className="p-fluid" footer={estudianteDialogFooter} onHide={hideDialog}>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="DNI">DNI</label>
                                <InputText autoFocus id="DNI" maxLength={8} value={estudiante.DNI} onChange={(e) => onInputChange(e, 'DNI')} required
                                    className={classNames({ 'p-invalid': submitted && !estudiante.DNI })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="paterno">Paterno</label>
                                <InputText id="paterno" value={estudiante.Paterno} onChange={(e) => onInputChange(e, 'Paterno')} required
                                    className={classNames({ 'p-invalid': submitted && !estudiante.Paterno })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="materno">Materno</label>
                                <InputText id="materno" value={estudiante.Materno} onChange={(e) => onInputChange(e, 'Materno')} required
                                    className={classNames({ 'p-invalid': submitted && !estudiante.Materno })} />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="nombres">Nombres</label>
                                <InputText id="nombres" value={estudiante.Nombres} onChange={(e) => onInputChange(e, 'Nombres')} required
                                    className={classNames({ 'p-invalid': submitted && !estudiante.Nombres })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="carrera">Carrera</label>
                                <Dropdown id="carrera" value={selectedCarrera} onChange={(e) => onSelectCarrera(e.value)} options={carreras} optionLabel="name" placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': submitted && !selectedCarrera })}></Dropdown>
                            </div>
                            <div className='field col'>
                                <label htmlFor="FechaNacimiento">Fecha Nacimiento</label>
                                <Calendar value={estudiante.FechaNacimiento} onChange={(e) => onCalendarChange(e)} dateFormat="dd/mm/yy" placeholder="mm/dd/yyyy" mask="99/99/9999"
                                    className={classNames({ 'p-invalid': submitted && !estudiante.FechaNacimiento })} />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label className="mb-3 font-bold">Sexo</label>
                                <div className="formgrid grid">
                                    <div className="field-radiobutton col-6">
                                        <RadioButton inputId="Sexo1" name="Sexo" value="M" onChange={onSexoChange} checked={estudiante.Sexo === 'M'} />
                                        <label htmlFor="Sexo1">Masculino</label>
                                    </div>
                                    <div className="field-radiobutton col-6">
                                        <RadioButton inputId="Sexo2" name="Sexo" value="F" onChange={onSexoChange} checked={estudiante.Sexo === 'F'} />
                                        <label htmlFor="Sexo2">Femenino</label>
                                    </div>
                                </div>
                                {submitted && !estudiante.Sexo && <small className="p-error">Seleccione el sexo.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="email">Email</label>
                                <InputText id="email" value={estudiante.Email} onChange={(e) => onEmailChange(e)} required
                                    className={classNames({ 'p-invalid': submitted && !estudiante.Email })} />
                            </div>
                        </div>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="foto">Foto</label>
                                <FileUpload mode='basic' name="demo[]" url="/api/upload" multiple accept="image/*" maxFileSize={1000000} />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteEstudianteDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteEstudianteDialogFooter} onHide={hideDeleteEstudianteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {estudiante && (
                                <span>
                                    Estás seguro de <span>{state}</span> al estudiante?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};