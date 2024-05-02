'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { Column } from 'primereact/column';
import Perfil from '../../../components/Perfil';
import { useSession } from 'next-auth/react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { redirect } from 'next/navigation';
import { Sia } from '../../../types/sia';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

export default function Page() {
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [actas, setActas] = useState(Object);
    const [actasF, setActasF] = useState(Object);
    const { data: session, status } = useSession();

    const [pdfHistorialURL, setPdfHistorialURL] = useState('');
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [estudiante, setEstudiante] = useState<any>();
    const [dni, setDni] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    const [carreras, setCarreras] = useState<Array<Sia.CarreraProfesional>>([]);
    const [carrera, setCarrera] = useState<Sia.CarreraProfesional>({
        Codigo: 0,
        NombreCarrera: '',
        Siglas: '',
        RutaPlanEstudios: '',
        CodigoJefeDepatamento: 0
    });

    const [codigoCurso, setCodigoCurso] = useState('');
    const [notaFinal, setNotaFinal] = useState<number>(0);

    const fetchHistorial = async () => {
        setLoading(true);
        await axios
            .get('/estudiante/buscar-historial-dni', {
                params: {
                    dni: dni
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                setEstudiante(response.data.estudiante);
                setActas(response.data.historial);
                const _carreras = response.data.carreras;
                setCarreras(_carreras);
                setActasF(response.data.historial);
                setCarrera({ ...carrera, Siglas: response.data?.estudiante?.CodigoSunedu.substring(0, 2) });
                let _historial = response.data?.historial?.filter((acta: any) => acta.Codigo.substring(0, 2) === response.data?.estudiante?.CodigoSunedu.substring(0, 2));
                setActasF(_historial);

                let carreraX = response.data.carreras.find((carrera: any) => carrera.Siglas === response.data?.estudiante?.CodigoSunedu.substring(0, 2));

                let _carrera = { ...carrera, NombreCarrera: carreraX?.NombreCarrera ?? '', Siglas: carreraX?.Siglas ?? '' };
                setCarrera(_carrera);

                //console.log(response.data);
            })
            .catch((error) => {
                // console.log("Error en carga de datos: ", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: !error.response ? error.message : error.response.error,
                    life: 3000
                });
            });
        setLoading(false);
    };

    const obtenerPDFHistorial = async () => {
        setVisible(true);
        await axios
            .get('/pdf/historial-notas', {
                params: { codigoEstudiante: estudiante?.Codigo, carrera },
                responseType: 'blob'
            })
            .then((response) => {
                // console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                // console.log(url);
                setPdfHistorialURL(url);

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
    };

    const insertarNota = async () => {
        //setLoading(true)
        await axios
            .post(
                '/estudiante/insertar-nota',
                {
                    codigoCurso: codigoCurso,
                    dni: dni,
                    nota: notaFinal
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                }
            )
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Mensaje',
                    detail: response.data.message,
                    life: 3000
                });
                fetchHistorial();
            })
            .catch((error) => {
                // console.log("Error en carga de datos: ", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: !error.response ? error.message : error.response.error,
                    life: 3000
                });
            });
        //setLoading(false)
    };

    const onCarreraSelect = (e: any) => {
        const val = (e.target && e.target.value) || '';
        let carreraX = carreras.find((carrera) => carrera.Siglas === val);

        let _carrera = { ...carrera, NombreCarrera: carreraX?.NombreCarrera ?? '', Siglas: carreraX?.Siglas ?? '' };
        setCarrera(_carrera);
        console.log(_carrera);
        let _historial = actas.filter((acta: any) => acta.Codigo.substring(0, 2) === val);
        setActasF(_historial);
    };

    const actionNFTemplate = (rowData: any) => {
        return <p style={Number(rowData.Nota) >= 11 ? { color: 'blue' } : { color: 'red' }}> {rowData.Nota} </p>;
    };

    const dateBodyTemplate = (rowData: any) => {
        const fecha = rowData.Fecha;
        return !fecha || fecha === 'undefined' ? '' : formatDate(new Date(fecha));
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button className="px-2 py-1 border-none mb-2" size="small" label="Vista PDF" icon="pi pi-file-pdf" onClick={() => obtenerPDFHistorial()} disabled={estudiante == null} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
                </span>
            </div>
        );
    };

    const header = renderHeader();

    const formatDate = (value: Date) => {
        return value.toLocaleDateString();
    };

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
        redirect('/');
    } else if (session?.user.nivelUsuario != 1) {
        redirect('/pages/notfound');
    }

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className="m-3 mt-4">HISTORIAL DE NOTAS</h5>
            </div>
            <div className="col-12 md:col-3">
                <div className="card shadow-1">
                    <div className="flex flex-row w-full">
                        <InputText
                            value={dni}
                            type="search"
                            size={15}
                            onKeyDown={(e) => {
                                e.key === 'Enter' ? fetchHistorial() : {};
                            }}
                            maxLength={8}
                            onChange={(e) => setDni(e.currentTarget.value)}
                            placeholder="Ingrese el DNI"
                        />
                        <Button
                            icon="pi pi-search"
                            loading={loading}
                            className="ml-2"
                            onClick={() => {
                                fetchHistorial();
                            }}
                        />
                    </div>
                    <div className="mt-5">
                        <p>
                            <strong>PATERNO: </strong>
                            {estudiante?.Persona?.Paterno}
                        </p>
                        <p>
                            <strong>MATERNO: </strong>
                            {estudiante?.Persona?.Materno}
                        </p>
                        <p>
                            <strong>NOMBRES: </strong>
                            {estudiante?.Persona?.Nombres}
                        </p>
                        <h6 className="mt-0 text-center" style={{ color: 'var(--surface-500)' }}>
                            {estudiante?.CarreraProfesional.NombreCarrera.toLocaleUpperCase()}
                        </h6>
                    </div>
                </div>

                {carreras?.length > 1 && (
                    <div className="card shadow-1">
                        <Dropdown value={carrera.Siglas} onChange={(e) => onCarreraSelect(e)} name="CodigoCarreraProfesional" options={carreras} optionLabel="NombreCarrera" optionValue="Siglas" placeholder="Carrera"></Dropdown>
                    </div>
                )}
            </div>
            <div className="col-12 md:col-9">
                <Toast ref={toast} />
                <div className="card">
                    <div className="flex flex-row mb-4">
                        <InputText value={codigoCurso} className="mr-2" maxLength={6} onChange={(e) => setCodigoCurso(e.currentTarget.value)} placeholder="Codigo de curso" />
                        <InputNumber value={notaFinal} maxLength={2} onValueChange={(e) => setNotaFinal(e.value as number)} placeholder="Nota" />
                        <Button
                            label="Insertar"
                            severity="success"
                            className="ml-2"
                            onClick={() => {
                                insertarNota();
                            }}
                        />
                    </div>
                    <DataTable ref={dt} value={actasF} key="Acta" className="datatable-responsive" header={header} emptyMessage="Historial vacío" globalFilter={globalFilter} loading={loading}>
                        <Column field="Codigo" header="Codigo" />
                        <Column field="Curso" header="Nombre" />
                        <Column field="Nota" header="Nota" body={actionNFTemplate} />
                        <Column field="Ciclo" header="Ciclo" />
                        <Column field="Creditos" header="Creditos" />
                        <Column field="Acta" header="Acta" />
                        <Column field="Fecha" header="Fecha" body={dateBodyTemplate} />
                    </DataTable>
                </div>
                <Dialog header="Vista PDF de historial de notas" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                    <iframe src={pdfHistorialURL} width="100%" height="99%"></iframe>
                    {/* <embed src={pdfMatriculadosURL} type="application/pdf" width="100%" height="99%"/> */}
                </Dialog>
            </div>
        </div>
    );
}
