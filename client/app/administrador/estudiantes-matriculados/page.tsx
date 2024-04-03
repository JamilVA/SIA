'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Sia } from '../../../types/sia';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { AxiosError } from 'axios'
import { Dropdown } from 'primereact/dropdown';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Page() {

    let emptyEstudiante: Sia.Student = {
        Codigo: '',
        Paterno: '',
        Materno: '',
        Nombres: '',
        Estado: true,
        RutaFoto: '',
        FechaNacimiento: '',
        Sexo: '',
        DNI: '',
        Email: '',
        CodigoSunedu: '',
        CreditosLlevados: 0,
        CreditosAprobados: 0,
        CodigoCarreraProfesional: 0,
        CodigoPersona: 0,
        Direccion: null,
        EmailPersonal: null,
        Celular: null,
    };

    const [estudiantes, setestudiantes] = useState(null);
    const [estudianteDialog, setEstudianteDialog] = useState(false);
    const [estudianteInfoDialog, setEstudianteInfoDialog] = useState(false);
    const [estudiante, setEstudiante] = useState<Sia.Student>(emptyEstudiante);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [state, setState] = useState('');
    const [archivo, setArchivo] = useState<FileUploadFilesEvent | null>(null);
    const [carreras, setCarreras] = useState<Sia.CarreraProfesional[]>([]);
    const [exportDialog, setExportDialog] = useState(false);
    const [carrera, setCarrera] = useState();
    const [errors, setErrors] = useState('');
    const { data: session, status } = useSession();

    //const [actividades, setActividades] = useState<Array<any>>([]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const result = await axios("/estudiante", {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            setestudiantes(result.data.estudiantes);
            setCarreras(result.data.carreras);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    }


    const setTempEstudent = (estudiante: Sia.Student) => {
        let tempEstudiante: Sia.Student = {
            Codigo: estudiante.Codigo,
            Paterno: estudiante.Persona.Paterno,
            Materno: estudiante.Persona.Materno,
            Nombres: estudiante.Persona.Nombres,
            Estado: estudiante.Estado,
            RutaFoto: estudiante.Persona.RutaFoto,
            FechaNacimiento: new Date(estudiante.Persona.FechaNacimiento),
            Sexo: estudiante.Persona.Sexo,
            DNI: estudiante.Persona.DNI,
            Email: estudiante.Persona.Usuario.Email,
            CodigoSunedu: estudiante.CodigoSunedu,
            CreditosLlevados: estudiante.CreditosLlevados,
            CreditosAprobados: estudiante.CreditosAprobados,
            CodigoCarreraProfesional: estudiante.CodigoCarreraProfesional,
            CodigoPersona: estudiante.CodigoPersona,
            Direccion: estudiante.Persona.Direccion,
            EmailPersonal: estudiante.Persona.EmailPersonal,
            Celular: estudiante.Persona.Celular,
        }
        return tempEstudiante
    }

    const infoEstudiante = (estudiante: Sia.Student) => {
        let tempEstudiante = setTempEstudent(estudiante);
        setEstudiante(tempEstudiante);
        setEstudianteInfoDialog(true);
    }

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _estudiante = { ...estudiante };
        _estudiante[`${name}`] = (val.toUpperCase());

        setEstudiante(_estudiante);
    };

    const onDropdownChange = (e: any, name: keyof typeof emptyEstudiante) => {
        const val = (e.target && e.target.value) || '';
        let _estudiante = { ...estudiante };
        _estudiante[`${name}`] = val;
        setEstudiante(_estudiante);
    };

    const onCarreraSelect = (e: any) => {
        const val = (e.target && e.target.value) || '';
        let carrera = val;
        setCarrera(carrera);
        // console.log('Carrera', carrera);
    };

    const hideExportDialog = () => {
        setExportDialog(false);
        setCarrera(undefined);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={()=>{}} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={() => setExportDialog(true)} />
            </React.Fragment>
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

    const exportDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideExportDialog} />
            {/* <Button label="Descargar" icon="pi pi-download" onClick={exportCSV} /> */}
            <Link href={`${axios.defaults.baseURL}/estudiante/obtenerListaEstudiantes?c=${carrera}`}>
                <Button label="Descargar" icon="pi pi-download" onClick={hideExportDialog} />
            </Link>
        </>
    );

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

    if (session?.user.nivelUsuario != 1) {
        redirect('/pages/notfound')
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
                        currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} estudiantes"
                        globalFilter={globalFilter}
                        emptyMessage="Sin estudiantes registrados"
                        header={header}
                    >
                        <Column field="CodigoSunedu" header="COD" sortable />
                        <Column field="CarreraProfesional.NombreCarrera" header="Carrera" sortable />
                        <Column field="Persona.DNI" header="DNI" sortable />
                        <Column field="Persona.Paterno" header="Paterno" sortable />
                        <Column field="Persona.Materno" header="Materno" sortable />
                        <Column field="Persona.Nombres" header="Nombres" sortable />
                        <Column field="AnioIngreso" header="Ingreso" sortable />
                    </DataTable>

                    
                    <Dialog visible={estudianteInfoDialog} style={{ width: '400px' }} header="Otros datos del estudiante" modal className="p-fluid" onHide={()=>{setEstudianteInfoDialog(false)}}>
                        <p><strong>Código:</strong> {estudiante.CodigoSunedu}</p>
                        <p><strong>Nombre:</strong> {estudiante.Nombres + ' ' + estudiante.Paterno + ' ' + estudiante.Materno}</p>
                        <p><strong>Email:</strong> {estudiante.Email}</p>
                        <p><strong>Dirección:</strong> {estudiante.Direccion}</p>
                        <p><strong>Email personal:</strong> {estudiante.EmailPersonal}</p>
                        <p><strong>Celular:</strong> {estudiante.Celular}</p>
                    </Dialog>


                    <Dialog visible={exportDialog} style={{ width: '350px' }} header="Exportar lista de cursos" modal className="p-fluid" footer={exportDialogFooter} onHide={hideExportDialog}>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="Carrera">Carrera</label>
                                <Dropdown
                                    id="carrera"
                                    value={carrera}
                                    onChange={(e) => {
                                        onCarreraSelect(e);
                                    }}
                                    name="CodigoCarreraProfesional"
                                    options={carreras}
                                    optionLabel="NombreCarrera"
                                    optionValue="Codigo"
                                    placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': !carrera })}
                                ></Dropdown>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};