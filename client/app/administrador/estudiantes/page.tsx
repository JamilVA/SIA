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
import { Demo } from '../../../types/types';
import axios from 'axios'
import { Dropdown } from 'primereact/dropdown';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import Link from 'next/link';

export default function Page() {

    let emptyEstudiante: Demo.Student = {
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
    const [deleteEstudianteDialog, setDeleteEstudianteDialog] = useState(false);
    const [estudiante, setEstudiante] = useState<Demo.Student>(emptyEstudiante);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [state, setState] = useState('');
    const [imagenURL, setImagenURL] = useState<string | null>(null);
    const [archivo, setArchivo] = useState<FileUploadFilesEvent | null>(null);
    const [carreras, setCarreras] = useState<Demo.CarreraProfesional[]>([]);
    const [exportDialog, setExportDialog] = useState(false);
    const [carrera, setCarrera] = useState();

    //const [actividades, setActividades] = useState<Array<any>>([]);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const result = await axios("http://localhost:3001/api/estudiante");
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

    const openNew = () => {
        setEstudiante(emptyEstudiante);
        setSubmitted(false);
        setEstudianteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEstudianteDialog(false);
        setImagenURL(null);
    };

    const hideInfoDialog = () => {
        setEstudianteInfoDialog(false);
    };

    const hideDeleteEstudianteDialog = () => {
        setDeleteEstudianteDialog(false);
    };

    const onSubmitChange = async (e: React.MouseEvent<HTMLButtonElement>, data: object) => {
        e.preventDefault();
        var response = '';
        try {
            const result = await axios.post("http://127.0.0.1:3001/api/estudiante", data);
            console.log(result);
            response = result.data.Estado;
            subirFoto(result.data.estudiante.CodigoPersona);
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
        var _response = '';
        try {
            await axios.put("http://127.0.0.1:3001/api/estudiante", data).then((response) => {
                _response = response.data.Estado;
                subirFoto(response.data.persona.Codigo);
                fetchData();
            });

            if (_response == "Error") {
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

    const subirFoto = async (codigo: number) => {
        if (archivo != null) {
            const file = archivo!.files[0]
            const formData = new FormData()
            formData.append('file', file)
            await axios.post('http://localhost:3001/api/files/upload', formData)
                .then(response => {
                    console.log(response.data.path)
                    estudiante.RutaFoto = response.data.filename;
                    modificarRuta(codigo, response.data.filename);
                    setArchivo(null);
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }

    const modificarRuta = async (codigo: number, ruta: string) => {
        console.log('Docente Recibido:', codigo);
        try {
            axios
                .put('http://localhost:3001/api/docente/actualizar-foto', {
                    codigoPersona: codigo,
                    rutaFoto: ruta
                }).then((response) => {
                    fetchData();
                })
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = (event: FileUploadFilesEvent) => {
        setArchivo(event);
        //console.log(event.files)
    };

    const crearSunedu = (n: number | undefined) => {
        if (n == 1) {
            return 'AV';
        } else if (n == 2) {
            return 'MU'
        } else if (n == 3) {
            return 'AP';
        } else {
            return 'AE';
        }
    }

    function isNumeric(val: string) {
        return /^-?\d+$/.test(val);
    }

    const verifyInputs = () => {
        if (estudiante.Paterno.trim() && estudiante.DNI.trim() && isNumeric(estudiante.DNI) && estudiante.DNI.length == 8 && estudiante.Nombres.trim() && estudiante.FechaNacimiento != ''
            && estudiante.CodigoCarreraProfesional != undefined && estudiante.Email!.trim() && estudiante.Sexo.trim()) {
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
                _estudiante.CodigoSunedu = crearSunedu(_estudiante.CodigoCarreraProfesional) + _estudiante.DNI;
                onUpdate(e, _estudiante)
            } else {
                _estudiante.CodigoSunedu = crearSunedu(_estudiante.CodigoCarreraProfesional) + _estudiante.DNI;
                onSubmitChange(e, _estudiante);
            }
            setEstudianteDialog(false);
            setEstudiante(emptyEstudiante);
        }
    };

    const obtenerArchivo = async (ruta: string) => {
        if (ruta === '') {
            return
        }
        try {
            const response = await axios.get('http://localhost:3001/api/files/download', {
                params: { fileName: ruta },
                responseType: 'arraybuffer',  // Especificar el tipo de respuesta como 'arraybuffer'
            })

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

    const setTempEstudent = (estudiante: Demo.Student) => {
        let tempEstudiante: Demo.Student = {
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

    const editEstudiante = (estudiante: Demo.Student) => {
        let tempEstudiante = setTempEstudent(estudiante);
        setEstudiante(tempEstudiante);
        setEstudianteDialog(true);
        console.log(estudiante);
        obtenerArchivo(estudiante.Persona.RutaFoto);
    };

    const infoEstudiante = (estudiante: Demo.Student) => {
        let tempEstudiante = setTempEstudent(estudiante);
        setEstudiante(tempEstudiante);
        setEstudianteInfoDialog(true);
    }

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
        console.log('Carrera', carrera);
    };

    const hideExportDialog = () => {
        setExportDialog(false);
        setCarrera(undefined);
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
                <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={() => setExportDialog(true)} />
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (rowData: Demo.Student) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: Demo.Student) => {
        return (
            <>
                <Button style={{ width: '2rem', height: '2rem' }} icon="pi pi-pencil" rounded severity="warning" className="mr-2" onClick={() => editEstudiante(rowData)} />
                <Button style={{ width: '2rem', height: '2rem' }} rounded icon="pi pi-eye" severity="info" className="mr-2" onClick={() => infoEstudiante(rowData)} />
                <Button style={{ width: '2rem', height: '2rem' }} icon="pi pi-power-off" rounded severity="danger" onClick={() => confirmDeleteEstudiante(rowData)} />
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

    const exportDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideExportDialog} />
            {/* <Button label="Descargar" icon="pi pi-download" onClick={exportCSV} /> */}
            <Link href={`http://localhost:3001/api/estudiante/obtenerListaEstudiantes?c=${carrera}`}>
                <Button label="Descargar" icon="pi pi-download" onClick={hideExportDialog} />
            </Link>
        </>
    );

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
                        <Column field="Estado" body={statusBodyTemplate} header="Estado" sortable align='center' />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={estudianteDialog} style={{ width: '650px' }} header="Detalles de estudiante" modal className="p-fluid" footer={estudianteDialogFooter} onHide={hideDialog}>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="foto">Foto</label>
                                {imagenURL && (
                                    <div className="field">
                                        <Image src={imagenURL} zoomSrc={imagenURL} alt="Foto Docente" width="80" height="80" preview />
                                    </div>
                                )}
                                <FileUpload
                                    chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }}
                                    chooseLabel='Subir imagen'
                                    mode="basic"
                                    accept="image/*"
                                    maxFileSize={5000000}
                                    customUpload
                                    onSelect={(e) => handleUpload(e)}
                                />
                            </div>
                        </div>
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
                                <Dropdown
                                    id="Carrera"
                                    value={estudiante.CodigoCarreraProfesional}
                                    onChange={(e) => {
                                        onDropdownChange(e, 'CodigoCarreraProfesional');
                                    }}
                                    name="CodigoCarreraProfesional"
                                    options={carreras}
                                    optionLabel="NombreCarrera"
                                    optionValue="Codigo"
                                    placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': submitted && !estudiante.CodigoCarreraProfesional })}
                                ></Dropdown>
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
                    </Dialog>

                    <Dialog visible={estudianteInfoDialog} style={{ width: '400px' }} header="Otros datos del estudiante" modal className="p-fluid" onHide={hideInfoDialog}>
                        <p><strong>Código:</strong> {estudiante.CodigoSunedu}</p>
                        <p><strong>Nombre:</strong> {estudiante.Nombres + ' ' + estudiante.Paterno + ' ' + estudiante.Materno}</p>
                        <p><strong>Dirección:</strong> {estudiante.Direccion}</p>
                        <p><strong>Email personal:</strong> {estudiante.EmailPersonal}</p>
                        <p><strong>Celular:</strong> {estudiante.Celular}</p>
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
                                    className={classNames({ 'p-invalid': submitted && !carrera })}
                                ></Dropdown>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};