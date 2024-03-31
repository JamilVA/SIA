/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '../types/types';
import { useSession } from "next-auth/react";

const AppMenu = () => {
    const { data: session, status } = useSession();
    const [i, setI] = useState(0);

    const initModel: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: []
        },

    ];

    const [user, setUser] = useState(initModel);

    const modelAdmin: AppMenuItem[] = [
        {
            label: 'PANEL DE ADMINISTRACIÓN',
            items: [
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },
                { label: 'Gestión de Usuarios', icon: 'pi pi-fw pi-user', to: '/administrador/usuarios' },
                { label: 'Gestión de Estudiantes', icon: 'pi pi-fw pi-users', to: '/administrador/estudiantes' },
                { label: 'Gestión de Docentes', icon: 'pi pi-fw pi-users', to: '/administrador/docentes' },
                { label: 'Gestión de Jefes de Dep.', icon: 'pi pi-fw pi-users', to: '/administrador/jefesDepartamento' },
                { label: 'Gestión de Cursos', icon: 'pi pi-fw pi-book', to: '/administrador/cursos' },
                { label: 'Gestión de Matrícula', icon: 'pi pi-fw pi-list', to: '/administrador/matriculas' },
                { label: 'Gestión de Periodos', icon: 'pi pi-fw pi-clock', to: '/administrador/periodo' },
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },
    ];

    const modelTesoreria: AppMenuItem[] = [
        {
            label: 'PANEL DE TESORERÍA',
            items: [
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },
                { label: 'Gestion de Pagos', icon: 'pi pi-fw pi-money-bill', to: '/tesoreria/pagos' },
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },
    ];

    const modelStudent: AppMenuItem[] = [
        {
            label: 'PANEL DE ESTUDIANTE',
            items: [
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },
                { label: 'Perfil', icon: 'pi pi-fw pi-user', to: '/estudiante/perfil' },
                { label: 'Calificaciones', icon: 'pi pi-fw pi-check-square', to: '/estudiante/calificaciones' },
                { label: 'Clases', icon: 'pi pi-fw pi-book', to: '/estudiante/clases' },
                { label: 'Horarios', icon: 'pi pi-fw pi-calendar', to: '/estudiante/horarios' },
                { label: 'Matrícula', icon: 'pi pi-fw pi-list', to: '/estudiante/matricula' },
                { label: 'Pagos', icon: 'pi pi-fw pi-money-bill', to: '/estudiante/pagos' },
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },
    ];

    const modelDocente: AppMenuItem[] = [
        {
            label: 'PANEL DE DOCENTE',
            items: [
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },
                { label: 'Cursos', icon: 'pi pi-fw pi-book', to: '/docente/cursos' },
                { label: 'Horarios', icon: 'pi pi-fw pi-calendar', to: '/docente/horarios' },
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        }

    ];

    const modelJefe: AppMenuItem[] = [
        {
            label: 'PANEL DE JEFE DE DEPARTAMENTO',
            items: [       
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },  
                { label: 'Habilitación de cursos', icon: 'pi pi-fw pi-book', to: '/jefatura/habilitacion-cursos' },              
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },
        session?.user.codigoDocente != 0?
        {
            label: 'PANEL DE DOCENTE',
            items: [
                { label: 'Cursos', icon: 'pi pi-fw pi-book', to: '/docente/cursos' },
                { label: 'Horarios', icon: 'pi pi-fw pi-calendar', to: '/docente/horarios' },
            ]
        }:{
            label: ''
        }

    ];
    
    if (status === 'authenticated' && i == 0) {
        switch (session?.user.nivelUsuario) {
            case 1:
                setUser(modelAdmin); break;
            case 2:
                setUser(modelJefe); break;
            case 3:
                setUser(modelDocente); break;
            case 4:
                setUser(modelStudent); break;
            case 5:
                setUser(modelTesoreria); break;
        }
        setI(i + 1);
    }

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {user.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );

};

export default AppMenu;
