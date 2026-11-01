// Troque aqui se o seu usuário do GitHub mudar
const GITHUB_USER = "SEU-USUARIO-GITHUB";

const starsEl = document.getElementById("stars-count");
const followersEl = document.getElementById("followers-count");
const projectsEl = document.getElementById("projects");

// Evita escrever HTML vindo da API diretamente na página
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

async function loadGithubData() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("Falha ao consultar a API do GitHub");

    const user = await userRes.json();
    const repos = await reposRes.json();

    // Seguidores
    followersEl.textContent = user.followers;

    // Estrelas (soma de todos os repositórios, sem contar forks)
    const own = repos.filter((repo) => !repo.fork);
    const totalStars = own.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    starsEl.textContent = totalStars;

    // Projetos: os 3 com mais estrelas (desempate: mais recente)
    // O repositório do perfil (seu-usuario/seu-usuario) fica de fora
    const top = own
      .filter((repo) => repo.name.toLowerCase() !== GITHUB_USER.toLowerCase())
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 3);

    if (top.length > 0) {
      projectsEl.innerHTML = top
        .map(
          (repo) => `
          <a class="project" href="${repo.html_url}" target="_blank" rel="noopener">
            <strong>${escapeHtml(repo.name)}</strong>
            <span>${escapeHtml(repo.description || "Sem descrição ainda")}</span>
          </a>`
        )
        .join("");
    }
  } catch (error) {
    // Se a API falhar (limite de requisições, sem internet...), a página continua funcionando
    console.warn(error);
  }
}

loadGithubData();
