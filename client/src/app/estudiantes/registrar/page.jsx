'use client';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function RegistrarEstudiante() {
  return (
    <div className="container">
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Apellido paterno</Form.Label>
          <Form.Control type="text" placeholder="Apellido paterno del estudiante" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Apellido materno</Form.Label>
          <Form.Control type="text" placeholder="Apellido materno del estudiante" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Nombres</Form.Label>
          <Form.Control type="text" placeholder="Nombres del estudiante" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>DNI</Form.Label>
          <Form.Control type="text" placeholder="DNI del estudiante" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Correo institucional del estudiante" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Fecha de nacimiento</Form.Label>
          <Form.Control type="date" placeholder="Seleccione una fecha" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Sexo</Form.Label>
          <Form.Select aria-label="Default select example">
            <option>Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Código Sunedu</Form.Label>
          <Form.Control type="text" placeholder="Código Sunedu del estudiante" />
        </Form.Group>

        <Button variant="primary" type="submit">
          Guardar
        </Button>
      </Form>
    </div>

  );
}