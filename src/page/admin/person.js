import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';
import config from '../../config.json';

import userAtom from '../../stores/user';
import { useRecoilState } from 'recoil';

import { Helmet } from 'react-helmet';

import { Link } from 'react-router-dom';

import { toBase64 } from '../../utils';

import Modal from '../../component/modal';

import './person.css';

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

  const [openModal, setOpenModal] = useState(false);
  const [editImg, setEditImg] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [during, setDuring] = useState(false);

  function editPersonne(id, index) {
    setEditId(id);
    setEditImg(personnes[index].img);
    setEditName(personnes[index].name);
    setEditUrl(personnes[index].url);
    setOpenModal(true);
  }

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

  function editPersonneSubmit() {
    if (during) return;
    if (!editName || !editUrl) {
      setErrorMessage('Merci de complêter les deux champs!');
      return;
    }

    setErrorMessage('');
    setDuring(false);

    axios({
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/person/edit/' + editId,
      data: { name: editName, url: editUrl },
    })
      .then((res) => {
        if (res.status === 200) {
          setOpenModal(false);
          setEditId(null);
          setDuring(false);
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
        setDuring(false);
        console.log(err);
      });
  }

  const filepicker_img = useRef(undefined);
  const [duringImg, setDuringImg] = useState(false);
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [errorMessageImg, setErrorMessageImg] = useState('');

  function editImage() {
    if (duringImg) return;
    if (filepicker_img.current.files.length !== 1) {
      setErrorMessageImg('Merci de choisir une image avant de la modifier');
      return;
    }

    setDuringImg(true);

    setErrorMessageImg('');

    // Vérification de si l'image est de la bonne taille
    let file_img = filepicker_img.current.files[0];
    let img = new Image();
    img.src = window.URL.createObjectURL(file_img);

    img.onload = () => {
      if (img.naturalHeight === img.naturalWidth && img.naturalHeight > 400) {
        toBase64(file_img)
          .then((base64img) => {
            afterImageCheck(base64img);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        setErrorMessageImg(
          'Votre image doit être au format carré et de au moins 400x400!'
        );
        setDuringImg(false);
        return;
      }
    };

    function afterImageCheck(base64img) {
      axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + userState.jwt,
        },
        url: config.host + '/api/admin/person/edit_image/' + editId,
        data: { image: base64img },
        onUploadProgress: (progressEvent) => {
          setPercentCompleted(
            Math.floor((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      })
        .then((res) => {
          if (res.status === 200) {
            setOpenModal(false);
            setEditId(null);
            setDuringImg(false);
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
          setDuring(false);
        });
    }
  }

  function deleteImage() {
    axios({
      method: 'DELETE',
      url: config.host + '/api/admin/person/delete_image/' + editId,
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
    }).then((res) => {
      setOpenModal(false);
      setEditId(null);
      axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + userState.jwt,
        },
        url: config.host + '/api/admin/person/get_all',
      }).then((res) => {
        setPersonnes(res.data);
      });
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

      <Modal
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setEditId(null);
        }}
      >
        <h1>Modifier une personne</h1>
        <label htmlFor="name">Nom de la personne*</label>
        <input
          className="u-full-width"
          type="text"
          id="name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
        <label htmlFor="url">URL de la personne*</label>
        <input
          className="u-full-width"
          type="url"
          id="url"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
        />
        {!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
        <button className="button-primary" onClick={editPersonneSubmit}>
          Modifier la personne
        </button>
        <p className="fakeLabel">Avatar de la personne</p>
        <img
          className="personLogoEdit"
          src={config.host + editImg}
          alt="Avatar de la personne"
        />
        <br />
        <label htmlFor="img">Image de la personne</label>
        <input
          type="file"
          id="img"
          ref={filepicker_img}
          accept="image/png, image/jpeg"
        />
        {!!errorMessageImg ? (
          <p className="errorMessage">{errorMessageImg}</p>
        ) : (
          <></>
        )}
        <button onClick={editImage}>Modifier l'image</button>{' '}
        <button className="button-delete" onClick={deleteImage}>
          Supprimer l'image
        </button>
        {during ? <progress max="100" value={percentCompleted} /> : <></>}
      </Modal>
    </>
  );
}
