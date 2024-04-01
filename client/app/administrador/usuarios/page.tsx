/* eslint-disable @next/next/no-img-element */
'use client';
import { redirect } from 'next/navigation';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';

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

    const usuarioVacioGen = {
        Codigo: 0,
        Email: '',
        Persona: {
            Paterno: '',
            Materno: '',
            Nombres: '',
            DNI: ''
        }
    }

    type Data = {
        email: string | undefined;
        newPassword: string;
        repeatNewPassword: string;
        [key: string]: string | undefined;
    }

    const data = {
        email: '',
        newPassword: '',
        repeatNewPassword: ''
    }

    const [usuarios, setUsuarios] = useState([usuarioVacio]);
    const [usuariosGen, setUsuariosGen] = useState([usuarioVacioGen]);
    const [usuario, setUsuario] = useState(usuarioVacio);
    const [usuarioGen, setUsuarioGen] = useState(usuarioVacioGen);
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
    const [dataChang, setDataChang] = useState<Data>(data);
    const [visible, setVisible] = useState(false);
    let res = '';
    const { data: session, status } = useSession();

    const fetchUsuarios = async () => {
        await axios.get('/usuario', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                //// console.log(response.data.usuarios)
                setUsuarios(response.data.usuarios)
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)
                setUsuarios([])
                //// console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const fetchUsuariosGen = async () => {
        await axios.get('/usuario/all', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        }).then(response => {
            setUsuariosGen(response.data.usuarios);
            // console.log(response.data.usuarios)
        }).catch(error => {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message,
                life: 3000
            });
        })
    }

    const fetchNiveles = async () => {
        await axios.get('/usuario/niveles', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                //// console.log(response.data.usuarios)
                setNivelesUsuario(response.data.niveles)
            })
            .catch(error => {
                setNivelesUsuario([])
                //// console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUsuarios();
            fetchUsuariosGen();
            fetchNiveles();
        }
    }, [status]);

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
        await axios.post('/usuario', usuario, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
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
                // console.log("Ha ocurrido un error", error)
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
        await axios.put('/usuario', usuario, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
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
                fetchUsuarios();
            })
            .catch(error => {
                // console.log("Ha ocurrido un error", error)
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

    const changPassUsuario = (usuarioGen: any) => {
        let _usuario = { ...usuarioGen }
        setUsuarioGen(_usuario);
        dataChang['email'] = usuarioGen.Email;
        setVisible(true);
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
        await axios.delete('/usuario', {
            params: {
                codigoPersona: usuario.Persona.Codigo
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                let _periodos = usuarios.filter(p => p.Persona.Codigo !== usuario.Persona.Codigo)
                // console.log(_periodos)
                setUsuarios(_periodos)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                // console.log(error)
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

        await axios.put('/usuario/inhabilitar', {}, {
            params: {
                codigo: usuario.Codigo,
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.log(error)
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
        //// console.log(_usuario)
    };

    const onInputPassChange = (val: string, name: string) => {
        let _data = { ...dataChang };
        _data[`${name}`] = val;

        setDataChang(_data);
    };

    const onDropdownChange = (e: any) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        _usuario.NivelUsuario.Codigo = val;
        setUsuario(_usuario)
    };

    const verifyGeneralInputs = () => {
        if (dataChang.email != '' && dataChang.newPassword != '' && dataChang.repeatNewPassword != '') {
            return true
        }
        return false
    }

    const verifyInputs = () => {
        if (dataChang.newPassword.length < 8) {
            res = 'Su nueva contraseña debe contener al menos 8 caracteres';
            return false;
        } else if (dataChang.newPassword != dataChang.repeatNewPassword) {
            res = 'Las nuevas contraseñas no coinciden';
            return false;
        }
        return true;
    }

    const changePassword = async () => {
        setSubmitted(true);
        if (verifyGeneralInputs()) {
            if (verifyInputs()) {
                await axios.put("/auth/changePasswordAdmin", dataChang, {
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                }).then(response => {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Proceso exitoso',
                        detail: response.data.message,
                        life: 3000
                    });
                    setDataChang(data);
                    setSubmitted(false);
                    setVisible(false);
                    setUsuarioGen(usuarioVacioGen);
                }).catch(error => {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo cambiar la contraseña',
                        life: 3000
                    });
                });
            }
        }
    }


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

    const actionPasswordTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-key" rounded severity="info" className="mr-2" onClick={() => changPassUsuario(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestionar usuarios</h5>
        </div>
    );

    const headerAll = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestionar contraseñas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={savePeriodo} />
        </>
    );

    const deletePeriodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeletePeriodoDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteUsuario} />
        </>
    );

    const finalizarPeriodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideFinalizarPeriodoDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={inhabilitarUsuario} />
        </>
    );

    const DialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => (setVisible(false), setSubmitted(false), setDataChang(data))} />
            <Button label="Guardar" icon="pi pi-check" onClick={changePassword} />
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
                <Toast ref={toast} />
                <div className="card">
                    <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        loading={loading}
                        value={usuarios}
                        dataKey="Codigo"
                        className="datatable-responsive"
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
                                    value={usuario.NivelUsuario?.Codigo}
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
                <div className='card'>
                    <DataTable
                        ref={dt}
                        value={usuariosGen}
                        dataKey="Codigo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} usuarios"
                        globalFilter={globalFilter}
                        emptyMessage="Sin usuarios registrados"
                        header={headerAll}
                    >
                        <Column field="Persona.DNI" header="DNI" sortable />
                        <Column field="Persona.Paterno" header="Paterno" sortable />
                        <Column field="Persona.Materno" header="Materno" sortable />
                        <Column field="Persona.Nombres" header="Nombres" sortable />
                        <Column field="Email" header="Email" sortable />
                        <Column body={actionPasswordTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={visible} style={{ width: '300px' }} header="Cambiar contraseña" modal footer={DialogFooter} onHide={() => setVisible(false)}>
                        <div className="flex align-items-center justify-content-center">
                            {(
                                <div className='formgrid grid'>
                                    <div className="field row">
                                        <label htmlFor="newPassword"> <b>Nueva contraseña:</b> </label>
                                        <Password toggleMask feedback={false} style={{ width: '100%' }} id='newPassword' inputClassName="w-full md:w-rem"
                                            onChange={(e) => onInputPassChange(e.target.value, 'newPassword')} required
                                            className={classNames({ 'p-invalid': submitted && !dataChang.newPassword })} />
                                    </div>
                                    <div className="field row">
                                        <label htmlFor="repeatPassword"> <b>Repita la nueva contraseña:</b> </label>
                                        <Password toggleMask feedback={false} style={{ width: '100%' }} id="repeatPassword" inputClassName="w-full md:w-rem"
                                            onChange={(e) => onInputPassChange(e.target.value, 'repeatNewPassword')} required
                                            className={classNames({ 'p-invalid': submitted && !dataChang.repeatNewPassword })} />
                                    </div>
                                    {
                                        (submitted && !verifyInputs()) ?
                                            <div className='row' style={{ border: '1px solid red', borderRadius: '5px', padding: '8px', backgroundColor: '#F2B5B5' }}>
                                                <small className="p-error">{res}</small>
                                            </div> : <></>
                                    }
                                </div>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};


