const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isValidId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
   return response.status(400).json({ error: "Invalid ID."});
  }

  return next();
}

app.use('/repositories/:id', isValidId);

app.get("/repositories", (request, response) => {

  return response.send(repositories);
});

app.post("/repositories", (request, response) => {

  const { title, url, techs } = request.body;

  const repository = { id: uuid(), title, url, techs, likes: 0};
  repositories.push(repository);

  return response.send(repository);
});

app.put("/repositories/:id", (request, response) => {

  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = getRepositoryIndex(id);

  if(repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  }

  const likes = repositories[repositoryIndex].likes;

  const repositoryUpdate = {id, title, url, techs, likes};

  repositories[repositoryIndex] = repositoryUpdate;

  return response.status(200).json(repositoryUpdate);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id);

  if(repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id);

  if(repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  }

  repositories[repositoryIndex].likes++;

  return response.status(201).json({likes: repositories[repositoryIndex].likes})

});


function getRepositoryIndex(id) {

  return repositories.findIndex(repository => repository.id === id);
}

module.exports = app;
