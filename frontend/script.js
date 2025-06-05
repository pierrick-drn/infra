const form = document.getElementById('loginForm');
const resultat = document.getElementById('resultat');

// Fonction pour afficher emploi du temps
async function afficherEmploiDuTemps(username, schedule) {
  form.style.display = 'none';
  resultat.classList.remove('hidden');

  if (username === 'admin') {
    const res = await fetch('http://localhost:3000/api/users/schedules');
    const users = await res.json();

    let html = `<h2>Bienvenue ${username}</h2><h3>Plannings de tous les utilisateurs</h3>`;
    users.forEach(user => {
      html += `
        <div>
          <h4>${user.username}</h4>
          <ul>${user.schedule.map(j => `<li>${j}</li>`).join('')}</ul>
        </div>
      `;
    });
    resultat.innerHTML = html;
  } else {
    resultat.innerHTML = `
      <h2>Bienvenue ${username}</h2>
      <h3>Emploi du temps</h3>
      <div>
        <ul>${schedule.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    `;
  }

  // Ajout du bouton de déconnexion
  const bouton = document.createElement('button');
  bouton.textContent = "Se déconnecter";
  bouton.id = "logoutBtn";
  bouton.classList.add('centeredLogout');
  resultat.appendChild(bouton);

  bouton.addEventListener('click', () => {
    localStorage.clear();
    form.style.display = 'flex';
    resultat.innerHTML = '';
    resultat.classList.add('hidden');
  });

  // Sauvegarde locale
  localStorage.setItem('username', username);
  localStorage.setItem('schedule', JSON.stringify(schedule));
}

// Connexion
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      afficherEmploiDuTemps(username, data.schedule);
    } else {
      resultat.classList.remove('hidden');
      resultat.innerText = data.message;
    }
  } catch (error) {
    resultat.classList.remove('hidden');
    resultat.innerText = "Erreur de connexion au serveur";
  }
});
