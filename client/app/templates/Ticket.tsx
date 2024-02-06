import '../../styles/ticket.css'

export default function Ticket(props: any) {

    return (
        <>
            <div id='p' className="main">
                <div className="ticket">
                    <div className="header">
                        <h1>ESFAP MUA</h1>
                        <p>Jr. Los Álamos 586, Cajamarca</p>
                        <p>Teléfono: (076) 364743</p>
                        <p>Nro. Transacción: {props.numero}</p>
                    </div>

                    <div className="customer-info">
                        <p><strong>Estudiante: </strong>{props.estudiante}</p>
                        <p><strong>DNI: </strong>{props.dni}</p>
                        <p><strong>FECHA: </strong>{props.fecha}</p>
                    </div>

                    <div className="items">
                        <div className="item">
                            <span>{props.concepto}</span>
                            <span>S/ {props.monto}</span>
                        </div>
                    </div>

                    <div className="total">
                        <p>Total: S/ {props.monto}</p>
                    </div>
                    <div className="footer">
                        <p>OFICINA DE TESORERÍA</p>
                    </div>
                </div>
            </div>          
        </>
    );
}