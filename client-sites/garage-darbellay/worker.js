// Maquette Garage Darbellay : API static-only, aucun besoin server-side.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
