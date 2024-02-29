/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function UsuariosPage() {

    const usuarioVacio = {
        Codigo: 0,
        Estado: false,
        Email: '',
        Persona: {
            Codigo: 0,
            Paterno: '',
            Materno: '',
            Nombres: '',
            DNI: ''
        },
        NivelUsuario: {
            Codigo: null,
            Nombre: ''
        }
    }
    const [usuarios, setUsuarios] = useState([usuarioVacio])
    const [usuario, setUsuario] = useState(usuarioVacio);
    const [nivelesUsuario, setNivelesUsuario] = useState([{ Codigo: 0, Nombre: '' }])

    const [loading, setLoading] = useState(true)
    const [editar, setEditar] = useState(false)
    const [usuarioDialog, setUsuarioDialog] = useState(false);
    const [deletePeriodoDialog, setDeletePeriodoDialog] = useState(false);
    const [finalizarPeriodoDialog, setFinalizarPeriodoDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchUsuarios = async () => {
        await axios.get('http://localhost:3001/api/usuario')
            .then(response => {
                //console.log(response.data.usuarios)
                setUsuarios(response.data.usuarios)
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)
                setUsuarios([])
                //console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const fetchNiveles = async () => {
        await axios.get('http://localhost:3001/api/usuario/niveles')
            .then(response => {
                //console.log(response.data.usuarios)
                setNivelesUsuario(response.data.niveles)
            })
            .catch(error => {
                setNivelesUsuario([])
                //console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    useEffect(() => {
        fetchUsuarios();
        fetchNiveles();
    }, []);

    const openNew = () => {
        setUsuario(usuarioVacio);
        setSubmitted(false);
        setUsuarioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUsuarioDialog(false);
    };

    const hideDeletePeriodoDialog = () => {
        setDeletePeriodoDialog(false);
    };

    const hideFinalizarPeriodoDialog = () => {
        setFinalizarPeriodoDialog(false);
    };

    const crearUsuario = async () => {
        await axios.post('http://localhost:3001/api/usuario', usuario)
            .then(response => {
                fetchUsuarios()
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.log("Ha ocurrido un error", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.error,
                    life: 3000
                });
            })

        setUsuario(usuarioVacio)

    }

    const editarUsuario = async () => {
        await axios.put('http://localhost:3001/api/usuario', usuario)
            .then(response => {
                const _usuarios = usuarios.map(u => {
                    if (u.Persona.Codigo === usuario.Persona.Codigo) {
                        return usuario
                    } else {
                        return u
                    }
                });
                setUsuarios(_usuarios)
                //setUsuario(periodoVacio)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.log("Ha ocurrido un error", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ha ocurrido un error al actualizar el usuario',
                    life: 3000
                });
            })
        setEditar(false)
    }

    const savePeriodo = async () => {
        setSubmitted(true);
        if (editar) {
            await editarUsuario()
            setUsuarioDialog(false)
        } else {
            if (usuarioValido()) {
                await crearUsuario()
                setUsuarioDialog(false)
            }
        }

    };

    const usuarioValido = () => {
        let valido = true

        if (usuario.Email.length === 0) {
            valido = false
        }

        if (usuario.Persona.DNI.length < 8) {
            valido = false
        }

        if (usuario.Persona.Paterno.length === 0) {
            valido = false
        }

        if (usuario.Persona.Materno.length === 0) {
            valido = false
        }

        if (usuario.Persona.Nombres.length === 0) {
            valido = false
        }

        if (!usuario.NivelUsuario.Codigo) {
            valido = false
        }

        return valido
    }

    const editUsuario = (usuario: any) => {
        let _usuario = { ...usuario }
        setEditar(true)
        setUsuario(_usuario);
        setUsuarioDialog(true);
    };

    const confirmDeletePeriodo = (usuario: any) => {
        setUsuario(usuario);
        setDeletePeriodoDialog(true);
    };

    const confirmFinalizarPeriodo = (usuario: any) => {
        setUsuario(usuario);
        setFinalizarPeriodoDialog(true);
    };

    const deleteUsuario = async () => {
        await axios.delete('http://localhost:3001/api/usuario', {
            params: {
                codigoPersona: usuario.Persona.Codigo
            }
        })
            .then(response => {
                let _periodos = usuarios.filter(p => p.Persona.Codigo !== usuario.Persona.Codigo)
                console.log(_periodos)
                setUsuarios(_periodos)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'El usuario no se ha podido eliminar',
                    life: 3000
                });
            })

        setDeletePeriodoDialog(false);
        setUsuario(usuarioVacio);

    };

    const inhabilitarUsuario = async () => {
        setFinalizarPeriodoDialog(false);

        await axios.put('http://localhost:3001/api/usuario/inhabilitar', {}, {
            params: {
                codigo: usuario.Codigo,
            }
        })
            .then(response => {
                const _usuarios = usuarios.map(p => {
                    if (p.Codigo === usuario.Codigo) {
                        return {
                            ...usuario,
                            Estado: false
                        }
                    } else {
                        return p
                    }
                });
                setUsuarios(_usuarios)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'El usuario no se ha podido finalizar',
                    life: 3000
                });
            })
        setUsuario(usuarioVacio);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        switch (name) {
            case "DNI":
                _usuario.Persona.DNI = val
                break;
            case "Paterno":
                _usuario.Persona.Paterno = val
                break;
            case "Materno":
                _usuario.Persona.Materno = val
                break;
            case "Nombres":
                _usuario.Persona.Nombres = val
                break;
            case "Email":
                _usuario.Email = val
                break;
        }

        setUsuario(_usuario);
        //console.log(_usuario)
    };

    const onDropdownChange = (e: any) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        _usuario.NivelUsuario.Codigo = val;
        setUsuario(_usuario)
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo usuario" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} /> */}
                </div>
            </React.Fragment>
        );
    };


    const statusBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const personaBodyTemplate = (rowData: any) => {
        return `${rowData.Persona.Paterno} ${rowData.Persona.Materno} ${rowData.Persona.Nombres}`
    };


    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editUsuario(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" className='mr-2' onClick={() => confirmDeletePeriodo(rowData)} />
                <Button icon="pi pi-power-off" rounded severity="danger" onClick={() => confirmFinalizarPeriodo(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestionar usuarios</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={savePeriodo} />
        </>
    );

    const deletePeriodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeletePeriodoDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteUsuario} />
        </>
    );

    const finalizarPeriodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideFinalizarPeriodoDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={inhabilitarUsuario} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        loading={loading}
                        value={usuarios}
                        dataKey="Codigo"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron usuarios registrados"
                        header={header}
                    >
                        <Column field="Codigo" header="Código" headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="Estado" header="Estado" body={statusBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="Paterno" header="Persona" body={personaBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="Email" header="Email" headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field='Persona.DNI' header="DNI" headerStyle={{ minWidth: '10rem' }} />
                        <Column field='NivelUsuario.Nombre' header="Nivel Usuario" headerStyle={{ minWidth: '10rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
                    </DataTable>

                    <Dialog visible={usuarioDialog} style={{ width: '650px' }} header="Datos del usuario" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>

                        <div className='formgrid grid'>

                            <div className="field col">
                                <label htmlFor="paterno">Paterno</label>
                                <InputText id="paterno" value={usuario.Persona.Paterno} onChange={(e) => onInputChange(e, 'Paterno')} required
                                    className={classNames({ 'p-invalid': submitted && !usuario.Persona.Paterno })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="materno">Materno</label>
                                <InputText id="materno" value={usuario.Persona.Materno} onChange={(e) => onInputChange(e, 'Materno')} required
                                    className={classNames({ 'p-invalid': submitted && !usuario.Persona.Materno })} />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="nombres">Nombres</label>
                                <InputText id="nombres" value={usuario.Persona.Nombres} onChange={(e) => onInputChange(e, 'Nombres')} required
                                    className={classNames({ 'p-invalid': submitted && !usuario.Persona.Nombres })} />
                            </div>
                            <div className="field col">
                                <label htmlFor="email">Email</label>
                                <InputText id="email" value={usuario.Email} onChange={(e) => onInputChange(e, 'Email')} required
                                    className={classNames({ 'p-invalid': submitted && !usuario.Email })}
                                />
                            </div>
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="DNI">DNI</label>
                                <InputText id="DNI" maxLength={8} value={usuario.Persona.DNI} onChange={(e) => onInputChange(e, 'DNI')} required
                                    className={classNames({ 'p-invalid': submitted && !usuario.Persona.DNI })} />
                            </div>
                            <div className='field col'>
                                <label htmlFor="nivel">Nivel de usuario</label>
                                <Dropdown
                                    id="nivel"
                                    value={usuario.NivelUsuario.Codigo}
                                    onChange={(e) => {
                                        onDropdownChange(e);
                                    }}
                                    name="CodigoCarreraProfesional"
                                    options={nivelesUsuario}
                                    optionLabel="Nombre"
                                    optionValue="Codigo"
                                    placeholder="Seleccionar"
                                    className={classNames({ 'p-invalid': submitted && !usuario.NivelUsuario.Codigo })} >
                                </Dropdown>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deletePeriodoDialog} style={{ width: '450px' }} header="Eliminar usuario" modal footer={deletePeriodoDialogFooter} onHide={hideDeletePeriodoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && (
                                <span>
                                    ¿Seguro de que desea eliminar el usuario <b>{usuario.Email}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={finalizarPeriodoDialog} style={{ width: '450px' }} header="Inhabilitar el usuario" modal footer={finalizarPeriodoDialogFooter} onHide={hideFinalizarPeriodoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && (
                                <span>
                                    ¿Seguro de que desea inhabilitar el usuario <b>{usuario.Email}</b>?                                 
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};


