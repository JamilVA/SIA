/* eslint-disable @next/next/no-img-element */
'use client';
import { axiosInstance as axios } from '../../../../utils/axios.instance';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { useSearchParams } from 'next/navigation';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function CursoCalificacionPage() {

    const searchParamas = useSearchParams()

    const codigoCurso = searchParamas.get('codigo')

    let emptyHorario = {
        Codigo: null,
        Dia: '',
        HoraInicio: '08:00',
        HoraFin: '08:00',
        NombreAula: '',
        NumeroAula: null,
        CodigoCursoCalificacion: null
    }

    const [asignarHorarioDialog, setAsignarHorarioDialog] = useState(false)
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false)
    const [editar, setEditar] = useState(false)

    const [loading, setLoading] = useState(true)
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const [horario, setHorario] = useState(emptyHorario)

    const [horarios, setHorarios] = useState<Array<any>>([])

    const dias = [
        { Codigo: 1, Nombre: 'Lunes' },
        { Codigo: 2, Nombre: 'Martes' },
        { Codigo: 3, Nombre: 'Miercoles' },
        { Codigo: 4, Nombre: 'Jueves' },
        { Codigo: 5, Nombre: 'Viernes' },
        { Codigo: 6, Nombre: 'Sábado' }
    ]

    const fetchHorario = async () => {
        await axios.get('/horario/buscar', {
            params: {
                codigo: codigoCurso
            }
        })
            .then(response => {
                setHorarios(response.data.horarios)
            })
            .catch(error => {
                console.error(error.response)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la carga de datos',
                    detail: error.message,
                    life: 3000
                });
            })
        setLoading(false)
    }

    useEffect(() => {
        fetchHorario()
    }, []);

    const openAsignarDia = () => {
        setEditar(false)
        setSubmitted(false)
        setHorario(emptyHorario)
        setAsignarHorarioDialog(true)
    }

    const editDia = (rowData: any) => {
        setEditar(true)
        setSubmitted(false)
        setHorario(rowData)
        setAsignarHorarioDialog(true)
    }

    const hideConfirmDeleteDia = () => {
        setConfirmDeleteDialog(false)
    };

    const hideAsignarHorarioDialog = () => {
        setSubmitted(false)
        setAsignarHorarioDialog(false)
        setEditar(false)
    }

    const confirmDeleteDia = (rowData: any) => {
        setHorario({ ...rowData })
        setConfirmDeleteDialog(true)
    };


    const onDropDownChange = (value: any) => {    
        setHorario({
            ...horario,
            Dia: value,
        })
    }

    const onCalendarChange = (value: any, name: string) => {
        let hora = (value as Date)
        let _hora = hora.getHours() + ':' + hora.getMinutes()
        switch (name) {
            case 'inicio':              
                setHorario({
                    ...horario,
                    HoraInicio: _hora
                })
                break;
            case 'fin':             
                setHorario({
                    ...horario,
                    HoraFin: _hora
                })
                break;
        }
    }

    const onInputChange = (value: any, name: string) => {
        switch (name) {
            case 'aula':
                setHorario({
                    ...horario,
                    NombreAula: value
                })
                break;
            case 'numero':
                setHorario({
                    ...horario,
                    NumeroAula: value
                })
                break;
        }
    }

    const saveDia = async () => {
        if (!editar) {
            await asignarDia()
        } else {
            await editarDia()
        }
    }

    const asignarDia = async () => {
        setSubmitted(true)
        if (!horario.Dia) {
            return
        }
        hideAsignarHorarioDialog()
        await axios.post('/horario', {
            ...horario,
            CodigoCursoCalificacion: codigoCurso
        })
            .then(response => {
                let _horarios = [...horarios]
                _horarios.push(response.data.horario)
                setHorarios(_horarios)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operacion exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.response)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const editarDia = async () => {
        setSubmitted(true)
        hideAsignarHorarioDialog()
        await axios.put('/horario', {...horario}, {
            params: {
                codigo: horario.Codigo             
            }
        })
            .then(response => {
                let _horarios = horarios.map(h => {
                    if (h.Codigo === horario.Codigo) {
                        return {...horario}
                    }
                    return h
                })
                setHorarios(_horarios)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operacion exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.response)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const deleteDia = async () => {
        hideConfirmDeleteDia()
        await axios.delete('/horario', {
            params: {
                codigo: horario.Codigo
            }
        })
            .then(response => {
                let _horarios = horarios.filter(h => h.Codigo !== horario.Codigo)
                setHorarios(_horarios)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operacion exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const setHora = (hora: string) => {
        let strings = hora.split(':')
        let fecha = new Date()
        fecha.setHours(parseInt(strings[0], 10), parseInt(strings[1], 10))
        return fecha
    }

    const timeInicioBodyTemplate = (rowData: any) => {
        let str = rowData.HoraInicio
        let strings = str.split(':')
        let fecha = new Date()
        fecha.setHours(parseInt(strings[0], 10), parseInt(strings[1], 10))
        return formatDate(fecha)
    }

    const timeFinBodyTemplate = (rowData: any) => {
        let str = rowData.HoraFin
        let strings = str.split(':')
        let fecha = new Date()
        fecha.setHours(parseInt(strings[0], 10), parseInt(strings[1], 10))
        return formatDate(fecha)
    }

    const formatDate = (value: Date) => {
        return value.toLocaleString('es-PE', {           
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Asignar día" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openAsignarDia} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div>

            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" tooltip='Editar día' onClick={() => editDia(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" className='mr-2' onClick={() => confirmDeleteDia(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de horario</h5>
        </div>
    );

    const asignarHorarioDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideAsignarHorarioDialog} />
            <Button label="Asignar" icon="pi pi-check" text onClick={saveDia} />
        </>
    );

    const deleteDiaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideConfirmDeleteDia} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteDia} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={horarios}
                        loading={loading}
                        dataKey="Codigo"                  
                        rows={10}
                        className="datatable-responsive"
                        emptyMessage="Horario vacío"
                        header={header}
                    >
                        <Column field="Codigo" header="Código" headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="Dia" header="Día" headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="HoraInicio" header="Hora de Inicio" body={timeInicioBodyTemplate} align='center' headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="HoraFin" header="Hora de fin" body={timeFinBodyTemplate} align='center' headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="NombreAula" header="Aula" headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="NumeroAula" header="Número" align='center' headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
                    </DataTable>

                    <Dialog visible={asignarHorarioDialog} style={{ width: '600px' }} header="Asignar día" modal className="p-fluid" footer={asignarHorarioDialogFooter} onHide={hideAsignarHorarioDialog}>
                        <div className="grid">
                            <div className="col">
                                <div className="field">
                                    <label htmlFor="horario">Día</label>
                                    <Dropdown
                                        id="horario"
                                        value={horario.Dia}
                                        options={dias}
                                        optionLabel='Nombre'
                                        optionValue='Nombre'
                                        placeholder='Seleccione un día'
                                        onChange={(e) => onDropDownChange(e.value)}
                                        required
                                        autoFocus
                                        showClear
                                        className={classNames({
                                            'p-invalid': submitted && !horario.Dia
                                        })}
                                    />
                                    {submitted && !horario.Dia && <small className="p-invalid">Seleccione un día para asignarlo</small>}
                                </div>
                            </div>
                            <div className="col">
                                <div className="field">
                                    <label htmlFor="inicio">Hora de Inicio</label>
                                    <Calendar value={setHora(horario.HoraInicio)} onChange={(e) => onCalendarChange(e.value, 'inicio')} timeOnly hourFormat='12' />
                                </div>
                            </div>
                            <div className="col">
                                <div className="field">
                                    <label htmlFor="fin">Hora de Fin</label>
                                    <Calendar value={setHora(horario.HoraFin)} onChange={(e) => onCalendarChange(e.value, 'fin')} timeOnly hourFormat='12' />
                                </div>
                            </div>
                        </div>
                        <div className="grid align-items-center">
                            <div className="col">
                                <div className="field">
                                    <label htmlFor="aula">Aula</label>
                                    <InputText id="aula" value={horario.NombreAula} onChange={(e) => onInputChange(e.target.value, 'aula')} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="field">
                                    <label htmlFor="numero">Número de aula</label>
                                    <InputNumber id="numero" value={horario.NumeroAula} onValueChange={(e) => onInputChange(e.value, 'numero')} />
                                </div>
                            </div>
                        </div>

                    </Dialog>
                    <Dialog visible={confirmDeleteDialog} style={{ width: '350px' }} header="Confirm" modal footer={deleteDiaDialogFooter} onHide={hideConfirmDeleteDia}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {horario && (
                                <span>
                                    ¿Eliminar día <b>{horario.Dia}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

