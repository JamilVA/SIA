/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import Router from 'next/router';
import { useRouter } from 'next/navigation';
import Ticket from '../../../templates/Ticket';
import printJS from 'print-js';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function RegistroPagoPage() {
    const estudianteVacio = {
        Codigo: '',
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
        NumeroComprobante: '',
        Fecha: '',
        EstadoPago: '',
        Estudiante: { CodigoSunedu: '' },
        ConceptoPago: { Denominacion: '', Monto: 0 },
    }
    const [conceptos, setConceptos] = useState([{
        Codigo: 0,
        Denominacion: '',
        Monto: 0
    }])
    const [pago, setPago] = useState(pagoVacio);
    const [estudiante, setEstudiante] = useState(estudianteVacio);
    const [inputValue, setInputValue] = useState('')
    const [conceptoSeleccionado, setConceptoSeleccionado] = useState(null);
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const fetchConceptos = async () => {
        await axios.get('http://localhost:3001/api/pago/conceptos')
            .then(response => {
                console.log(response.data)
                setConceptos(response.data.conceptos)
            })
            .catch(error => {
                console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Carga fallida',
                    detail: 'Ha ocurrido un error al cargar los conceptos de pago',
                    life: 3000
                });
            });
    }

    useEffect(() => {
        fetchConceptos()
    }, [])

    const actualizarConcepto = (codigo: number) => {
        conceptos.forEach(concepto => {
            if (concepto.Codigo === codigo) {
                setConcepto(concepto.Denominacion)
                setMonto(concepto.Monto)
            }
        });
    }

    const buscarEstudiante = async (dni: string) => {
        setSubmitted(false)
        await axios.get('http://localhost:3001/api/estudiante/buscar', {
            params: {
                dni: dni
            }
        })
            .then(response => {
                let value = response.data.estudiante             
                //console.log("Estudiante:", response.data.estudiante)
                if (value !== null) {
                    let _estudiante = {
                        Codigo: value.Codigo,
                        Paterno: value.Persona.Paterno,
                        Materno: value.Persona.Materno,
                        Nombres: value.Persona.Nombres,
                        RutaFoto: '',
                        FechaNacimiento: '',
                        Sexo: '',
                        DNI: '',
                        Email: ''
                    }
                    setEstudiante(_estudiante)
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
                console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'Ha ocurrido un error al buscar el estudiante',
                    life: 3000
                });
            })
    }

    const guardarPago = async () => {
        if (submitted) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Operación incompleta',
                detail: 'El pago ya ha sido registrado, recargue la página para registrar un nuevo pago',
                life: 3000
            });
            return
        }
        if (estudiante.Codigo === '') {
            toast.current?.show({
                severity: 'warn',
                summary: 'Operación no válida',
                detail: 'Debe seleccionar un estudiante para registrar el pago',
                life: 3000
            });
            return
        }
        if (!conceptoSeleccionado) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Operación no válida',
                detail: 'Debe seleccionar un concepto de pago para registrar el pago',
                life: 3000
            });
            return
        }

        await axios.post('http://localhost:3001/api/pago', {
            CodigoEstudiante: estudiante.Codigo,
            CodigoConceptoPago: conceptoSeleccionado,
        })
            .then(response => {
                console.log("Pago registrado existosamente", response)
                setInputValue('');
                setSubmitted(true);
                setPago(response.data.pago)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: 'Pago registrado',
                    life: 3000
                });
            })
            .catch(error => {
                console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'El pago no ha sido registrado',
                    life: 3000
                });
            });
    }

    const handlePrint = () => {
        if (submitted) {
            printJS({
                printable: 'p',
                type: 'html',
                showModal: true
            })
        } else {
            toast.current?.show({
                severity: 'warn',
                summary: 'Operación no válida',
                detail: 'Debe registrar el pago antes de imprimir',
                life: 3000
            });
        }
    }


    return (

        <div className="col-12">
            <Toast ref={toast} />
            <h2>Registrar nuevo pago</h2>
            <hr />
            <div className='grid'>
                <div className="col-12 md:col-6">
                    <h5 className="m-0">Consulta de estudiante</h5>
                    <br />
                    <span className="block mt-2 md:mt-0 p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={inputValue}
                            autoFocus
                            type="search"
                            placeholder="Ingrese DNI"
                            onChange={(e) => { setInputValue(e.target.value) }}
                        />
                        <Button className='ml-2' label='Buscar' onClick={() => { buscarEstudiante(inputValue) }} />
                    </span>
                    <hr />
                    <h5 className="mb-3">Datos del estudiante</h5>
                    <div className="grid">
                        <div className="col">
                            <label htmlFor="">Apellido paterno:</label>
                            <InputText value={estudiante.Paterno} disabled className='ml-5' />
                        </div>
                    </div>
                    <div className="grid">
                        <div className="col">
                            <label htmlFor="">Apellido materno:</label>
                            <InputText value={estudiante.Materno} disabled className='ml-5' />
                        </div>
                    </div>
                    <div className="grid">
                        <div className="col">
                            <label htmlFor="">Nombres: </label>
                            <InputText value={estudiante.Nombres} disabled className='ml-5' />
                        </div>
                    </div>
                    <Dropdown
                        value={conceptoSeleccionado}
                        options={conceptos}
                        optionLabel='Denominacion'
                        optionValue='Codigo'
                        onChange={(e) => { setConceptoSeleccionado(e.value); actualizarConcepto(e.value) }}
                        placeholder="Seleccione el concepto de pago"
                        className="p-column-filter"
                        showClear />
                    <br /><br />
                    <Button label="Regresar" icon="pi pi-arrow-left" text className='mr-3' onClick={() => { router.back() }} />
                    <Button label="Save" icon="pi pi-check" severity='success' onClick={guardarPago} />

                </div>
                <div className="col-12 md:col-6">
                    <Ticket
                        estudiante={estudiante.Paterno + ' ' + estudiante.Materno + ', ' + estudiante.Nombres}
                        dni={estudiante.DNI}
                        numero={pago.NumeroComprobante}
                        concepto={concepto}
                        monto={monto}
                        fecha={new Date(pago.Fecha).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    />
                    <Button className='ml-5' label="Imprimir ticket" icon="pi pi-print" text onClick={handlePrint} />
                </div>
            </div>
        </div>

    );
};
