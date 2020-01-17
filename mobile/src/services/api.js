import axios from "axios";

const api = axios.create({
  baseURL:
    "https://3333-db4fa8e8-57bd-41bb-93de-f817e26bf5a8.ws-us02.gitpod.io/"
});

export default api;
