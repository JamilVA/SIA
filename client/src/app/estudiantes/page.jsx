import Table from 'react-bootstrap/Table';

async function getEstudiantes() {
    const res = await fetch('http://localhost:3001/api/estudiante');
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

async function ListaEstudiantes() {
    const data = await getEstudiantes()
    console.log("Estudiantes: ", data)
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Estudiate</th>
                    <th>Código Sunedu</th>
                    <th>DNI</th>
                    <th>Correo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td colSpan={2}>Larry the Bird</td>
                    <td>@twitter</td>
                </tr>
            </tbody>
        </Table>
    );
}

export default ListaEstudiantes;