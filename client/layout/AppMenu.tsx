/* eslint-disable @next/next/no-img-element */

import React, { use, useContext, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '../types/types';
import { useSession } from "next-auth/react";

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { data: session, status } = useSession();
    const [i, setI] = useState(0);

    const model: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: [
                { label: 'PageDeLaPlantilla', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },
                { label: 'Perfil Estudiante', icon: 'pi pi-fw pi-user', to: '/estudiante/perfil' },

                { label: 'Gestion de Estudiantes', icon: 'pi pi-fw pi-users', to: '/administrador/estudiantes' },
                { label: 'Gestion de Docentes', icon: 'pi pi-fw pi-users', to: '/administrador/docentes' },
                { label: 'Gestion de Jefes de Dep.', icon: 'pi pi-fw pi-users', to: '/administrador/jefesDepartamento' },
                { label: 'Gestion de Cursos', icon: 'pi pi-fw pi-book', to: '/administrador/cursos' },
                { label: 'Gestion de Periodo', icon: 'pi pi-fw pi-clock', to: '/administrador/periodo' },

                { label: 'Horarios-Docente', icon: 'pi pi-fw pi-calendar', to: '/docente/horarios' },
                { label: 'Cursos-Docente', icon: 'pi pi-fw pi-book', to: '/docente/cursos' },

                { label: 'Calificaciones', icon: 'pi pi-fw pi-check-square', to: '/estudiante/calificaciones' },
                { label: 'Clases', icon: 'pi pi-fw pi-book', to: '/estudiante/clases' },
                { label: 'Horarios', icon: 'pi pi-fw pi-calendar', to: '/estudiante/horarios' },
                { label: 'Matrícula', icon: 'pi pi-fw pi-list', to: '/estudiante/matricula' },
                { label: 'Pagos', icon: 'pi pi-fw pi-money-bill', to: '/estudiante/pagos' },

                { label: 'Habilitación de cursos', icon: 'pi pi-fw pi-book', to: '/jefe/curso-calificacion' },
                { label: 'Gestion de Horarios', icon: 'pi pi-fw pi-list', to: '/jefe/horarios' },
                { label: 'Gestion de Matricula', icon: 'pi pi-fw pi-list', to: '/jefe/matricula' },
                

                { label: 'Gestion de Pagos', icon: 'pi pi-fw pi-money-bill', to: '/tesoreria/pagos' },

                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },

    ];

    const initModel: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: [
            ]
        },

    ];

    const [user, setUser] = useState(initModel);

    const modelAdmin: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: [
                { label: 'Gestion de Estudiantes', icon: 'pi pi-fw pi-users', to: '/administrador/estudiantes' },
                { label: 'Gestion de Docentes', icon: 'pi pi-fw pi-users', to: '/administrador/docentes' },
                { label: 'Gestion de Jefes de Dep.', icon: 'pi pi-fw pi-users', to: '/administrador/jefesDepartamento' },
                { label: 'Gestion de Cursos', icon: 'pi pi-fw pi-book', to: '/administrador/cursos' },
                { label: 'Gestion de Periodo', icon: 'pi pi-fw pi-clock', to: '/administrador/periodo' },
            ]
        },
    ];

    const modelStudent: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: [
                { label: 'Perfil Estudiante', icon: 'pi pi-fw pi-user', to: '/estudiante/perfil' },
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
            label: 'NAVEGACIÓN',
            items: [
                { label: 'Cursos-Docente', icon: 'pi pi-fw pi-book', to: '/docente/cursos' },
                { label: 'Horarios-Docente', icon: 'pi pi-fw pi-calendar', to: '/docente/horarios' },
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },

    ];

    const modelJefe: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: [
                { label: 'Perfil Estudiante', icon: 'pi pi-fw pi-user', to: '/estudiante/perfil' },
                { label: 'Habilitación de cursos', icon: 'pi pi-fw pi-book', to: '/jefe/curso-calificacion' },
                { label: 'Gestion de Horarios', icon: 'pi pi-fw pi-list', to: '/jefe/horarios' },
                { label: 'Gestion de Matricula', icon: 'pi pi-fw pi-list', to: '/jefe/matricula' },
                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },

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
