'use client';
import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance as axios } from '../../../utils/axios.instance';
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
import { Calendar } from 'primereact/calendar';
import { CalendarChangeEvent } from 'primereact/calendar';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
        FechaNacimiento: '',
        Sexo: '',
        DNI: '',
        Email: ''
    };

    let emptyDocente: {
        Codigo: null | string;
        CondicionLaboral: string;
        Estado: boolean | string;
        Paterno: string;
        Materno: string;
        Nombres: string;
        RutaFoto: string;
        CodigoPersona: string;
        fechaNacimiento: string | Date;
        sexo: string;
        DNI: string;
        email: string;
    } = {
        Codigo: null,
        CodigoPersona: '',
        CondicionLaboral: '',
        Estado: true,
        Paterno: '',
        Materno: '',
        Nombres: '',
        RutaFoto: '',
        fechaNacimiento: '',
        sexo: '',
        DNI: '',
        email: ''
    };

    const departamentos = [{ Denominacion: 'Profesionales Pedagógicos' }, { Denominacion: 'Artistas Profesionales' }];

    const [jefeDepartamentoDialog, setJefeDepartamentoDialog] = useState(false);
    const [asignacionDialog, setAsignacionDialog] = useState(false);
    const [cambioDNI, setCambioDNI] = useState(false);
    const [cambioEmail, setCambioEmail] = useState(false);
    const [cambioDepartamento, setCambioDepartamento] = useState(false);
    const [deleteJefeDepartamentoDialog, setDeleteJefeDepartamentoDialog] = useState(false);
    const [advertencia, setAdvertencia] = useState({ activo: false, mensaje: '' });
    const [jefeDepartamento, setJefeDepartamento] = useState(emptyJefeDepartamento);
    const [docenteJefe, setDocenteJefe] = useState(emptyDocente);
    const [jefeDepartamentos, setJefeDepartamentos] = useState<(typeof jefeDepartamento)[]>([]);
    const [docentes, setDocentes] = useState<(typeof emptyDocente)[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [departamento, setDepartamento] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const result = await axios.get('/jefeDepartamento', {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });

            const jefeDepartamentosConNombreCompleto = result.data.jefesDepartamento.map((jefeDepartamento: any) => ({
                ...jefeDepartamento,
                NombreCompleto: `${jefeDepartamento.Persona.Nombres} ${jefeDepartamento.Persona.Paterno} ${jefeDepartamento.Persona.Materno}`
            }));

            setJefeDepartamentos(jefeDepartamentosConNombreCompleto);
            // console.log(jefeDepartamentosConNombreCompleto);
        } catch (e) {
            // console.log(e);
        }
    };

    const getDocentes = async () => {
        try {
            const result = await axios.get('/docente', {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });

            const docentesConNombreCompleto = result.data.docentes.map((docente: any) => ({
                ...docente,
                NombreCompleto: `${docente.Persona.Nombres} ${docente.Persona.Paterno} ${docente.Persona.Materno}`
            }));

            setDocentes(docentesConNombreCompleto);
            // console.log(result.data);
        } catch (e) {
            // console.log(e);
            toast.current?.show({
                severity: 'error',
                summary: 'Operacion fallida',
                detail: 'Ha ocurrido un error al procesar la solicitud',
                life: 3000
            });
        }
    };

    const openNew = () => {
        setJefeDepartamento(emptyJefeDepartamento);
        setCambioEmail(false);
        setCambioDNI(false);
        setCambioDepartamento(false);
        setSubmitted(false);
        setJefeDepartamentoDialog(true);
    };

    const newAsignacion = () => {
        getDocentes();
        setAsignacionDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setJefeDepartamentoDialog(false);
        setCambioEmail(false);
        setCambioDNI(false);
        setCambioDepartamento(false);
    };

    const hideDeleteJefeDepartamentoDialog = () => {
        setDeleteJefeDepartamentoDialog(false);
        setCambioEmail(false);
        setCambioDNI(false);
        setCambioDepartamento(false);
    };

    const hideAsignacionDialog = () => {
        setDepartamento('');
        setDocenteJefe(emptyDocente)
        setAsignacionDialog(false);
        setGlobalFilter('');
        // console.log('Global filter reset');
    };

    const saveJefeDepartamento = () => {
        setSubmitted(true);

        if (jefeDepartamento.Nombres.trim() && jefeDepartamento.Paterno.trim() && jefeDepartamento.Materno.trim() && jefeDepartamento.FechaNacimiento && jefeDepartamento.Sexo && jefeDepartamento.DNI.trim() && jefeDepartamento.Email.trim()) {
            let _jefeDepartamento = { ...jefeDepartamento };

            const codigosCarreras = [0, 0];

            if (jefeDepartamento.Departamento == 'Profesionales Pedagógicos') {
                codigosCarreras[0] = 1;
                codigosCarreras[1] = 2;
                // console.log(codigosCarreras);
            } else if (jefeDepartamento.Departamento == 'Artistas Profesionales') {
                codigosCarreras[0] = 3;
                codigosCarreras[1] = 4;
                // console.log(codigosCarreras);
            }
            if (!jefeDepartamento.Codigo) {
                if (validarDNI(jefeDepartamento.DNI.trim()) && validarEmail(jefeDepartamento.Email.trim()) && validarDepartamento(jefeDepartamento.Departamento.trim())) {
                    axios
                        .post('/jefeDepartamento', {
                            departamento: _jefeDepartamento.Departamento,
                            fechaAlta: new Date(),
                            paterno: _jefeDepartamento.Paterno,
                            materno: _jefeDepartamento.Materno,
                            nombres: _jefeDepartamento.Nombres,
                            email: _jefeDepartamento.Email,
                            sexo: _jefeDepartamento.Sexo,
                            fechaNacimiento: _jefeDepartamento.FechaNacimiento,
                            DNI: _jefeDepartamento.DNI
                        }, {
                            headers: {
                                Authorization: 'Bearer ' + session?.user.token
                            }
                        })
                        .then((response) => {
                            for (let i = 0; i < codigosCarreras.length; i++) {
                                axios
                                    .put('/jefeDepartamento/carrera', {
                                        codigoJefeDepartamento: response.data.jefeDepartamento.Codigo,
                                        codigo: codigosCarreras[i]
                                    }, {
                                        headers: {
                                            Authorization: 'Bearer ' + session?.user.token
                                        }
                                    })
                                    .then((response) => {
                                        // console.log(response);
                                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Carrera Profesional asignada con éxito', life: 3000 });
                                    });
                            }
                            // console.log(response.data);
                            toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Jefe de Departamento creado con éxito', life: 3000 });
                            fetchData();
                        });
                    setJefeDepartamentoDialog(false);
                    setJefeDepartamento(emptyJefeDepartamento);

                    setCambioEmail(false);
                    setCambioDNI(false);
                    setCambioDepartamento(false);
                }
            } else if (
                (!cambioDNI || (cambioDNI && validarDNI(jefeDepartamento.DNI.trim()))) &&
                (!cambioEmail || (cambioEmail && validarEmail(jefeDepartamento.Email.trim()))) &&
                (!cambioDepartamento || (cambioDepartamento && validarDepartamento(jefeDepartamento.Departamento)))
            ) {
                axios
                    .put('/jefeDepartamento', {
                        codigo: _jefeDepartamento.Codigo,
                        departamento: _jefeDepartamento.Departamento,
                        paterno: _jefeDepartamento.Paterno,
                        materno: _jefeDepartamento.Materno,
                        nombres: _jefeDepartamento.Nombres,
                        email: _jefeDepartamento.Email,
                        sexo: _jefeDepartamento.Sexo,
                        fechaNacimiento: _jefeDepartamento.FechaNacimiento,
                        DNI: _jefeDepartamento.DNI,
                        codigoPersona: _jefeDepartamento.CodigoPersona
                    }, {
                        headers: {
                            Authorization: 'Bearer ' + session?.user.token
                        }
                    })
                    .then((response) => {
                        // console.log(response);
                        for (let i = 0; i < codigosCarreras.length; i++) {
                            axios
                                .put('/jefeDepartamento/carrera', {
                                    codigoJefeDepartamento: _jefeDepartamento.Codigo,
                                    codigo: codigosCarreras[i]
                                }, {
                                    headers: {
                                        Authorization: 'Bearer ' + session?.user.token
                                    }
                                })
                                .then((response) => {
                                    // console.log(response);
                                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Carrera Profesional actualizada con éxito', life: 3000 });
                                });
                        }
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Jefe de Departamento actualizado con éxito', life: 3000 });
                        fetchData();
                        setCambioEmail(false);
                        setCambioDNI(false);
                        setCambioDepartamento(false);
                    });

                setJefeDepartamentoDialog(false);
                setJefeDepartamento(emptyJefeDepartamento);
            }
        }
    };

    const validarDepartamento = (Departamento: string) => {
        const departamentoExists = jefeDepartamentos.some((doc: any) => {
            return doc.Departamento === Departamento;
        });

        // console.log('Departamento:', departamentoExists);

        if (departamentoExists) {
            setAdvertencia({ activo: true, mensaje: 'Este departamento ya tiene un Jefe asignado,<br/>por favor deshabilítelo primero antes de asignar uno nuevo' });
            return false;
        }

        setAdvertencia({ activo: false, mensaje: '' });
        return true;
    };

    const validarEmail = (Email: string) => {
        const emailExists = jefeDepartamentos.some((doc: any) => {
            return doc.Persona.Usuario.Email === Email;
        });

        // console.log('Email:', emailExists);

        if (emailExists) {
            setAdvertencia({ activo: true, mensaje: 'Este correo ya está registrado. Por favor, ingresa otro.' });
            return false;
        }
        setAdvertencia({ activo: false, mensaje: '' });
        return true;
    };

    const validarDNI = (DNI: string) => {
        const regexSoloNumeros = /^[0-9]+$/;

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

        // console.log('dniExists:', dniExists);

        if (dniExists) {
            setAdvertencia({ activo: true, mensaje: 'Este DNI ya está registrado. Por favor, ingresa otro.' });
            // console.log('El DNI ya existe');
            return false;
        }

        setAdvertencia({ activo: false, mensaje: '' });
        return true;
    };

    const HideAdvertencia = () => {
        setAdvertencia({ activo: false, mensaje: '' });
    };

    const editJefeDepartamento = (jefeDepartamento: any) => {
        if (jefeDepartamento.Estado == false) {
            setAdvertencia({ activo: true, mensaje: 'Este Jefe de Departamento esta desabilitado,<br/>por favor habilítelo primero antes de editar su información' });
            return false;
        }

        let tempJefeDepartamento = {
            Codigo: jefeDepartamento.Codigo,
            Departamento: jefeDepartamento.Departamento,
            FechaAlta: jefeDepartamento.FechaAlta,
            FechaBaja: jefeDepartamento.FechaBaja,
            Estado: jefeDepartamento.Estado,
            Paterno: jefeDepartamento.Persona?.Paterno,
            Materno: jefeDepartamento.Persona?.Materno,
            Nombres: jefeDepartamento.Persona?.Nombres,
            RutaFoto: jefeDepartamento.Persona?.RutaFoto,
            CodigoPersona: jefeDepartamento.CodigoPersona,
            FechaNacimiento: new Date(jefeDepartamento.Persona?.FechaNacimiento),
            Sexo: jefeDepartamento.Persona?.Sexo,
            DNI: jefeDepartamento.Persona?.DNI,
            Email: jefeDepartamento.Persona?.Usuario.Email
        };

        setJefeDepartamento(tempJefeDepartamento);
        // console.log(jefeDepartamento);
        setJefeDepartamentoDialog(true);
    };

    const confirmDeleteJefeDepartamento = (jefeDepartamento: any) => {
        setJefeDepartamento(jefeDepartamento);
        setDeleteJefeDepartamentoDialog(true);
    };

    const deleteJefeDepartamento = (rowData: any) => {
        // console.log(rowData.Codigo);

        const codigosCarreras = [0, 0];

        if (rowData.Departamento == 'Profesionales Pedagógicos') {
            codigosCarreras[0] = 1;
            codigosCarreras[1] = 2;
            // console.log(codigosCarreras);
        } else if (rowData.Departamento == 'Artistas Profesionales') {
            codigosCarreras[0] = 3;
            codigosCarreras[1] = 4;
            // console.log(codigosCarreras);
        }

        const _estado = rowData.Estado ? false : true;
        axios
            .put('/jefeDepartamento', {
                codigo: rowData.Codigo,
                departamento: 'No asignado',
                estado: _estado,
                fechaBaja: new Date()
            }, {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                for (let i = 0; i < codigosCarreras.length; i++) {
                    axios
                        .put('/jefeDepartamento/carrera', {
                            codigoJefeDepartamento: null,
                            codigo: codigosCarreras[i]
                        }, {
                            headers: {
                                Authorization: 'Bearer ' + session?.user.token
                            }
                        })
                        .then((response) => {
                            // console.log(response);
                            toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Carrera Profesional desasignada con éxito', life: 3000 });
                        });
                }
                fetchData();
                setDeleteJefeDepartamentoDialog(false);
                setJefeDepartamento(emptyJefeDepartamento);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: rowData.Estado ? 'Jefe de departamento deshabilitado' : 'Jefe de departamento habilitado', life: 3000 });
            });
    };

    const asignarDocente = () => {
        // console.log('Docente a asignar', docenteJefe);
        // console.log('Departamento a asignar', departamento);

        if (docenteJefe.Codigo && departamento != '') {
            if (validarDepartamento(departamento)) {
                let codigosCarreras = [0, 0];

                if (departamento == 'Profesionales Pedagógicos') {
                    codigosCarreras[0] = 1;
                    codigosCarreras[1] = 2;
                    // console.log(codigosCarreras);
                } else if (departamento == 'Artistas Profesionales') {
                    codigosCarreras[0] = 3;
                    codigosCarreras[1] = 4;
                    // console.log(codigosCarreras);
                }

                axios
                    .put('/jefeDepartamento/asignarDocente', {
                        Codigo: docenteJefe.CodigoPersona,
                        Departamento: departamento
                    }, {
                        headers: {
                            Authorization: 'Bearer ' + session?.user.token
                        }
                    })
                    .then((response) => {
                        for (let i = 0; i < codigosCarreras.length; i++) {
                            axios
                                .put('/jefeDepartamento/carrera', {
                                    codigoJefeDepartamento: response.data.jefeDepartamento.Codigo,
                                    codigo: codigosCarreras[i]
                                }, {
                                    headers: {
                                        Authorization: 'Bearer ' + session?.user.token
                                    }
                                })
                                .then((response) => {
                                    // console.log(response);
                                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Carrera Profesional actualizada con éxito', life: 3000 });
                                });
                        }
                        fetchData();
                        setAsignacionDialog(false);
                        setDocenteJefe(emptyDocente);
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Docente asignado como Jefe de Departamento con éxito', life: 3000 });
                    });
            }
        } else {
            if (!docenteJefe.Codigo) {
                setAdvertencia({ activo: true, mensaje: 'Seleccione un docente para asignarlo como Jefe de Departamento' });
            }

            if (departamento == '') {
                setAdvertencia({ activo: true, mensaje: 'Seleccione un departamento para asignar' });
            }
        }
    };

    const onSexoChange = (e: any) => {
        let _jefeDepartamento = { ...jefeDepartamento };

        _jefeDepartamento['Sexo'] = e.value;
        setJefeDepartamento(_jefeDepartamento);
        // console.log(jefeDepartamento);
    };

    const onFileSelect = (e: any) => {
        // Aquí se puede manejar el archivo seleccionado
        // console.log(e.files);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof typeof emptyJefeDepartamento) => {
        const val = (e.target && e.target.value) || '';
        let _jefeDepartamento = { ...jefeDepartamento };

        // console.log(name);

        if (name == 'Email') {
            _jefeDepartamento[`${name}`] = val;
            setCambioEmail(true);
            // console.log('Email Cambio: ' + cambioEmail);
            // console.log(cambioEmail);
        } else {
            _jefeDepartamento[`${name}`] = val.toUpperCase();
        }

        if (name == 'DNI') {
            setCambioDNI(true);
            // console.log('DNI Cambio: ' + cambioDNI);
            // console.log(cambioDNI);
        }

        setJefeDepartamento(_jefeDepartamento);
        // console.log(jefeDepartamento);
    };

    const onDropdownChange = (e: any, name: keyof typeof emptyJefeDepartamento) => {
        const val = (e.target && e.target.value) || '';

        if (val != 'Seleccione') {
            let _jefeDepartamento = { ...jefeDepartamento };

            _jefeDepartamento[`${name}`] = val;

            setCambioDepartamento(true);

            setJefeDepartamento(_jefeDepartamento);
            // console.log(jefeDepartamento);
        } else return;
    };

    const onDepartamentoSelect = (e: any) => {
        const val = (e.target && e.target.value) || '';

        if (val != 'Seleccione') {
            setDepartamento(val);
            // console.log(departamento);
        } else return;
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;
        let _jefeDepartamento = { ...jefeDepartamento };
        _jefeDepartamento['FechaNacimiento'] = selectedDate;
        setJefeDepartamento(_jefeDepartamento);
        // console.log(jefeDepartamento);
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
                <Button label="Asignar un docente" icon="pi pi-search" className="p-button-help" onClick={newAsignacion} />
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
        return rowData.Persona?.Usuario?.Email;
    };

    const DNIBodyTemplate = (rowData: any) => {
        return rowData.Persona.DNI;
    };

    const condicionLaboralBodyTemplate = (rowData: any) => {
        return rowData.CondicionLaboral;
    };

    const estadoBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded className="mr-2" severity="warning" onClick={() => editJefeDepartamento(rowData)} />
                <Button icon="pi pi-power-off" rounded severity={rowData.Estado ? 'danger' : 'info'} onClick={() => confirmDeleteJefeDepartamento(rowData)} />
            </React.Fragment>
        );
    };

    const actionBodyTemplateDocente = (rowData: typeof emptyDocente) => {
        return (
            <React.Fragment>
                <Button
                    icon={rowData.Codigo === docenteJefe.Codigo ? '' : 'pi pi-check'}
                    rounded
                    label={rowData.Codigo === docenteJefe.Codigo ? 'Seleccionado' : 'Seleccionar'}
                    outlined
                    className="mr-2"
                    severity={rowData.Codigo === docenteJefe.Codigo ? 'success' : 'warning'}
                    onClick={() => {
                        setDocenteJefe(rowData);
                        // console.log(rowData);
                    }}
                />
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

    const headerDocentes = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Lista de Jefes de Docentes</h4>
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
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDeleteJefeDepartamentoDialog} />
                <Button label="Confirmar" icon="pi pi-check" severity="danger" onClick={() => deleteJefeDepartamento(jefeDepartamento)} />
            </React.Fragment>
        );
    };

    const asignacionDialogFooter = (jefeDepartamento: any) => {
        return (
            <React.Fragment>
                <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideAsignacionDialog} />
                <Button label="Confirmar" icon="pi pi-check" severity="danger" onClick={() => asignarDocente()} />
            </React.Fragment>
        );
    };

    if (!session) {
        redirect('/')
    } else if (session?.user.nivelUsuario != 6) {
        redirect('/pages/notfound');
    }

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={jefeDepartamentos} dataKey="Codigo" globalFilter={globalFilter} header={header}>
                    <Column field="NombreCompleto" header="Nombre Completo" body={nombreBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="Departamento" header="Departamento" body={departamentoBodyTemplate} sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="Persona.DNI" header="DNI" body={DNIBodyTemplate} style={{ minWidth: '5rem' }}></Column>
                    <Column field="Persona.Usuario.Email" header="Correo" body={emailBodyTemplate} style={{ minWidth: '16rem' }}></Column>
                    <Column header="Estado" dataType="boolean" sortable align="center" style={{ minWidth: '4rem' }} body={estadoBodyTemplate} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '10rem' }}></Column>
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
                    <FileUpload name="foto" url="/upload" accept="image/*" chooseLabel="Cargar Imagen" uploadLabel="Confirmar" cancelLabel="Cancelar" className="p-mb-3" maxFileSize={5 * 1024 * 1024} customUpload uploadHandler={onFileSelect} />
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
                        <Calendar id="FechaNacimiento" value={jefeDepartamento.FechaNacimiento} onChange={(e) => onCalendarChange(e)} showIcon required className={classNames({ 'p-invalid': submitted && !jefeDepartamento.FechaNacimiento })} />
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
                            placeholder="Seleccione"
                            required
                            className={classNames({ 'p-invalid': submitted && !jefeDepartamento.Departamento })}
                        />
                        {submitted && !jefeDepartamento.Departamento && <small className="p-error">Seleccione el Departamento.</small>}
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
                    {jefeDepartamento && <span>¿Esta seguro de que desea {jefeDepartamento.Estado ? 'desabilitar' : 'habilitar'} al Jefe de Departamento?</span>}
                </div>
            </Dialog>

            <Dialog
                visible={asignacionDialog}
                style={{ width: '50rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Asignar a un docente como Jefe de Departamento"
                modal
                footer={asignacionDialogFooter(jefeDepartamento)}
                onHide={hideAsignacionDialog}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="Departamento" className="font-bold">
                            Departamento:
                        </label>
                        <br />
                        <Dropdown
                            value={departamento}
                            options={departamentos}
                            optionLabel="Denominacion"
                            optionValue="Denominacion"
                            name="Departamento"
                            onChange={(e) => {
                                onDepartamentoSelect(e);
                            }}
                            placeholder="Seleccione"
                            required
                            className={classNames({ 'p-invalid': departamento == '' })}
                        />
                        {departamento == '' && (
                            <>
                                <br /> <small className="p-error">Seleccione el Departamento.</small>
                            </>
                        )}
                    </div>
                </div>

                <DataTable
                    ref={dt}
                    value={docentes}
                    dataKey="Codigo"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} docentes"
                    globalFilter={globalFilter}
                    header={headerDocentes}
                >
                    <Column field="NombreCompleto" header="Nombre Completo" body={nombreBodyTemplate} sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="Persona.DNI" header="DNI" body={DNIBodyTemplate} style={{ minWidth: '6rem' }}></Column>
                    <Column header="Condición Laboral" body={condicionLaboralBodyTemplate} sortable style={{ minWidth: '6rem' }}></Column>
                    <Column body={actionBodyTemplateDocente} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
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
                <div dangerouslySetInnerHTML={{ __html: advertencia.mensaje }}></div>
            </Dialog>
        </div>
    );
}
