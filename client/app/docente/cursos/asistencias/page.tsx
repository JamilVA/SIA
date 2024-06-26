/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { use, useEffect, useRef, useState } from 'react';
import { axiosInstance as axios } from '../../../../utils/axios.instance';
import { classNames } from 'primereact/utils';
import { ProgressBar } from 'primereact/progressbar';
import { Checkbox } from 'primereact/checkbox';
import { redirect, useSearchParams } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSession } from 'next-auth/react';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function AsistenciasPage() {
    const searchParams = useSearchParams();
    const codigoSesion = searchParams.get('codigo');
    const codigoCursoCalificacion = codigoSesion?.slice(-9);

    const [estudiantes, setEstudiantes] = useState<Array<any>>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [visible, setVisible] = useState(false);
    const [pdfAsistenciaURL, setPdfAsistenciaURL] = useState('');
    const { data: session, status } = useSession();

    const [sesion, setSesion] = useState({
        Codigo: 0,
        EntradaDocente: '',
        SalidaDocente: ''
    });

    const fetchMatriculados = async () => {
        await axios
            .get('/curso-calificacion/asistentes', {
                params: {
                    codigoCursoCalificacion: codigoCursoCalificacion,
                    codigoSesion: codigoSesion
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                setEstudiantes(response.data.matriculados);
                setSesion(response.data.sesion);
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'La lista de estudiantes matriculados no se ha podido cargar',
                    life: 3000
                });
            });
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchMatriculados();
        }
    }, [status]);

    const marcarAsistencia = async (rowData: any) => {
        const codEstudiante = rowData.Codigo;
        await axios
            .post(
                '/asistencia/marcar',
                {
                    codigoSesion: codigoSesion,
                    codigoEstudiante: codEstudiante,
                    codigoCurso: codigoCursoCalificacion
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                }
            )
            .then((response) => {
                fetchMatriculados();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch((error) => {
                // console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al marcar la asistencia',
                    life: 3000
                });
            });
    };

    const desmarcarAsistencia = async (rowData: any) => {
        const codEstudiante = rowData.Codigo;
        await axios
            .delete('/asistencia/desmarcar', {
                params: {
                    codigoSesion: codigoSesion,
                    codigoEstudiante: codEstudiante,
                    codigoCurso: codigoCursoCalificacion
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                fetchMatriculados();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al desmarcar la asistencia',
                    life: 3000
                });
            });
    };

    const marcarIngreso = async () => {
        await axios
            .post(
                '/sesion/marcar-ingreso',
                {},
                {
                    params: {
                        codigoSesion: codigoSesion
                    },
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                }
            )
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: error.response.data.message,
                    life: 3000
                });
            });
        await fetchMatriculados();
    };

    const marcarSalida = async () => {
        await axios
            .post(
                '/sesion/marcar-salida',
                {},
                {
                    params: {
                        codigoSesion: codigoSesion
                    },
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                }
            )
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: error.response.data.message,
                    life: 3000
                });
            });
        await fetchMatriculados();
    };

    const obtenerPDFAsistencias = async () => {
        await axios
            .get('/pdf/lista-asistencia', {
                params: { codigoCurso: codigoCursoCalificacion, codigoSesion: codigoSesion },
                responseType: 'blob'
            })
            .then((response) => {
                // console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                setPdfAsistenciaURL(url);
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
    };

    const marcarTodo = async () => {
        const asistencias = estudiantes.map((estudiante) => ({
            CodigoSesion: codigoSesion,
            CodigoEstudiante: estudiante.Codigo
        }));

        await axios
            .post(
                '/asistencia/marcar-todo',
                {
                    asistencias: asistencias,
                    codigoCursoCalificacion: codigoCursoCalificacion
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + session?.user.token
                    }
                }
            )
            .then((response) => {
                fetchMatriculados();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch((error) => {
                // console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: !error.response ? error.message : error.response.data.message,
                    life: 3000
                });
            });
    };

    function formatTime(fecha: string) {
        const [hours, minutes, seconds] = fecha.split(':');

        let formattedHours = parseInt(hours, 10);
        const ampm = formattedHours >= 12 ? 'pm' : 'am';
        formattedHours %= 12;
        formattedHours = formattedHours ? formattedHours : 12;

        const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

        return formattedTime;
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {sesion.EntradaDocente && <InputText className="mr-2" size={14} value={'Ingreso:  ' + formatTime(sesion.EntradaDocente)} disabled />}
                    {!sesion.EntradaDocente && <Button label="Marcar mi ingreso" size="small" icon="pi pi-clock" onClick={marcarIngreso} severity="success" className=" mr-2" />}
                    {sesion.SalidaDocente && <InputText className="mr-2" size={14} value={'Salida:  ' + formatTime(sesion.SalidaDocente)} disabled />}
                    {!sesion.SalidaDocente && <Button label="Marcar mi salida" size="small" icon="pi pi-clock" onClick={marcarSalida} severity="warning" className=" mr-2" />}
                </div>
            </React.Fragment>
        );
    };

    const asistenciasBodyTemplate = (rowData: any) => {
        return (
            <>
                <ProgressBar value={rowData.Asistencias}></ProgressBar>
            </>
        );
    };

    const habilitadoBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Habilitado, 'text-red-500 pi-times-circle': !rowData.Habilitado })}></i>;
    };

    const asistenciaBodyTemplate = (rowData: any) => {
        return <Checkbox checked={rowData.Asistencia}></Checkbox>;
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-check" label="Marcar" size="small" severity="success" className="mr-2 px-2 py-1" onClick={() => marcarAsistencia(rowData)} />
                <Button icon="pi pi-times" label="Desmarcar" size="small" severity="warning" className="mr-2 px-2 py-1" onClick={() => desmarcarAsistencia(rowData)} />
            </>
        );
    };

    const headerActionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-check" label="Marcar todo" size="small" severity="success" className="mr-2 px-2 py-1" onClick={() => marcarTodo()} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div>
                <h5 className="m-0 mb-2">Registro de asistencias</h5>
                <Button className="px-2 py-1 border-none" size="small" label="Vista PDF" icon="pi pi-file-pdf" onClick={() => obtenerPDFAsistencias()} />
            </div>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const footer = `${estudiantes ? estudiantes.length : 0} estudiantes matriculados`;

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
    } else if (session?.user.codigoDocente == 0) {
        redirect('/pages/notfound');
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={estudiantes}
                        dataKey="Estudiante.Codigo"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage="No se han encontrado estudiantes"
                        header={header}
                        footer={footer}
                        sortField="Estudiante.Persona.Paterno"
                        sortOrder={1}
                    >
                        <Column field="Numero" header="#" headerStyle={{ minWidth: '3rem' }}></Column>
                        <Column field="Estudiante" header="Estudiante" headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="Asistencias" header="Asistencias" body={asistenciasBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
                        <Column field="Habilitado" align="center" header="Habilitado" body={habilitadoBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="Estado" align="center" header="Asistencia" body={asistenciaBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column align="center" header={headerActionBodyTemplate} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Dialog header="Vista PDF de asistencias" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                        <iframe src={pdfAsistenciaURL} width="100%" height="99%"></iframe>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
