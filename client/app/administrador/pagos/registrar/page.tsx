/* eslint-disable @next/next/no-img-element */
'use client';
import { axiosInstance as axios } from '../../../../utils/axios.instance';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function RegistroPagoPage() {
    const estudianteVacio = {
        Codigo: 0,
        Paterno: '',
        Materno: '',
        Nombres: '',
        RutaFoto: '',
        FechaNacimiento: '',
        Sexo: '',
        DNI: '',
        Email: ''
    };
    const pagoVacio = {
        Codigo: 0,
        NroTransaccion: '',
        Fecha: '',
        EstadoPago: '',
        Observacion: '',
        CodigoEstudiante: 0,
        CodigoConceptoPago: 0,
    }
    const [conceptos, setConceptos] = useState<Array<any>>([])
    const [pago, setPago] = useState(pagoVacio);
    const [estudiante, setEstudiante] = useState(estudianteVacio);
    const [inputValue, setInputSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const { data: session, status } = useSession();

    const fetchConceptos = async () => {
        await axios.get('/pago/conceptos', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                setConceptos(response.data.conceptos)
            })
            .catch(error => {
                // console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Carga fallida',
                    detail: 'Ha ocurrido un error al cargar los conceptos de pago',
                    life: 3000
                });
            });
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchConceptos();
        }
    }, [status]);

    const buscarEstudiante = async (dni: string) => {
        setLoading(true)
        await axios.get('/estudiante/buscar', {
            params: {
                dni: dni
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                let value = response.data.estudiante
                //// console.log("Estudiante:", response.data.estudiante)
                if (value !== null) {
                    let _estudiante = {
                        ...estudiante,
                        Codigo: value.Codigo,
                        Paterno: value.Persona.Paterno,
                        Materno: value.Persona.Materno,
                        Nombres: value.Persona.Nombres,
                    }
                    setEstudiante(_estudiante)
                    setPago({ ...pago, CodigoEstudiante: value.Codigo })
                } else {
                    setEstudiante(estudianteVacio)
                    toast.current?.show({
                        severity: 'info',
                        summary: 'No encontrado',
                        detail: 'No se ha encontrado ningún estudiante para DNI: ' + inputValue,
                        life: 3000
                    });
                }
            })
            .catch(error => {
                // console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'Ha ocurrido un error al buscar el estudiante',
                    life: 3000
                });
            })
        setLoading(false)
    }

    const guardarPago = async () => {
        if (pago.CodigoEstudiante === 0) {
            return toast.current?.show({
                severity: 'warn',
                summary: 'Operación no válida',
                detail: 'Debe seleccionar un estudiante para registrar el pago',
                life: 3000
            });
        }
        if (pago.CodigoConceptoPago === 0) {
            return toast.current?.show({
                severity: 'warn',
                summary: 'Operación no válida',
                detail: 'Debe seleccionar un concepto de pago para registrar el pago',
                life: 3000
            });
        }
        if (pago.NroTransaccion.length === 0) {
            return toast.current?.show({
                severity: 'warn',
                summary: 'Operación no válida',
                detail: 'Debe ingresar el número de transacción para registrar el pago',
                life: 3000
            });
        }

        await axios.post('/pago', pago, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                setInputSearch('');
                setPago(pagoVacio)
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
                    detail: error.response.data.error,
                    life: 3000
                });
            });
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _pago = { ...pago }

        switch (name) {
            case 'transaccion':
                _pago = { ...pago, NroTransaccion: val };
                break;
            case 'obs':
                _pago = { ...pago, Observacion: val };
                break;
        }

        setPago(_pago)
    };

    const onDropDownChange = (value: any, name: string) => {
        let _pago = { ...pago, CodigoConceptoPago: value }
        setPago(_pago)
    }

    const selectedItemTemplate = (option: any, props: any) => {
        if (option) {
            return <div className="flex justify-content-between">
                <div>{option.Codigo} {option.Denominacion}</div>
                <div>S/. {option.Monto}</div>
            </div>
        }

        return <span>{props.placeholder}</span>;
    };

    const itemOptionTemplate = (option: any) => {
        return (
            <div className="flex justify-content-between">
                <div>{option.Codigo} {option.Denominacion}</div>
                <div>S/. {option.Monto}</div>
            </div>
        );
    };

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

    if (!session) {
        redirect('/')
    } else if (session?.user.nivelUsuario != 1) {
        redirect('/pages/notfound')
    }

    return (
        <div className="card">
            <Toast ref={toast} />
            <h4>REGISTRAR NUEVO PAGO</h4>
            <hr />
            <div className='grid'>
                <div className="col-12 md:col-6 px-5">
                    <h5 className="m-0">Consulta de estudiante</h5>
                    <br />
                    <span className="block mt-2 md:mt-0 p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={inputValue}
                            autoFocus
                            type="search"
                            placeholder="Ingrese DNI"
                            onChange={(e) => { setInputSearch(e.target.value) }}
                            maxLength={8}

                        />
                        <Button loading={loading} className='ml-2' label='Buscar' onClick={() => { buscarEstudiante(inputValue) }} />
                    </span>
                    <h5 className="mb-3">Datos del estudiante</h5>
                    <div className="flex flex-column gap-2 mb-2">
                        <label htmlFor="">Apellido paterno:</label>
                        <InputText value={estudiante.Paterno} disabled />
                    </div>
                    <div className="flex flex-column gap-2 mb-2">
                        <label htmlFor="">Apellido materno:</label>
                        <InputText value={estudiante.Materno} disabled />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="">Nombres: </label>
                        <InputText value={estudiante.Nombres} disabled />
                    </div>
                </div>
                <div className="col-12 md:col-6 px-5">
                    <h5>Datos del pago</h5>
                    <div className='flex flex-column gap-2'>
                        <label htmlFor="">Concepto de pago:</label>
                        <Dropdown
                            value={pago.CodigoConceptoPago === 0 ? null : pago.CodigoConceptoPago}
                            options={conceptos}
                            optionLabel='Denominacion'
                            optionValue='Codigo'
                            filter
                            filterBy='Codigo,Denominacion'
                            valueTemplate={selectedItemTemplate}
                            itemTemplate={itemOptionTemplate}
                            onChange={(e) => { onDropDownChange(e.value, 'concepto') }}
                            placeholder="Seleccione el concepto de pago"
                            className="w-full md:w-23rem"
                            showClear />
                    </div>
                    <br />
                    <div className="flex flex-column gap-2">
                        <label htmlFor="">Nro. Transacción: </label>
                        <InputText value={pago.NroTransaccion} onChange={(e) => onInputChange(e, 'transaccion')} maxLength={15} />
                    </div>
                    <br />
                    <div className="flex flex-column gap-2">
                        <label htmlFor="">Observación</label>
                        <InputText value={pago.Observacion} onChange={(e) => onInputChange(e, 'obs')} maxLength={100} />
                    </div>
                    <br />
                    <Button label="Regresar" icon="pi pi-arrow-left" text className='mr-3' onClick={() => { router.back() }} />
                    <Button label="Registrar" icon="pi pi-check" severity='success' onClick={guardarPago} />
                </div>
            </div>
        </div>

    );
};
