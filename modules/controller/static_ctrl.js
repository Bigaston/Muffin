module.exports = {
    audio: (req, res) => {
        let audio_file = req.params.file.replace(/\..*\./, "")
        console.log(audio_file)
    }
}