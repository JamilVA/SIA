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
import { Dropdown } from 'primereact/dropdown';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function AdminCursosPage() {
    let emptyCurso: Sia.Curso = {
        Codigo: '',
        Nombre: '',
        HorasTeoria: null,
        HorasPractica: null,
        Creditos: null,
        Nivel: 0,
        Semestre: 0,
        Tipo: '',
        Estado: true,
        ConPrerequisito: false,
        CodigoCurso: undefined,
        CodigoCarreraProfesional: 0
    };

    const [cursos, setCursos] = useState<Sia.Curso[]>([]);
    const [carreras, setCarreras] = useState<Sia.CarreraProfesional[]>([]);
    const [prerequisitos, setPrerequisitos] = useState<Sia.Curso[]>([]);
    const [cursoDialog, setCursoDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    const [pdfURL, setPdfURL] = useState('');
    const [exportDialog, setExportDialog] = useState(false);
    const [deleteCursoDialog, setDeleteCursoDialog] = useState(false);
    const [curso, setCurso] = useState<Sia.Curso>(emptyCurso);
    const [carrera, setCarrera] = useState();
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [state, setState] = useState('');
    const [className, setClassName] = useState('disable');
    const { data: session, status } = useSession();

    const niveles = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }];

    const semestres = [{ value: 1 }, { value: 2 }];

    const tipos = [
        { name: 'Teórico obligatorio', value: 'TO' },
        { name: 'Taller práctico obligatorio', value: 'TPO' },
        { name: 'Formación artística obligatoria', value: 'FAO' }
    ];

    const ciclos = [
        { name: 1, nivel: 1, semestre: 1 },
        { name: 2, nivel: 1, semestre: 2 },
        { name: 3, nivel: 2, semestre: 1 },
        { name: 4, nivel: 2, semestre: 2 },
        { name: 5, nivel: 3, semestre: 1 },
        { name: 6, nivel: 3, semestre: 2 },
        { name: 7, nivel: 4, semestre: 1 },
        { name: 8, nivel: 4, semestre: 2 },
        { name: 9, nivel: 5, semestre: 1 },
        { name: 10, nivel: 5, semestre: 2 },
    ]

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const result = await axios('/curso', {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            setCursos(result.data.cursos);
            setCarreras(result.data.carreras);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    };

    const getPrerequisitos = (carrera: number | undefined = 0, nivel: number = 0, semestre: number = 0) => {
        let _prerequisitos: Sia.Curso[];

        if (semestre == 1) {
            _prerequisitos = cursos.filter((a: Sia.Curso) => a.CodigoCarreraProfesional == carrera && a.Nivel == nivel - 1 && a.Semestre == 2);
            setPrerequisitos(_prerequisitos);
        } else {
            _prerequisitos = cursos.filter((a: Sia.Curso) => a.CodigoCarreraProfesional == carrera && a.Nivel == nivel && a.Semestre == 1);
            setPrerequisitos(_prerequisitos);
        }
    };

    const openNew = () => {
        setCurso(emptyCurso);
        setPrerequisitos([]);
        setSubmitted(false);
        setCursoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCursoDialog(false);
    };

    const hideDeleteCursoDialog = () => {
        setDeleteCursoDialog(false);
    };

    const hideExportDialog = () => {
        setExportDialog(false);
    };

    const onSubmitChange = async (e: React.MouseEvent<HTMLButtonElement>, data: object) => {
        e.preventDefault();
        var response = '';
        try {
            const result = await axios.post('/curso', data, {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            response = result.data.Estado;
            fetchData();
            if (response == 'Error') {
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
    };

    const onUpdate = async (e: React.MouseEvent<HTMLButtonElement>, data: object) => {
        e.preventDefault();
        var response = '';
        try {
            const result = await axios.put('/curso', data, {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            response = result.data.Estado;
            fetchData();

            if (response == 'Error') {
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
    };

    const crearCodigo = (carrera: number | undefined, nivel: number, semestre: number) => {
        let listaCursos = cursos.filter((a: Sia.Curso) => a.CodigoCarreraProfesional == carrera && a.Nivel == nivel && a.Semestre == semestre);
        let codLastCurso = listaCursos[listaCursos.length - 1].Codigo;
        let correlativo = Number(codLastCurso?.substr(-2)) + 1;
        let cadena = nivel?.toString();
        cadena += semestre?.toString() + '';
        let c: string;
        if (correlativo < 10) {
            c = '0';
        } else {
            c = '';
        }

        if (carrera == 1) {
            return 'AV' + cadena + c + correlativo?.toString();
        } else if (carrera == 2) {
            return 'MU' + cadena + c + correlativo?.toString();
        } else if (carrera == 3) {
            return 'AP' + cadena + c + correlativo?.toString();
        } else if (carrera == 4) {
            return 'AE' + cadena + c + correlativo?.toString();
        }
    };

    const verifyInputs = () => {
        if (curso.Nombre.trim() && curso.CodigoCarreraProfesional != 0 && curso.Tipo != '' && curso.Nivel != 0 && curso.Semestre != 0 && curso.Creditos != 0) {
            return true;
        } else {
            return false;
        }
    };

    const saveCurso = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSubmitted(true);
        if (verifyInputs()) {
            let _curso = { ...curso };
            _curso.ConPrerequisito = _curso.CodigoCurso == undefined ? false : true;

            if (_curso.Codigo != '') {
                onUpdate(e, _curso);
            } else {
                _curso.Codigo = crearCodigo(_curso.CodigoCarreraProfesional, _curso.Nivel, curso.Semestre);
                onSubmitChange(e, _curso);
            }
            setCursoDialog(false);
            setCurso(emptyCurso);
        }
    };

    const editCurso = (curso: Sia.Curso) => {
        setCurso({ ...curso });
        getPrerequisitos(curso.CodigoCarreraProfesional, curso.Nivel, curso.Semestre);
        setCursoDialog(true);
    };

    const confirmDeleteCurso = (curso: Sia.Curso) => {
        setCurso(curso);
        if (curso.Estado == false) {
            setState('habilitar');
        } else {
            setState('deshabilitar');
        }
        setDeleteCursoDialog(true);
    };

    const obtenerLista = async () => {
        try {
            await axios
                .get('/curso/obtenerListaCursos', {
                    params: { c: carrera },
                    responseType: 'blob',
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                })
                .then((response) => {
                    // console.log(response);
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    // console.log(url);
                    setPdfURL(url);
                    setVisible(true);
                    //URL.revokeObjectURL(url);
                })
                .catch((error) => {
                    //// console.error(error.response);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error en la descarga',
                        detail: error.response ? 'Error al generar el pdf' : error.message,
                        life: 3000
                    });
                });
        } catch (error) {
            // console.error('Error al descargar la constancia:', error);
        }
    };

    const deleteCurso = (e: React.MouseEvent<HTMLButtonElement>) => {
        setCurso({ ...curso });
        let state: boolean;
        if (curso.Estado == false) {
            state = true;
        } else {
            state = false;
        }
        setSubmitted(true);
        let _curso = { ...curso };
        _curso.Estado = state;
        onUpdate(e, _curso);
        setDeleteCursoDialog(false);
        setCurso(emptyCurso);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _curso = { ...curso };
        _curso[`${name}`] = val.toUpperCase();

        setCurso(_curso);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        let _curso = { ...curso };
        _curso[`${name}`] = val;

        setCurso(_curso);
    };

    const onDropdownChange = (e: any, name: keyof typeof emptyCurso) => {
        const val = (e.target && e.target.value) || '';
        let _curso = { ...curso };

        _curso[`${name}`] = val;

        setCurso(_curso);
        getPrerequisitos(_curso.CodigoCarreraProfesional, _curso.Nivel, _curso.Semestre);
    };

    const onCicloChange = (e: any) => {
        const val = (e.target && e.target.value) || '';
        let _curso = { ...curso };
        _curso['Nivel'] = ciclos[val].nivel;
        _curso['Semestre'] = ciclos[val].semestre;
        setCurso(_curso);
        getPrerequisitos(_curso.CodigoCarreraProfesional, _curso.Nivel, _curso.Semestre);
    }

    const onCarreraSelect = (e: any) => {
        const val = (e.target && e.target.value) || '';
        let carrera = val;
        setCarrera(carrera);
        // console.log('Carrera', carrera);
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
                <Button
                    label="Exportar"
                    icon="pi pi-upload"
                    severity="help"
                    onClick={() => {
                        setExportDialog(true);
                    }}
                />
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: Sia.Curso) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="warning" className="mr-2" onClick={() => editCurso(rowData)} />
                <Button icon="pi pi-power-off" rounded severity={rowData.Estado ? 'danger' : 'info'} onClick={() => confirmDeleteCurso(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">GESTIÓN DE CURSOS</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const cursoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveCurso} />
        </>
    );

    const exportDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideExportDialog} />
            {/* <Button label="Descargar" icon="pi pi-download" onClick={exportCSV} /> */}
            <Button label="Descargar" icon="pi pi-file-pdf" className="p-button-primary" onClick={obtenerLista} />
        </>
    );

    const deleteCursoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCursoDialog} />
            <Button label="Si" icon="pi pi-check" onClick={deleteCurso} />
        </>
    );

    const bodyCiclo = (rowData: any) => {
        return (
            <>{(rowData.Nivel - 1) * 2 + rowData.Semestre}</>
        )
    }

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
    } else if (session?.user.nivelUsuario != 6) {
        redirect('/pages/notfound');
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={cursos}
                        dataKey="Codigo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} cursos"
                        globalFilter={globalFilter}
                        emptyMessage="Sin cursos registrados"
                        header={header}
                    >
                        <Column field="Codigo" header="COD" sortable />
                        <Column field="Nombre" header="Nombre" sortable />
                        <Column field="CodigoCurso" header="Prerequisito" />
                        <Column field="CarreraProfesional.NombreCarrera" header="Carrera" sortable />
                        <Column body={bodyCiclo} header="Ciclo" sortable />
                        <Column field="Creditos" header="Créditos" />
                        <Column field="Tipo" header="Tipo" />
                        <Column field="HorasTeoria" header="HT" />
                        <Column field="HorasPractica" header="HP" />
                        <Column field="Estado" body={statusBodyTemplate} header="Estado" sortable />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={cursoDialog} style={{ width: '750px' }} header="Detalles de curso" modal className="p-fluid" footer={cursoDialogFooter} onHide={hideDialog}>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="Nombre">Nombre</label>
                                <InputText autoFocus id="Nombre" value={curso.Nombre} onChange={(e) => onInputChange(e, 'Nombre')} required className={classNames({ 'p-invalid': submitted && !curso.Nombre })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="Carrera">Carrera</label>
                                <Dropdown
                                    id="Carrera"
                                    value={curso.CodigoCarreraProfesional}
                                    onChange={(e) => {
                                        onDropdownChange(e, 'CodigoCarreraProfesional');
                                    }}
                                    name="CodigoCarreraProfesional"
                                    options={carreras}
                                    optionLabel="NombreCarrera"
                                    optionValue="Codigo"
                                    placeholder="Seleccione"
                                    className={classNames({ 'p-invalid': submitted && !curso.CodigoCarreraProfesional })}
                                ></Dropdown>
                            </div>
                            <div className="field col">
                                <label htmlFor="Nivel">Nivel</label>
                                <Dropdown
                                    value={curso.Nivel}
                                    options={niveles}
                                    optionLabel="value"
                                    optionValue="value"
                                    name="Nivel"
                                    onChange={(e) => {
                                        onDropdownChange(e, 'Nivel');
                                    }}
                                    placeholder="Seleccione el Nivel"
                                    id="Nivel"
                                    required
                                    className={classNames({ 'p-invalid': submitted && !curso.Nivel })}
                                />
                            </div>
                            {/*<div className="field col">
                                <label htmlFor="Ciclo">Ciclo</label>
                                <Dropdown
                                    value={(curso.Nivel - 1) * 2 + curso.Semestre}
                                    options={ciclos}
                                    optionLabel="name"
                                    optionValue="name"
                                    name="Ciclo"
                                    onChange={(e) => {
                                        onCicloChange(e);
                                    }}
                                    placeholder="Seleccione el Ciclo"
                                    id="Ciclo"
                                    required
                                    className={classNames({ 'p-invalid': submitted && !curso.Nivel })}
                                />
                                </div>*/}
                        </div>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="Semestre">Semestre</label>
                                <Dropdown
                                    value={curso.Semestre}
                                    options={semestres}
                                    optionLabel="value"
                                    optionValue="value"
                                    name="Nivel"
                                    onChange={(e) => {
                                        onDropdownChange(e, 'Semestre');
                                    }}
                                    placeholder="Seleccione el Semestre"
                                    id="Semestre"
                                    required
                                    className={classNames({ 'p-invalid': submitted && !curso.Semestre })}
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="Creditos">Creditos</label>
                                <InputNumber maxLength={2} id="Creditos" value={curso.Creditos} onValueChange={(e) => onInputNumberChange(e, 'Creditos')} required className={classNames({ 'p-invalid': submitted && !curso.Creditos })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="Tipo">Tipo</label>
                                <Dropdown
                                    value={curso.Tipo}
                                    options={tipos}
                                    optionLabel="name"
                                    optionValue="value"
                                    name="Nivel"
                                    onChange={(e) => {
                                        onDropdownChange(e, 'Tipo');
                                    }}
                                    placeholder="Seleccione el Tipo"
                                    id="Tipo"
                                    required
                                    className={classNames({ 'p-invalid': submitted && !curso.Tipo })}
                                />
                            </div>
                        </div>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="HorasTeoria">Horas Teoria</label>
                                <InputNumber maxLength={2} id="HorasTeoria" value={curso.HorasTeoria} onValueChange={(e) => onInputNumberChange(e, 'HorasTeoria')} required className={classNames({ 'p-invalid': submitted && !curso.HorasTeoria })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="HorasPractica">Horas Practica</label>
                                <InputNumber
                                    maxLength={2}
                                    id="HorasPractica"
                                    value={curso.HorasPractica}
                                    onValueChange={(e) => onInputNumberChange(e, 'HorasPractica')}
                                    required
                                    className={classNames({ 'p-invalid': submitted && !curso.HorasPractica })}
                                />
                            </div>

                            <div className="field col">
                                <label htmlFor="Prerequisito">Prerequisito</label>
                                <Dropdown
                                    value={curso.CodigoCurso}
                                    options={prerequisitos}
                                    optionLabel="Nombre"
                                    optionValue="Codigo"
                                    name="Prerequisito"
                                    onChange={(e) => {
                                        onDropdownChange(e, 'CodigoCurso');
                                    }}
                                    placeholder="Seleccione"
                                    id="Prerequisito"
                                    required
                                />
                            </div>
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
                                    placeholder="Seleccione"
                                    className={classNames({ 'p-invalid': submitted && !carrera })}
                                ></Dropdown>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCursoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteCursoDialogFooter} onHide={hideDeleteCursoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {curso && (
                                <span>
                                    Estás seguro de <span>{state} a</span> <b>{curso.Nombre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                    <Dialog header="Vista PDF de lista de cursos" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                        <iframe src={pdfURL} width="100%" height="99%"></iframe>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};
