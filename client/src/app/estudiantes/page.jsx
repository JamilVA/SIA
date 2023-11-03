import Table from "react-bootstrap/Table";

async function getEstudiantes() {
  const res = await fetch("http://localhost:3001/api/estudiante");
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function ListaEstudiantes() {
  const data = await getEstudiantes();
  
  const listaEstudiantes = [];
  
//   for (var i = 0; i < 9; i++) {
//     n += i;
//     mifuncion(n);
//   }

//   for (var propiedad in data.estudiantes) {
//     if (data.estudiantes.hasOwnProperty(propiedad)) {
//         console.log("hola")
//       console.log(propiedad + ": " + data.estudiantes[propiedad]);
//     }
//   }

  //   for (const [key, value] of Object.entries(data.estudiantes)) {
  //     listaEstudiantes.push([`${key}`, `${value}`]);
  //   }

    console.log("Estudiantes: ", data.estudiantes);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Estudiante</th>
          <th>Código Sunedu</th>
          <th>DNI</th>
          <th>Correo</th>
        </tr>
      </thead>
      <tbody>
        {listaEstudiantes.map((val, key) => {
          return (
            <tr>
              <td>{val.codigo}</td>
              <td>{val.Persona}</td>
              <td>{val.codigoSunedu}</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
          );
        })}
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
      </tbody>
    </Table>
  );
}

export default ListaEstudiantes;
