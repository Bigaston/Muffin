const fs = require("fs");
const path = require("path");

module.exports = {
    audio: (req, res) => {
        let audio_file = req.params.file.replace(/\..*$/, "") + ".mp3"

        if (fs.existsSync(path.join(__dirname, "../../export/audio/" + audio_file))) {
            res.sendFile(path.join(__dirname, "../../export/audio/" + audio_file))
        } else {
            res.status(404).send("Not found")
        }
    },
    image: (req, res) => {
        let audio_file = req.params.file.replace(/\..*$/, "") + ".jpg"

        if (fs.existsSync(path.join(__dirname, "../../export/img/" + audio_file))) {
            res.sendFile(path.join(__dirname, "../../export/img/" + audio_file))
        } else {
            res.status(404).send("Not found")
        }
    },
    srt: (req, res) => {
        let audio_file = req.params.file.replace(/\..*$/, "") + ".srt"

        if (fs.existsSync(path.join(__dirname, "../../export/srt/" + audio_file))) {
            res.sendFile(path.join(__dirname, "../../export/srt/" + audio_file))
        } else {
            res.status(404).send("Not found")
        }
    }
}