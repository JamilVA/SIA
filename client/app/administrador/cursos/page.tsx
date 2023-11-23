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
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';

const Page = () => {

    let emptyCurso: Demo.Curso = {
        Codigo: '',
        Nombre: '',
        HorasTeoria: null,
        HorasPractica: null,
        Creditos: null,
        Nivel: null,
        Semestre: null,
        Tipo: '',
        Estado: true,
        ConPrerequisito: false,
        CodigoCurso: undefined,
        CodigoCarreraProfesional: 0
    }

    const [cursos, setCursos] = useState(null);
    const [cursoDialog, setCursoDialog] = useState(false);
    const [deleteCursoDialog, setDeleteCursoDialog] = useState(false);
    const [curso, setCurso] = useState<Demo.Curso>(emptyCurso);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [state, setState] = useState('');
    const [selectedCarrera, setSelectedCarrera] = useState<number | undefined>();
    const [selectedTipo, setSelectedTipo] = useState<string | undefined>();
    const [correlativo, setCorrelativo] = useState<number>();

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const result = await axios("http://localhost:3001/api/curso");
            let n = (result.data.cursos.length) + 1;
            setCursos(result.data.cursos);
            setCorrelativo(n);

            console.log(result.data.cursos);
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
        setCurso(emptyCurso);
        setSelectedCarrera(undefined);
        setSelectedTipo(undefined);
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

    const onSubmitChange = async (e: React.MouseEvent<HTMLButtonElement>, data: object) => {
        e.preventDefault();
        var response = '';
        try {
            const result = await axios.post("http://127.0.0.1:3001/api/curso", data);
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
            const result = await axios.put("http://127.0.0.1:3001/api/curso", data);
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

    const crearCodigo = () => {
        let cadena = curso.Nivel?.toString();
        cadena += curso.Semestre?.toString() + '';
        if (selectedCarrera == 1) {
            return 'A' + cadena + correlativo?.toString();
        } else if (selectedCarrera == 2) {
            return 'M' + cadena + correlativo?.toString()
        } else if (selectedCarrera == 3) {
            return 'P' + cadena + correlativo?.toString()
        } else {
            return 'E' + cadena + correlativo?.toString()
        }
    };

    const verifyInputs = () => {
        if (curso.Nombre.trim() && selectedCarrera != undefined && selectedTipo != undefined && curso.Nivel != 0 &&
            curso.Semestre != 0 && curso.Creditos != 0 && curso.HorasPractica != 0 && curso.HorasTeoria != 0) {
            return true;
        } else {
            return false;
        }
    };

    const saveCurso = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSubmitted(true);
        if (verifyInputs()) {
            let _curso = { ...curso };
            _curso.Tipo = selectedTipo;
            _curso.CodigoCarreraProfesional = selectedCarrera;
            _curso.ConPrerequisito = _curso.CodigoCurso != '' ? true : false;

            if (_curso.Codigo != '') {
                onUpdate(e, _curso)
            } else {
                _curso.Codigo = crearCodigo();
                onSubmitChange(e, _curso)
            }
            setCursoDialog(false);
            setCurso(emptyCurso);
        }
    };

    const editCurso = (curso: Demo.Curso) => {
        setCurso({ ...curso });
        setSelectedCarrera(curso.CodigoCarreraProfesional);
        setSelectedTipo(curso.Tipo);
        setCursoDialog(true);
    };

    const confirmDeleteCurso = (curso: Demo.Curso) => {
        setCurso(curso);
        if (curso.Estado == false) {
            setState('habilitar')
        } else {
            setState('deshabilitar')
        }
        setDeleteCursoDialog(true);
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
        onUpdate(e, _curso)
        setDeleteCursoDialog(false);
        setCurso(emptyCurso);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _curso = { ...curso };
        _curso[`${name}`] = (val.toUpperCase());

        setCurso(_curso);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        let _curso = { ...curso };
        _curso[`${name}`] = val;

        setCurso(_curso);
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
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const estado = (x: string | undefined) => {
        if (x == 'true') {
            return 'instock';
        } else {
            return 'outofstock';
        }
    }

    const statusBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`product-badge status-${estado(rowData.Estado?.toString())}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const carreaBodyTemplate = (rowData: Demo.Curso) => {
        let carrera = '';
        switch (rowData.CodigoCarreraProfesional) {
            case 1:
                carrera = carreras[0].name;
                break;
            case 2:
                carrera = carreras[1].name;
                break;
            case 3:
                carrera = carreras[2].name;
                break;
            case 4:
                carrera = carreras[3].name;
                break;
            default:
                break;
        }
        return (
            <>
                <span className="p-column-title">Name</span>
                {carrera}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Demo.Curso) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editCurso(rowData)} />
                <Button icon="pi pi-power-off" rounded severity="warning" onClick={() => confirmDeleteCurso(rowData)} />
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
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveCurso} />
        </>
    );
    const deleteCursoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteCursoDialog} />
            <Button label="Si" icon="pi pi-check" text onClick={deleteCurso} />
        </>
    );

    const carreras = [
        { name: 'Artes visuales', value: 1 },
        { name: 'Música', value: 2 },
        { name: 'Pintura', value: 3 },
        { name: 'Escultura', value: 4 },
    ]

    const tipos = [
        { name: 'Teórico obligatorio', value: 'TO' },
        { name: 'Taller práctico obligatorio', value: 'TPO' },
        { name: 'Formación artística obligatoria', value: 'FAO' }
    ]

    const onSelectCarrera = (e: number) => {
        setSelectedCarrera(e);
    }

    const onSelectTipo = (e: string) => {
        setSelectedTipo(e);
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
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                        globalFilter={globalFilter}
                        emptyMessage="No courses found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="Codigo" header="COD" sortable />
                        <Column field="Nombre" header="Nombre" sortable />
                        <Column field="CarreraProfesional.NombreCarrera" header="Carrera" sortable />
                        <Column field="Nivel" header="Nivel" sortable />
                        <Column field="Semestre" header="Semestre" sortable />
                        <Column field="Creditos" header="Créditos" sortable />
                        <Column field="Tipo" header="Tipo" sortable />
                        <Column field="HorasTeoria" header="HT" sortable />
                        <Column field="HorasPractica" header="HP" sortable />
                        <Column field="Estado" body={statusBodyTemplate} header="Estado" sortable />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={cursoDialog} style={{ width: '750px' }} header="Detalles de estudiante" modal className="p-fluid" footer={cursoDialogFooter} onHide={hideDialog}>

                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="Nombre">Nombre</label>
                                <InputText autoFocus id="Nombre" value={curso.Nombre} onChange={(e) => onInputChange(e, 'Nombre')} required
                                    className={classNames({ 'p-invalid': submitted && !curso.Nombre })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="Carrera">Carrera</label>
                                <Dropdown id="arrera" value={selectedCarrera} onChange={(e) => onSelectCarrera(e.value)} options={carreras} optionLabel="name" placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': submitted && !selectedCarrera })}></Dropdown>
                            </div>
                            <div className="field col">
                                <label htmlFor="Nivel">Nivel</label>
                                <InputNumber maxLength={1} id="Nivel" value={curso.Nivel} onValueChange={(e) => onInputNumberChange(e, 'Nivel')} required
                                    className={classNames({ 'p-invalid': submitted && !curso.Nivel })} />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="Semestre">Semestre</label>
                                <InputNumber maxLength={1} id="Semestre" value={curso.Semestre} onValueChange={(e) => onInputNumberChange(e, 'Semestre')} required
                                    className={classNames({ 'p-invalid': submitted && !curso.Semestre })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="Creditos">Creditos</label>
                                <InputNumber maxLength={1} id="Creditos" value={curso.Creditos} onValueChange={(e) => onInputNumberChange(e, 'Creditos')} required
                                    className={classNames({ 'p-invalid': submitted && !curso.Creditos })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="Tipo">Tipo</label>
                                <Dropdown id="Tipo" value={selectedTipo} onChange={(e) => onSelectTipo(e.value)} options={tipos} optionLabel="name" placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': submitted && !selectedTipo })}></Dropdown>
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="HorasPractica">Horas Practica</label>
                                <InputNumber maxLength={1} id="HorasPractica" value={curso.HorasPractica} onValueChange={(e) => onInputNumberChange(e, 'HorasPractica')} required
                                    className={classNames({ 'p-invalid': submitted && !curso.HorasPractica })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="HorasTeoria">Horas Teoria</label>
                                <InputNumber maxLength={1} id="HorasTeoria" value={curso.HorasTeoria} onValueChange={(e) => onInputNumberChange(e, 'HorasTeoria')} required
                                    className={classNames({ 'p-invalid': submitted && !curso.HorasTeoria })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="CodigoCurso">Prerequisito</label>
                                <InputText id="CodigoCurso" maxLength={5} value={curso.CodigoCurso} onChange={(e) => onInputChange(e, 'CodigoCurso')} required />
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
                </div>
            </div>
        </div>
    );

};

export default Page;