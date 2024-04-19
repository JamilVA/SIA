/* eslint-disable @next/next/no-img-element */

import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            <img src={`/images/pandalopers.png`} alt="Logo" height="20" className="mr-2" />
            by
            <span className="font-medium ml-2 mr-2">Pandalopers</span>
            <i className="pi pi-prime"></i>
        </div>
    );
};

export default AppFooter;
