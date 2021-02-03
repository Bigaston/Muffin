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

        if (req.body.image.startsWith('data:image/png;')) {
          pngToJpeg({ quality: 90 })(img_buffer).then((output) => {
            sharp(output)
              .resize(400, 400)
              .toFile(
                path.join('../../export/img/person_' + person.id + '.jpg'),
                (err, info) => {
                  person.img =
                    '/img/person_' + person.id + '.' + Date.now() + '.jpg';
                  person.save().then(() => {
                    res.send('OK');
                  });
                }
              );
          });
        } else {
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
        }
      } else {
        person.img = '/static/person.jpg';
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
      if (person.img !== '/static/person.jpg') {
        fs.unlinkSync(
          path.join(__dirname, '../../export/img/person_' + person.id + '.jpg')
        );
      }
      person.destroy().then(() => {
        res.send('OK');
      });
    });
  },
};
