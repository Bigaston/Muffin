import React, { useEffect, useState, useRef } from 'react';

import './podcast.css';

import axios from 'axios';
import config from '../../config.json';
import itunes_category from './itunes_category.json';
import Modal from '../../component/modal';

import { toBase64 } from '../../utils';

import userAtom from '../../stores/user';
import { useRecoilState } from 'recoil';

import { Link, useHistory } from 'react-router-dom';

import { Helmet } from 'react-helmet';

export default function Podcast() {
  let history = useHistory();
  let [userState] = useRecoilState(userAtom);
  let [podcast, setPodcast] = useState({});
  let [currentCategory, setCurrentCategory] = useState('');
  let [currentCategorySub, setCurrentCategorySub] = useState([]);
  let [currentSub, setCurrentSub] = useState('');
  const [personPodcast, setPersonPodcast] = useState([]);

  useEffect(() => {
    axios({
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/podcast',
    })
      .then((res) => {
        if (res.status === 200) {
          setPodcast(res.data);
          setCurrentCategory(res.data.itunes_category);
          setCurrentCategorySub(itunes_category[res.data.itunes_category]);
          setCurrentSub(res.data.itunes_subcategory);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    axios({
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/person/get_person_podcast',
    })
      .then((res) => {
        if (res.status === 200) {
          setPersonPodcast(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userState]);

  function handleAllInput(event) {
    let new_info = { ...podcast };

    new_info[event.target.attributes.id.nodeValue] = event.target.value;
    setPodcast(new_info);
  }

  function handlePublication(event) {
    let new_publication = { ...podcast };

    new_publication.data[event.target.attributes.id.nodeValue] =
      event.target.value;
    setPodcast(new_publication);
  }

  function handleChangeCategory(event) {
    setCurrentCategory(event.target.value);
    setCurrentCategorySub(itunes_category[event.target.value]);

    if (itunes_category[event.target.value].length === 0) {
      setCurrentSub('');
    }
  }

  function handleChangeSub(event) {
    setCurrentSub(event.target.value);
  }

  function handleCheckbox(event) {
    let new_info = { ...podcast };

    new_info.explicit = event.target.checked;

    setPodcast(new_info);
  }

  let [openEditImage, setOpenEditImage] = useState(false);
  let filepicker_image = useRef(undefined);
  let [errorMessageImg, setErrorMessageImg] = useState('');
  let [percentCompleted, setPercentCompleted] = useState(0);

  function editImage() {
    setOpenEditImage(true);
    setPercentCompleted(0);
  }

  function validImage() {
    if (filepicker_image.current.files.length !== 1) {
      setErrorMessageImg('Merci de sélectionner une image!');
      return;
    }

    setErrorMessageImg('');

    // Vérification de si l'image est de la bonne taille
    let file = filepicker_image.current.files[0];
    let img = new Image();
    img.src = window.URL.createObjectURL(file);

    img.onload = () => {
      if (
        img.naturalHeight >= 1400 &&
        img.naturalWidth >= 1400 &&
        img.naturalWidth === img.naturalHeight
      ) {
        toBase64(file)
          .then((base64) => {
            axios({
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + userState.jwt,
              },
              url: config.host + '/api/admin/podcast/img',
              data: {
                image: base64,
              },
              onUploadProgress: (progressEvent) => {
                setPercentCompleted(
                  Math.floor((progressEvent.loaded * 100) / progressEvent.total)
                );
              },
            })
              .then((res) => {
                if (res.status === 200) {
                  setOpenEditImage(false);

                  let reload_img = { ...podcast };
                  reload_img.logo = config.host + '/img/pod.jpg#' + Date.now();

                  setPodcast(reload_img);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        setErrorMessageImg(
          'Votre image doit être au format carré et au moins de 1400x1400 pour être acceptée par iTunes et les lecteurs de podcasts'
        );
        return;
      }
    };
  }

  let [errorMessageEdit, setErrorMessageEdit] = useState('');

  function savePodcast() {
    if (
      !podcast.title ||
      !podcast.slogan ||
      !podcast.description ||
      !podcast.author ||
      !podcast.email ||
      !podcast.itunes_category
    ) {
      setErrorMessageEdit("Merci de completer tous les champs marqués d'un *!");
      return;
    }

    setErrorMessageEdit('');

    let edited_podcast = { ...podcast };
    edited_podcast.itunes_category = currentCategory;
    edited_podcast.itunes_subcategory = currentSub;

    axios({
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/podcast/info',
      data: edited_podcast,
    })
      .then((res) => {
        if (res.status === 200) {
          history.push('/');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function deletePersonne(id) {
    axios({
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      url: config.host + '/api/admin/person/delete_person_podcast/' + id,
    })
      .then((res) => {
        axios({
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + userState.jwt,
          },
          url: config.host + '/api/admin/person/get_person_podcast',
        })
          .then((res) => {
            if (res.status === 200) {
              setPersonPodcast(res.data);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const [openModalAddPerson, setOpenModalAddPerson] = useState(false);
  const [addRole, setAddRole] = useState('');
  const [addGroup, setAddGroup] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [availablePersonne, setAvailablePersonne] = useState([]);
  const [errorMessagePerson, setErrorMessagePerson] = useState('');

  function checkInPerson(id) {
    let result = false;
    let i = 0;
    while (!result && i < personPodcast.length) {
      if (personPodcast[i].Person.id === id) {
        result = true;
      } else {
        i++;
      }
    }

    return result;
  }

  function addPerson() {
    axios({
      method: 'GET',
      url: config.host + '/api/admin/person/get_all',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          let available = [];
          res.data.forEach((p) => {
            if (!checkInPerson(p.id)) {
              available.push(p);
            }
          });

          setAvailablePersonne(available);
          setOpenModalAddPerson(true);
          setAddRole('');
          setAddGroup('');
          setSelectedPerson(available[0].id);
          setErrorMessagePerson('');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleAddPerson() {
    if (!addRole || !addGroup) {
      setErrorMessagePerson(
        "Merci de complêter les trois champs marqués d'un *"
      );
      return;
    }

    setErrorMessagePerson('');
    axios({
      method: 'POST',
      url: config.host + '/api/admin/person/add_person_podcast',
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      data: {
        group: addGroup,
        role: addRole,
        PersonId: selectedPerson,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setOpenModalAddPerson(false);
          axios({
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + userState.jwt,
            },
            url: config.host + '/api/admin/person/get_person_podcast',
          })
            .then((res) => {
              if (res.status === 200) {
                setPersonPodcast(res.data);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => console.log(err));
  }

  const [openModalEditPerson, setOpenModalEditPerson] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [errorEditPerson, setErrorEditPerson] = useState('');
  const [editPersonId, setEditPersonId] = useState(null);

  function editPersonne(id, index) {
    setEditRole(personPodcast[index].role);
    setEditGroup(personPodcast[index].group);
    setEditName(personPodcast[index].Person.name);
    setEditPersonId(id);
    setOpenModalEditPerson(true);
    setErrorEditPerson('');
  }

  function handleEditPerson() {
    if (!editGroup || !editRole) {
      setErrorEditPerson("Merci de complêter les deux champs marqués d'un *");
      return;
    }

    setErrorEditPerson('');

    axios({
      method: 'POST',
      url:
        config.host + '/api/admin/person/edit_person_podcast/' + editPersonId,
      headers: {
        Authorization: 'Bearer ' + userState.jwt,
      },
      data: {
        group: editGroup,
        role: editRole,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setOpenModalEditPerson(false);
          axios({
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + userState.jwt,
            },
            url: config.host + '/api/admin/person/get_person_podcast',
          })
            .then((res) => {
              if (res.status === 200) {
                setPersonPodcast(res.data);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      <Helmet>
        <title>Modifier mon podcast - Muffin</title>
      </Helmet>
      <div className="podcastAdminContainer">
        <h1>Modifier mon podcast</h1>

        <label htmlFor="title">Titre du podcast*</label>
        <input
          className="u-full-width"
          type="text"
          id="title"
          value={podcast.title}
          onChange={handleAllInput}
        />
        <label htmlFor="slogan">Slogan du podcast*</label>
        <input
          className="u-full-width"
          type="text"
          id="slogan"
          value={podcast.slogan}
          onChange={handleAllInput}
        />
        <label htmlFor="description">Description*</label>
        <textarea
          className="u-full-width"
          id="description"
          value={podcast.description}
          onChange={handleAllInput}
        ></textarea>
        <label htmlFor="author">Auteur du podcast*</label>
        <input
          className="u-full-width"
          type="text"
          id="author"
          value={podcast.author}
          onChange={handleAllInput}
        />
        <label htmlFor="email">Email du flux*</label>
        <input
          className="u-full-width"
          type="email"
          id="email"
          value={podcast.email}
          onChange={handleAllInput}
        />

        <label htmlFor="itunes_category">Categorie iTunes*</label>
        <select
          className="u-full-width"
          id="itunes_category"
          value={currentCategory}
          onChange={handleChangeCategory}
        >
          {Object.keys(itunes_category).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {currentCategorySub.length !== 0 ? (
          <>
            <label htmlFor="itunes_subcategory">Sous-catégorie iTunes*</label>
            <select
              className="u-full-width"
              id="itunes_subcategory"
              value={currentSub}
              onChange={handleChangeSub}
            >
              {currentCategorySub.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </>
        ) : (
          <></>
        )}

        <label htmlFor="type">Type de podcast*</label>
        <select
          className="u-full-width"
          id="type"
          value={podcast.type}
          onChange={handleAllInput}
        >
          <option value="episodic">Du plus récent au plus vieux</option>
          <option value="serial">Du plus vieux au plus récent</option>
        </select>

        <input
          type="checkbox"
          id="explicit"
          defaultChecked={podcast.explicit}
          value={podcast.explicit}
          onClick={handleCheckbox}
        />
        <span className="label-body">Contenu explicite</span>

        <label htmlFor="prefix">Prefix de stats</label>
        <input
          className="u-full-width"
          type="url"
          id="prefix"
          value={podcast.prefix}
          onChange={handleAllInput}
        />
        <p>
          Collez ici le préfix de statistiques fournit par un service comme
          Podtrac ou Chartable. Attention, en cas de mauvaise configuration, vos
          fichiers pourront ne plus être accessibles!
        </p>
        {!!errorMessageEdit ? (
          <p className="errorMessageEdit">{errorMessageEdit}</p>
        ) : (
          <></>
        )}

        <h2>Social</h2>
        <label htmlFor="twitter">Twitter</label>
        <input
          className="u-full-width"
          type="url"
          id="twitter"
          value={podcast?.data?.twitter}
          onChange={handlePublication}
        />

        <label htmlFor="youtube">YouTube</label>
        <input
          className="u-full-width"
          type="url"
          id="youtube"
          value={podcast?.data?.youtube}
          onChange={handlePublication}
        />

        <label htmlFor="instagram">Instagram</label>
        <input
          className="u-full-width"
          type="url"
          id="instagram"
          value={podcast?.data?.instagram}
          onChange={handlePublication}
        />

        <label htmlFor="donation">Donation</label>
        <input
          className="u-full-width"
          type="url"
          id="donation"
          value={podcast?.data?.donation}
          onChange={handlePublication}
        />

        <h2>Publication</h2>
        <p>
          Pour savoir comment publier votre podcast sur différentes plateformes,
          vous pouvez aller voir le site de{' '}
          <a href="https://myriapod.fr/">Myriapod</a> !
        </p>
        <label htmlFor="apple_podcast">Apple Podcast</label>
        <input
          className="u-full-width"
          type="url"
          id="apple_podcast"
          value={podcast?.data?.apple_podcast}
          onChange={handlePublication}
        />

        <label htmlFor="spotify">Spotify</label>
        <input
          className="u-full-width"
          type="url"
          id="spotify"
          value={podcast?.data?.spotify}
          onChange={handlePublication}
        />

        <label htmlFor="google_podcast">Google Podcast</label>
        <input
          className="u-full-width"
          type="url"
          id="google_podcast"
          value={podcast?.data?.google_podcast}
          onChange={handlePublication}
        />

        <label htmlFor="deezer">Deezer</label>
        <input
          className="u-full-width"
          type="url"
          id="deezer"
          value={podcast?.data?.deezer}
          onChange={handlePublication}
        />

        <label htmlFor="podcast_addict">Podcast Addict</label>
        <input
          className="u-full-width"
          type="url"
          id="podcast_addict"
          value={podcast?.data?.podcast_addict}
          onChange={handlePublication}
        />

        <label htmlFor="podcloud">podCloud</label>
        <input
          className="u-full-width"
          type="url"
          id="podcloud"
          value={podcast?.data?.podcloud}
          onChange={handlePublication}
        />

        <button
          className="button-primary"
          style={{ width: '100%' }}
          onClick={savePodcast}
        >
          Enregistrer
        </button>

        <p className="fakeLabel">Logo</p>
        <img
          className="podcastLogo"
          src={config.host + podcast.logo}
          alt="Logo du podcast"
        />
        <button onClick={editImage}>Modifier l'image</button>

        <h2>Personnes</h2>
        <table className="u-full-width">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Groupe</th>
              <th>Rôle</th>
              <th>Modifier</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            {personPodcast.map((p, i) => (
              <tr key={p.Person.id}>
                <td>{p.Person.name}</td>
                <td>{p.group}</td>
                <td>{p.role}</td>
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
        <button className="button-primary" onClick={addPerson}>
          Ajouter une personne
        </button>
        <h2>Avancés</h2>
        <Link to="/a/import" className="button">
          Importer un podcast
        </Link>
      </div>

      <Modal
        open={openModalAddPerson}
        onCancel={() => {
          setOpenModalAddPerson(false);
        }}
      >
        <h1>Ajouter une personne</h1>
        <p>
          Liens des différents rôles et groupes possibles :{' '}
          <a
            href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/taxonomy.json"
            target="_blank"
            rel="noreferrer"
          >
            ici
          </a>
        </p>

        <label htmlFor="addGroup">Groupe de la personne*</label>
        <input
          className="u-full-width"
          type="text"
          id="addGroup"
          value={addGroup}
          onChange={(e) => setAddGroup(e.target.value)}
        />
        <label htmlFor="addRole">Role de la personne*</label>
        <input
          className="u-full-width"
          type="text"
          id="addRole"
          value={addRole}
          onChange={(e) => setAddRole(e.target.value)}
        />

        <label htmlFor="addPerson">Personne à ajouter*</label>
        <select
          class="u-full-width"
          id="addPerson"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
        >
          {availablePersonne.map((ap) => (
            <option key={ap.id} value={ap.id}>
              {ap.name}
            </option>
          ))}
        </select>
        {!!errorMessagePerson ? (
          <p className="errorMessage">{errorMessagePerson}</p>
        ) : null}
        <button className="button-primary" onClick={handleAddPerson}>
          Ajouter
        </button>
      </Modal>

      <Modal
        open={openModalEditPerson}
        onCancel={() => {
          setOpenModalEditPerson(false);
        }}
      >
        <h1>Modifier le rôle de {editName}</h1>
        <p>
          Liens des différents rôles et groupes possibles :{' '}
          <a
            href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/taxonomy.json"
            target="_blank"
            rel="noreferrer"
          >
            ici
          </a>
        </p>

        <label htmlFor="editGroup">Groupe de la personne*</label>
        <input
          className="u-full-width"
          type="text"
          id="editGroup"
          value={editGroup}
          onChange={(e) => setEditGroup(e.target.value)}
        />
        <label htmlFor="editRole">Role de la personne*</label>
        <input
          className="u-full-width"
          type="text"
          id="editRole"
          value={editRole}
          onChange={(e) => setEditRole(e.target.value)}
        />

        {!!errorEditPerson ? (
          <p className="errorMessage">{errorEditPerson}</p>
        ) : null}
        <button className="button-primary" onClick={handleEditPerson}>
          Ajouter
        </button>
      </Modal>

      <Modal
        open={openEditImage}
        onCancel={() => {
          setOpenEditImage(false);
        }}
      >
        <h1>Modifier l'image</h1>
        <input
          type="file"
          ref={filepicker_image}
          accept="image/png, image/jpeg"
        />
        {!!errorMessageImg ? (
          <p className="errorMessageImg">{errorMessageImg}</p>
        ) : (
          <></>
        )}
        <button className="button-primary" onClick={validImage}>
          Valider
        </button>{' '}
        <button
          onClick={() => {
            setOpenEditImage(false);
          }}
        >
          Annuler
        </button>
        {percentCompleted !== 0 ? (
          <progress max="100" value={percentCompleted} />
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
}
