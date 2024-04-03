'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { Sia } from '../../../types/sia';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { Dropdown } from 'primereact/dropdown';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Page() {

    const [estudiantes, setestudiantes] = useState<Array<any>>([]);
    const [tempEstudiantes, setTempEstudiantes] = useState<Array<any>>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const { data: session, status } = useSession();

    const carreras = [
        { nombre: 'Docencia en Artes Visuales', codigo: 1 },
        { nombre: 'Docencia en Artes Música', codigo: 2 },
        { nombre: 'Artista Profesional en Escultura', codigo: 3 },
        { nombre: 'Docencia en Artes Pintura', codigo: 4 },
    ]
    const [carrera, setCarrera] = useState(0);

    const [codigoCurso, setCodigoCurso] = useState('')

    const [periodo, setPeriodo] = useState('')

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const result = await axios("/estudiante/estudiantesMatriculados", {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            setestudiantes(result.data.estudiantes);
            setTempEstudiantes(result.data.estudiantes)
            setPeriodo(result.data.periodoVigente.Denominacion)
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    }

    const fetchDataEstudiantes = async () => {
        try {
            const result = await axios("/estudiante/estudiantesMatriculadosCurso", {
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }, params: { codigoCurso: codigoCurso }
            });
            setTempEstudiantes(result.data.estudiantes)
            console.log(result.data.estudiantes)
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    }

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        if (val.length === 6) {
            fetchDataEstudiantes()
        }
        setCodigoCurso(val)
    };

    const onDropdownChange = (e: any, name: string) => {
        const val = (e.target && e.target.value) || null;
        setCodigoCurso('')

        const tempEstudiantes = estudiantes.filter(estudiante => estudiante.CodigoCarreraProfesional === val)
        setTempEstudiantes(tempEstudiantes)
        setCarrera(val)
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2 mr-3">
                    <Dropdown
                        value={carrera}
                        options={carreras}
                        optionValue='codigo'
                        optionLabel='nombre'
                        onChange={(e) => {
                            onDropdownChange(e, 'carrera');
                        }}
                        placeholder="Seleccione carrera"
                        showClear
                    />
                </div>
                <InputText maxLength={6} value={codigoCurso} onChange={(e) => onInputChange(e)} placeholder="Código de curso" />
            </React.Fragment>
        );
    };

    const dateBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.Fecha));
    };

    const formatDate = (value: Date) => {
        return value.toLocaleString("es-PE", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            hour12: true,
            minute: '2-digit',
        });
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">ESTUDIANTES MATRICULADOS <strong>PERIODO {periodo}</strong></h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
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
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={tempEstudiantes}
                        key="CodigoSunedu"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} estudiantes"
                        globalFilter={globalFilter}
                        emptyMessage="Sin estudiantes matriculados"
                        header={header}
                    >
                        <Column field="CodigoSunedu" header="Código Sunedu" sortable />
                        <Column field="Paterno" header="Paterno" sortable />
                        <Column field="Materno" header="Materno" sortable />
                        <Column field="Nombres" header="Nombres" sortable />
                        <Column field="Fecha" header="Fecha" sortable body={dateBodyTemplate} />
                    </DataTable>

                </div>
            </div>
        </div>
    );
};