import React, { useState, useEffect } from 'react';

import axios from 'axios';
import config from '../../config.json';

import userAtom from '../../stores/user';
import { useRecoilState } from 'recoil';

import { Helmet } from 'react-helmet';

import { useHistory, Link } from 'react-router-dom';

import { toBase64 } from '../../utils';

export default function Person() {
  let [userState] = useRecoilState(userAtom);
  const [personnes, setPersonnes] = useState([]);

  useEffect(() => {
    axios({
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/person/get_all',
    }).then((res) => {
      setPersonnes(res.data);
    });
  }, [userState]);

  function editPersonne(id, index) {}

  function deletePersonne(id) {
    axios({
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/person/delete/' + id,
    })
      .then((res) => {
        if (res.status === 200) {
          axios({
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + userState.jwt,
            },
            url: config.host + '/api/admin/person/get_all',
          }).then((res) => {
            setPersonnes(res.data);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <Helmet>
        <title>Personnes - Muffin</title>
      </Helmet>
      <div className="container">
        <h1>Gérer les personnes</h1>
        <table className="u-full-width">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Lien</th>
              <th>Modifier</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            {personnes.map((p, i) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.url}</td>
                <td>
                  <button
                    onClick={() => {
                      editPersonne(p.id, i);
                    }}
                  >
                    🖋️
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      deletePersonne(p.id);
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link className="button button-primary" to="/a/person/create">
          Créer une personne
        </Link>
      </div>
    </>
  );
}
