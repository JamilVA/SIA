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
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Demo } from '../../../types/types';
import axios from 'axios'
import { Dropdown } from 'primereact/dropdown';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';

const page = () => {

    let emptyProduct: Demo.Student = {
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

    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [product, setProduct] = useState<Demo.Student>(emptyProduct);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [state, setState] = useState('');
    const [selectedCarrera, setSelectedCarrera] = useState<number | undefined>();
    const [selectedGenero, setSelectedGenero] = useState<string | undefined>();

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const result = await axios("http://localhost:3001/api/estudiante");
            setProducts(result.data.estudiantes);
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
        setProduct(emptyProduct);
        setSelectedCarrera(undefined);
        setSelectedGenero(undefined);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
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
        if (product.Paterno.trim() && product.DNI.trim() && isNumeric(product.DNI) && product.DNI.length == 8 && product.Nombres.trim() && product.FechaNacimiento != ''
            && selectedCarrera != undefined && product.Email!.trim() && selectedGenero != undefined) {
            return true
        } else {
            return false
        }
    }

    const saveProduct = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSubmitted(true);
        if (verifyInputs()) {
            let _product = { ...product };
            if (product.Codigo != '') {
                _product.Sexo = selectedGenero;
                _product.CodigoCarreraProfesional = selectedCarrera;
                _product.CodigoSunedu = crearSunedu(selectedCarrera) + _product.DNI;
                onUpdate(e, _product)
            } else {
                _product.Sexo = selectedGenero;
                _product.CodigoCarreraProfesional = selectedCarrera;
                _product.CodigoSunedu = crearSunedu(selectedCarrera) + _product.DNI;
                onSubmitChange(e, _product)
            }
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    const editProduct = (product: Demo.Student) => {
        let tempProduct: Demo.Student = {
            Codigo: product.Codigo,
            Paterno: product.Persona.Paterno,
            Materno: product.Persona.Materno,
            Nombres: product.Persona.Nombres,
            Estado: product.Estado,
            RutaFoto: product.RutaFoto,
            FechaNacimiento: new Date(product.Persona.FechaNacimiento),
            Sexo: product.Persona.Sexo,
            DNI: product.Persona.DNI,
            Email: product.Persona.Email,
            CodigoSunedu: product.Persona.CodigoSunedu,
            CreditosLlevados: product.CreditosLlevados,
            CreditosAprobados: product.CreditosAprobados,
            CodigoCarreraProfesional: product.CodigoCarreraProfesional,
            CodigoPersona: product.CodigoPersona,
        }

        setProduct(tempProduct);
        setSelectedCarrera(tempProduct.CodigoCarreraProfesional);
        setSelectedGenero(tempProduct.Sexo);
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product: Demo.Student) => {
        setProduct(product);
        if (product.Estado == false) {
            setState('habilitar')
        } else {
            setState('deshabilitar')
        }
        setDeleteProductDialog(true);
    };

    const deleteProduct = (e: React.MouseEvent<HTMLButtonElement>) => {
        setProduct({ ...product });
        let state: boolean;
        if (product.Estado == false) {
            state = true;
        } else {
            state = false;
        }
        setSubmitted(true);
        let _product = { ...product };
        _product.Estado = state;
        onUpdate(e, _product)
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = (val.toUpperCase());

        setProduct(_product);
    };

    const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product['Email'] = (val);

        setProduct(_product);
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;
        let _product = { ...product };
        _product['FechaNacimiento'] = selectedDate;
        setProduct(_product);
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

    const statusBodyTemplate = (rowData: Demo.Product) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: Demo.Student) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="warning" className="mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-power-off" rounded severity="danger" onClick={() => confirmDeleteProduct(rowData)} />
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

    const productDialogFooter = (
        <>
            <Button label="Cancelar" outlined icon="pi pi-times" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveProduct} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" outlined icon="pi pi-times" onClick={hideDeleteProductDialog} />
            <Button label="Si" icon="pi pi-check" onClick={deleteProduct} />
        </>
    );

    const carreras = [
        { name: 'Artes visuales', value: 1 },
        { name: 'Música', value: 2 },
        { name: 'Pintura', value: 3 },
        { name: 'Escultura', value: 4 },
    ]

    const generos = [
        { name: 'M', value: 'M' },
        { name: 'F', value: 'F' },
    ]

    const onSelectCarrera = (e: number) => {
        setSelectedCarrera(e);
    }

    const onSelectGenero = (e: string) => {
        setSelectedGenero(e);
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={products}
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

                    <Dialog visible={productDialog} style={{ width: '750px' }} header="Detalles de estudiante" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>

                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="DNI">DNI</label>
                                <InputText autoFocus id="DNI" maxLength={8} value={product.DNI} onChange={(e) => onInputChange(e, 'DNI')} required
                                    className={classNames({ 'p-invalid': submitted && !product.DNI })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="paterno">Paterno</label>
                                <InputText id="paterno" value={product.Paterno} onChange={(e) => onInputChange(e, 'Paterno')} required
                                    className={classNames({ 'p-invalid': submitted && !product.Paterno })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="materno">Materno</label>
                                <InputText id="materno" value={product.Materno} onChange={(e) => onInputChange(e, 'Materno')} required
                                    className={classNames({ 'p-invalid': submitted && !product.Materno })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="nombres">Nombres</label>
                                <InputText id="nombres" value={product.Nombres} onChange={(e) => onInputChange(e, 'Nombres')} required
                                    className={classNames({ 'p-invalid': submitted && !product.Nombres })} />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="carrera">Carrera</label>
                                <Dropdown id="carrera" value={selectedCarrera} onChange={(e) => onSelectCarrera(e.value)} options={carreras} optionLabel="name" placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': submitted && !selectedCarrera })}></Dropdown>
                            </div>
                            <div className='field col'>
                                <label htmlFor="FechaNacimiento">Fecha Nacimiento</label>
                                <Calendar value={product.FechaNacimiento} onChange={(e) => onCalendarChange(e)} dateFormat="dd/mm/yy" placeholder="mm/dd/yyyy" mask="99/99/9999"
                                    className={classNames({ 'p-invalid': submitted && !product.FechaNacimiento })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="sexo">Sexo</label>
                                <Dropdown id="sexo" value={selectedGenero} onChange={(e) => onSelectGenero(e.value)} options={generos} optionLabel="name" placeholder="Selecciona"
                                    className={classNames({ 'p-invalid': submitted && !selectedGenero })}></Dropdown>
                            </div>
                            <div className="field col">
                                <label htmlFor="email">Email</label>
                                <InputText id="email" value={product.Email} onChange={(e) => onEmailChange(e)} required
                                    className={classNames({ 'p-invalid': submitted && !product.Email })} />
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="foto">Foto</label>
                                <FileUpload mode='basic' name="demo[]" url="/api/upload" multiple accept="image/*" maxFileSize={1000000} />
                            </div>
                        </div>

                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
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

export default page;