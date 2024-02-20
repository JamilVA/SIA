'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Demo } from '../../../types/types';
import axios from 'axios'
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useSession } from "next-auth/react";
import Perfil from "../../templates/Perfil"

const Page = () => {

    const { data: session, status } = useSession();

    let emptyEstudiante: {
        Codigo: string,
        CodigoSunedu: string,
        CreditosLlevados: Number,
        CreditosAprobados: Number,
        Persona: {
            Paterno: string,
            Materno: string,
            Nombres: string,
            DNI: string,
            Email: string,
            Codigo: Number,
            Direccion: string,
            EmailPersonal: string,
            Celular: string,
        },
        CarreraProfesional: {
            Codigo: Number,
            NombreCarrera: string
        }
    } = {
        Codigo: '',
        CodigoSunedu: '',
        CreditosLlevados: 0,
        CreditosAprobados: 0,
        Persona: {
            Paterno: '',
            Materno: '',
            Nombres: '',
            DNI: '',
            Email: '',
            Codigo: 0,
            Direccion: '',
            EmailPersonal: '',
            Celular: '',
        },
        CarreraProfesional: {
            Codigo: 0,
            NombreCarrera: ''
        }
    };

    let paramsUpdate = {
        CodigoPersona: '',
        Codigo: '',
        Direccion: '',
        EmailPersonal: '',
        Celular: ''
    }

    const toast = useRef<Toast>(null);
    const [estudianteDialog, setEstudianteDialog] = useState(false);
    const [i, setI] = useState(0);
    const [estudiante, setEstudiante] = useState(emptyEstudiante);
    const [params, setParams] = useState(paramsUpdate);

    const fetchData = async () => {
        try {
            const result = await axios.get("http://localhost:3001/api/estudiante/getbycod", {
                params: {
                    CodigoPersona: session?.user.codigoPersona
                }
            });
            setEstudiante(result.data.estudiante);
            console.log(result.data.estudiante)
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    }

    if (status === "authenticated" && i == 0) {
        fetchData();
        setI(i + 1)
    }

    const onUpdate = async () => {
        var response = '';
        try {
            const result = await axios.put("http://127.0.0.1:3001/api/estudiante", params);
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
        setEstudianteDialog(false);
        setParams(paramsUpdate);
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _params = { ...params };
        if (name == 'Direccion') _params['Direccion'] = (val);
        if (name == 'EmailPersonal') _params['EmailPersonal'] = (val);
        if (name == 'Celular') _params['Celular'] = (val);
        setParams(_params)
    };

    const editEstudiante = (estudiante: any) => {
        let _direccion = estudiante.Persona.Direccion == null ? '' : estudiante.Persona.Direccion;
        let _email = estudiante.Persona.EmailPersonal == null ? '' : estudiante.Persona.EmailPersonal;
        let _celular = estudiante.Persona.Celular == null ? '' : estudiante.Persona.Celular;
        let temParams = {
            CodigoPersona: estudiante.Persona.Codigo,
            Codigo: estudiante.Codigo,
            Direccion: _direccion,
            EmailPersonal: _email,
            Celular: _celular
        }
        setParams(temParams);
        setEstudianteDialog(true);
    }

    const hideDialog = () => {
        setEstudianteDialog(false);
        setParams(paramsUpdate);
    };

    const estudianteDialogFooter = (
        <>
            <Button label="Cancelar" outlined icon="pi pi-times" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={onUpdate} />
        </>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <h5 className='m-1 mb-3'>PERFIL ESTUDIANTE</h5>
            </div>
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
            </div>
            <div className='col-12 md:col-9'>
                <div className='card'>
                    <h5>Mi información</h5>
                    <h6><i className='pi pi-id-card' style={{ marginRight: '3px', color: 'blue' }}></i>Documento de Identidad</h6>
                    <p>{estudiante.Persona.DNI}</p>
                    <h6><i className='pi pi-folder' style={{ marginRight: '3px', color: 'blue' }}></i>Carrera Profesional</h6>
                    <p>{(estudiante.CarreraProfesional.NombreCarrera).toUpperCase()}</p>
                    <h6><i className='pi pi-file' style={{ marginRight: '3px', color: 'blue' }}></i>Merito</h6>
                    <p>Puesto 10° <br />Promedio ponderado: 12.32 <br />Fecha de reporte: 29/01/2024 </p>
                </div>
                <div className='card'>
                    <h5>Otros datos <i className='pi pi-pencil' onClick={() => editEstudiante(estudiante)} style={{ color: 'orange', cursor: 'pointer', fontSize: '1.2rem' }}></i></h5>
                    <h6><i className='pi pi-home' style={{ marginRight: '3px', color: 'blue' }}></i>Dirección</h6>
                    <p>{estudiante.Persona.Direccion != null ? estudiante.Persona.Direccion : '...'}</p>
                    <h6><i className='pi pi-at' style={{ marginRight: '3px', color: 'blue' }}></i>Correo Personal</h6>
                    <p>{estudiante.Persona.EmailPersonal != null ? estudiante.Persona.EmailPersonal : '...'}</p>
                    <h6><i className='pi pi-phone' style={{ marginRight: '3px', color: 'blue' }}></i>Telef. Móvil</h6>
                    <p>{estudiante.Persona.Celular != null ? estudiante.Persona.Celular : '...'}</p>
                </div>
            </div>

            <Dialog visible={estudianteDialog} style={{ width: '300px' }} header="Datos del estudiante" modal className="p-fluid" footer={estudianteDialogFooter} onHide={hideDialog}>
                <div className='formgrid grid'>
                    <div className="field col-12">
                        <label htmlFor="direccion">Dirección</label>
                        <InputText style={{ width: '100%' }} autoFocus id="direccion" autoComplete='off' value={params.Direccion} onChange={(e) => onInputChange(e, 'Direccion')} />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="email">Email personal</label>
                        <InputText id="email" autoComplete='off' value={params.EmailPersonal} onChange={(e) => onInputChange(e, 'EmailPersonal')} />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="celular">Celular</label>
                        <InputText id="celular" autoComplete='off' maxLength={9} value={params.Celular} onChange={(e) => onInputChange(e, 'Celular')} />
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default Page;    