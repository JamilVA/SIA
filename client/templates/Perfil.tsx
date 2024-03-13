import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';

const Perfil = () => {
    const { data: session, status } = useSession();
    const [imagenURL, setImagenURL] = useState<string>('');

    let emptyEstudiante: {
        Codigo: string;
        CodigoSunedu: string;
        CreditosLlevados: Number;
        CreditosAprobados: Number;
        Persona: {
            Paterno: string;
            Materno: string;
            Nombres: string;
            DNI: string;
            Email: string;
            Codigo: Number;
            Direccion: string;
            EmailPersonal: string;
            Celular: string;
        };
        CarreraProfesional: {
            Codigo: Number;
            NombreCarrera: string;
        };
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
            Celular: ''
        },
        CarreraProfesional: {
            Codigo: 0,
            NombreCarrera: ''
        }
    };

    const emptyPersona = {
        Paterno: '',
        Materno: '',
        Nombres: '',
        Email: '',
        RutaFoto: '',
        DNI: ''
    };

    const [estudiante, setEstudiante] = useState(emptyEstudiante);
    const [persona, setPersona] = useState(emptyPersona);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (status === 'authenticated') fetchData(); 
    }, [status]);

    const fetchData = async () => {
        let result;
        try {
            if (session?.user.nivelUsuario == 4) {
                result = await axios.get('/estudiante/getbycod', {
                    params: {
                        CodigoPersona: session?.user.codigoEstudiante
                    }
                });
                setEstudiante(result.data.estudiante);
                if (result.data.estudiante.Persona.RutaFoto) {
                    await obtenerArchivo(result.data.estudiante.Persona.RutaFoto);
                } else {
                    setImagenURL('/images/usuario.png');
                }
            } else {
                console.log(session?.user.codigoPersona)
                result = await axios.get('/persona', {
                    params: {
                        codPersona: session?.user.codigoPersona
                    }
                });
                console.log(result)
                setPersona(result.data.persona);
                if (result.data.persona.RutaFoto) {
                    await obtenerArchivo(result.data.docente.Persona.RutaFoto);
                } else {
                    setImagenURL('/images/usuario.png');
                }
            }
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    };

    const obtenerArchivo = async (ruta: string) => {
        try {
            const response = await axios.get('/files/download', {
                params: { fileName: ruta },
                responseType: 'arraybuffer' // Especificar el tipo de respuesta como 'arraybuffer'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            setImagenURL(url);
        } catch (error) { }
    };

    if (status == 'loading') {
        return (
            <>
                <div className="card shadow-1">
                    <div className="text-center">
                        <Skeleton size="4rem" className="mr-2"></Skeleton>
                    </div>
                    <div className="mt-4">
                        <Skeleton width="5rem" className="mb-2"></Skeleton>
                        <Skeleton width="5rem" className="mb-2"></Skeleton>
                    </div>
                </div>
            </>
        );
    }

    if (session?.user.nivelUsuario == 4) {
        return (
            <div className="card shadow-1">
                <div className="text-center">
                    <img style={{ borderRadius: 'var(--border-radius)', width: '8rem', height: '8rem', objectFit: 'cover' }} alt="Card" className=" mt-1 shadow-1" src={imagenURL} />
                    <h5 style={{ color: 'var(--surface-700)' }}>
                        {estudiante.Persona?.Paterno} {estudiante.Persona?.Materno} {estudiante.Persona?.Nombres}
                    </h5>
                    <h6 className="mt-0" style={{ color: 'var(--surface-500)' }}>
                        {estudiante.CarreraProfesional.NombreCarrera.toLocaleUpperCase()}
                    </h6>
                </div>
                <div className="mt-4">
                    <p>
                        <b>Codigo: </b>
                        {estudiante.CodigoSunedu}
                    </p>
                    <p>
                        <b>Email: </b>
                        {session?.user.email}
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="card shadow-1">
                <div className="text-center">
                    <img style={{ borderRadius: 'var(--border-radius)', width: '8rem', height: '8rem', objectFit: 'cover' }} alt="Card" className=" mt-1 shadow-1" src={imagenURL} />
                    <h5 style={{ color: 'var(--surface-700)' }}>
                        {persona?.Paterno} {persona?.Materno} {persona?.Nombres}
                    </h5>
                </div>
                <div className="mt-4">
                    <p>
                        <b>Email: </b>
                        {session?.user.email}
                    </p>
                    <p>
                        <b>DNI: </b>
                        {persona?.DNI}
                    </p>
                </div>
            </div>
        );
    }
};

export default Perfil;
