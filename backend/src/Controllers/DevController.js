const axios = require("axios");
const Dev = require("../models/Dev");
const parseStringAsArray = require("../utils/parseStringAsArray");
const { findConnections, sendMessage } = require("../websocket");

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();
    res.json(devs);
  },

  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const response = await axios.get(
        `https://api.github.com/users/${github_username}`
      );

      const { name = login, avatar_url, bio } = response.data;

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      });

      // Filtrar as conexões que estão no máximo a 10km de distância
      // e que o novo dev tenha pelo menos uma das tecnologias filtradas

      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray
      );

      sendMessage(sendSocketMessageTo, "new-dev", dev);
    }

    return res.json(dev);
  },

  async update(req, res) {
    const { name, bio, techs, latitude, longitude } = req.body;

    const techsArray = parseStringAsArray(techs);

    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    };

    await Dev.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name,
          bio,
          techs: techsArray,
          location
        }
      },
      (err, result) => {
        if (err) return res.send(err);
      }
    );

    const dev = await Dev.findOne({ _id: req.params.id });
    res.json(dev);
  },

  async delete(req, res) {
    const result = await Dev.deleteOne(
      { _id: req.params.id },
      (err, result) => {
        if (err) return res.send(500, err);
      }
    );

    if (result.deletedCount === 0) return res.sendStatus(404);
    return res.sendStatus(204);
  }
};
