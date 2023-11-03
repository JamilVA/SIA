"use client";

import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";

const page = () => {
  const [estudianteData, setEstudianteData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios("http://localhost:3001/api/estudiante");
      setEstudianteData(result.data.estudiantes);
      console.log(result.data.estudiantes);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header></Card.Header>
        <Card.Body>
          <Card.Title>Lista Estudiantes</Card.Title>
          <Table striped bordered hover >
            <thead>
              <tr>
                <th>Id</th>
                <th>Title</th>
                <th>Content</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {estudianteData.map((estudiante, i) => {
                return (
                  <tr key={i}>
                    <td className="text-black-50">{i + 1}</td>
                    <td className="text-black-50">{estudiante.codigoSunedu}</td>
                    <td className="text-black-50">{estudiante.anioIngreso}</td>
                    <td className="text-black-50">
                      {estudiante.Persona.nombres}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default page;
