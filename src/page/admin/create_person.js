import React, { useState, useRef } from 'react';

import axios from 'axios';
import config from '../../config.json';

import userAtom from '../../stores/user';
import { useRecoilState } from 'recoil';

import { Helmet } from 'react-helmet';

import { useHistory } from 'react-router-dom';

import { toBase64 } from '../../utils';

export default function ImportPodcast() {
  let [userState] = useRecoilState(userAtom);
  const filepicker_img = useRef(undefined);
  const history = useHistory();

  const [person, setPerson] = useState({
    name: '',
    url: '',
  });

  function handleAllInput(event) {
    let new_info = { ...person };

    new_info[event.target.attributes.id.nodeValue] = event.target.value;
    setPerson(new_info);
  }

  const [errorMessage, setErrorMessage] = useState('');
  let [percentCompleted, setPercentCompleted] = useState(0);
  let [during, setDuring] = useState(false);

  function createPerson() {
    if (during) return;
    if (!person.name || !person.url) {
      setErrorMessage(
        "L'un des champs obligatoire n'est pas remplis! Merci de complêter tous les champs avec *"
      );
      return;
    }

    setDuring(true);

    setErrorMessage('');

    // Vérification de si l'image est de la bonne taille
    if (filepicker_img.current.files.length === 1) {
      let file_img = filepicker_img.current.files[0];
      let img = new Image();
      img.src = window.URL.createObjectURL(file_img);

      img.onload = () => {
        if (
          img.naturalHeight === img.naturalWidth &&
          img.naturalHeight >= 400
        ) {
          toBase64(file_img)
            .then((base64img) => {
              afterImageCheck(base64img);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          setErrorMessage(
            'Votre image doit être au format carré et de au moins 400x400!'
          );
          setDuring(false);
          return;
        }
      };
    } else {
      afterImageCheck(null);
    }

    function afterImageCheck(base64img) {
      let data_pl = { ...person };

      data_pl.image = base64img;

      axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + userState.jwt,
        },
        url: config.host + '/api/admin/person/create',
        data: data_pl,
        onUploadProgress: (progressEvent) => {
          setPercentCompleted(
            Math.floor((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      })
        .then((res) => {
          setDuring(false);
          if (res.status === 200) {
            history.push('/a/person');
          }
        })
        .catch((err) => {
          setDuring(false);
          console.log(err);
          setDuring(false);
        });
    }
  }
  return (
    <>
      <Helmet>
        <title>Créer une personne - Muffin</title>
      </Helmet>
      <div className="container">
        <h1>Créer une personne</h1>
        <label htmlFor="name">Nom de la personne*</label>
        <input
          className="u-full-width"
          type="text"
          id="name"
          value={person.name}
          onChange={handleAllInput}
        />

        <label htmlFor="url">URL de la personne*</label>
        <input
          className="u-full-width"
          type="url"
          id="url"
          value={person.url}
          onChange={handleAllInput}
        />

        <label htmlFor="img">Image de la personne</label>
        <input
          type="file"
          id="img"
          ref={filepicker_img}
          accept="image/png, image/jpeg"
        />
        <p className="info">
          (Si vous n'en entrez pas, l'image utilisée sera celle par défaut)
        </p>

        {!!errorMessage ? (
          <p className="errorMessage">{errorMessage}</p>
        ) : (
          <></>
        )}
        <button className="button-primary" onClick={createPerson}>
          Créer la personne
        </button>
        {during ? <progress max="100" value={percentCompleted} /> : <></>}
      </div>
    </>
  );
}
