const bdd = require('../../models');
const pngToJpeg = require('png-to-jpeg');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = {
  create_person: (req, res) => {
    bdd.Person.create({
      name: req.body.name,
      url: req.body.url,
    }).then((person) => {
      if (!!req.body.image) {
        let img_buffer = new Buffer.from(
          req.body.image.split(/,\s*/)[1],
          'base64'
        );

        sharp(img_buffer)
          .resize(400, 400)
          .toFile(
            path.join(
              __dirname,
              '../../export/img/person_' + person.id + '.jpg'
            ),
            (err, info) => {
              person.img =
                '/img/person_' + person.id + '.' + Date.now() + '.jpg';
              person.save().then(() => {
                res.send('OK');
              });
            }
          );
      } else {
        person.img = '/public/person.jpg';
        person.save().then(() => {
          res.send('OK');
        });
      }
    });
  },
  get_all_person: (req, res) => {
    bdd.Person.findAll().then((persons) => {
      res.json(persons);
    });
  },
  delete_person: (req, res) => {
    bdd.Person.findByPk(req.params.id).then((person) => {
      if (person.img !== '/public/person.jpg') {
        fs.unlinkSync(
          path.join(__dirname, '../../export/img/person_' + person.id + '.jpg')
        );
      }
      person.destroy().then(() => {
        res.send('OK');
      });
    });
  },
  edit_person: (req, res) => {
    bdd.Person.findByPk(req.params.id).then((person) => {
      person.name = req.body.name;
      person.url = req.body.url;
      person.save().then(() => {
        res.send('OK');
      });
    });
  },
  delete_image: (req, res) => {
    bdd.Person.findByPk(req.params.id).then((person) => {
      if (person.img !== '/public/person.jpg') {
        fs.unlinkSync(
          path.join(__dirname, '../../export/img/person_' + person.id + '.jpg')
        );
        person.img = '/public/person.jpg';
        person.save().then(() => res.send('OK'));
      } else {
        res.send('OK');
      }
    });
  },
  edit_image: (req, res) => {
    bdd.Person.findByPk(req.params.id).then((person) => {
      if (!!req.body.image) {
        let img_buffer = new Buffer.from(
          req.body.image.split(/,\s*/)[1],
          'base64'
        );

        sharp(img_buffer)
          .resize(400, 400)
          .toFile(
            path.join(
              __dirname,
              '../../export/img/person_' + person.id + '.jpg'
            ),
            (err, info) => {
              person.img =
                '/img/person_' + person.id + '.' + Date.now() + '.jpg';
              person.save().then(() => {
                res.send('OK');
              });
            }
          );
      } else {
        res.status(400).send('No image');
      }
    });
  },
  // Person & Podcast
  get_person_podcast: (req, res) => {
    bdd.Podcast.findOne({
      include: [{ model: bdd.PersonPodcast, include: bdd.Person }],
    }).then((podcast) => {
      res.json(podcast.PersonPodcasts);
    });
  },
  delete_person_podcast: (req, res) => {
    bdd.PersonPodcast.findByPk(req.params.id).then((pp) => {
      if (pp !== null) {
        pp.destroy().then(() => res.send('OK'));
      } else {
        res.send('OK');
      }
    });
  },
  add_person_podcast: (req, res) => {
    bdd.PersonPodcast.create({
      group: req.body.group,
      role: req.body.role,
      PersonId: req.body.PersonId,
      PodcastId: 1,
    }).then(() => {
      res.send('OK');
    });
  },
  edit_person_podcast: (req, res) => {
    bdd.PersonPodcast.findByPk(req.params.id).then((pp) => {
      pp.group = req.body.group;
      pp.role = req.body.role;
      pp.save().then(() => {
        res.send('OK');
      });
    });
  },
  // Person & Episode
  get_person_episode: (req, res) => {
    bdd.PersonEpisode.findAll({
      where: { EpisodeId: req.params.episodeId },
      include: bdd.Person,
    }).then((pe) => {
      res.json(pe);
    });
  },
  delete_person_episode: (req, res) => {
    bdd.PersonEpisode.findByPk(req.params.id).then((pe) => {
      if (pe !== null) {
        pe.destroy().then(() => res.send('OK'));
      } else {
        res.send('OK');
      }
    });
  },
  add_person_episode: (req, res) => {
    bdd.PersonEpisode.create({
      group: req.body.group,
      role: req.body.role,
      PersonId: req.body.PersonId,
      EpisodeId: req.body.EpisodeId,
    }).then(() => {
      res.send('OK');
    });
  },
  edit_person_episode: (req, res) => {
    bdd.PersonEpisode.findByPk(req.params.id).then((pp) => {
      pp.group = req.body.group;
      pp.role = req.body.role;
      pp.save().then(() => {
        res.send('OK');
      });
    });
  },
};
