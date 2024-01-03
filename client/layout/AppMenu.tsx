/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '../types/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'NAVEGACIÓN',
            items: [
                { label: 'PageDeLaPlantilla', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/inicio' },
                { label: 'Perfil', icon: 'pi pi-fw pi-user', to: '/perfil' },

                { label: 'Gestion de Estudiantes', icon: 'pi pi-fw pi-users', to: '/administrador/estudiantes' },
                { label: 'Gestion de Docentes', icon: 'pi pi-fw pi-users', to: '/administrador/docentes' },
                { label: 'Gestion de Jefes de Dep.', icon: 'pi pi-fw pi-users', to: '/administrador/jefesDepartamento' },
                { label: 'Gestion de Cursos', icon: 'pi pi-fw pi-book', to: '/administrador/cursos' },

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
                { label: 'Gestion de Periodo', icon: 'pi pi-fw pi-clock', to: '/jefe/periodo' },

                { label: 'Gestion de Pagos', icon: 'pi pi-fw pi-money-bill', to: '/tesoreria/pagos' },

                { label: 'Manuales de Usuario', icon: 'pi pi-fw pi-file', to: '/manuales-usuario' },
            ]
        },
        
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

                {/* <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link> */}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
