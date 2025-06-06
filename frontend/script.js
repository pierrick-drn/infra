const form = document.getElementById('loginForm');
const resultat = document.getElementById('resultat');
const logoutBtn = document.getElementById('logoutBtn');

let eventsGlobaux = [];
let jourActif = null;

// Connexion
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${window.location.origin}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('username', username);
      localStorage.setItem('schedule', JSON.stringify(data.schedule));
      afficherEmploiDuTemps(username, data.schedule, data.events || []);
    } else {
      resultat.classList.remove('hidden');
      resultat.innerText = data.message || "Identifiants incorrects";
    }
  } catch (error) {
    resultat.classList.remove('hidden');
    resultat.innerText = "Erreur de connexion au serveur";
  }
});

// Déconnexion
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  form.style.display = 'flex';
  resultat.classList.add('hidden');
  logoutBtn.classList.add('hidden');
});

// Affichage emploi du temps / événements
async function afficherEmploiDuTemps(username, schedule, events = []) {
  form.style.display = 'none';
  resultat.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');

  document.getElementById('emploisDuTempsContainer').innerHTML = '';
  document.getElementById('userEvents').innerHTML = '';
  document.getElementById('calendar').innerHTML = '';
  document.getElementById('calendarEvents').innerHTML = '';

  if (username === 'admin') {
    const res = await fetch(`${window.location.origin}/api/users/schedules`);
    const users = await res.json();

    let emploiHtml = `<h2>Bienvenue ${username}</h2><h3>Plannings de tous les utilisateurs</h3>`;
    let events = [];

    for (const user of users) {
      emploiHtml += `<div class="emploi-ligne"><h4>${user.username}</h4><ul>${user.schedule.map(j => `<li>${j}</li>`).join('')}</ul></div>`;

      const resEvents = await fetch(`${window.location.origin}/api/users/get-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });

      const data = await resEvents.json();
      if (data.events && data.events.length > 0) {
        events.push(...data.events.map(ev => ({ ...ev, owner: user.username })));
      }
    }

    eventsGlobaux = events;
    document.getElementById('emploisDuTempsContainer').innerHTML = emploiHtml;
    afficherEvenementsAdmin(eventsGlobaux);
    genererCalendrier(eventsGlobaux);
  } else {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    let html = `<h2>Bienvenue ${username}</h2><h3>Emploi du temps</h3>`;
    for (let i = 0; i < jours.length; i++) {
      const heure = schedule[i] || '--';
      html += `<p>${jours[i]} : ${heure}</p>`;
    }
    document.getElementById('emploisDuTempsContainer').innerHTML = html;

    eventsGlobaux = events;
    afficherEvenements(eventsGlobaux);
    genererCalendrier(eventsGlobaux);
  }
}

// Affiche les events (utilisateur normal)
function afficherEvenements(events) {
  const container = document.getElementById('userEvents');
  if (!events.length) {
    container.innerHTML = "<p>Aucun événement</p>";
    return;
  }

  container.innerHTML = events.map((e, index) => `
    <div class="event-item">
      <strong>${e.titre}</strong> (${e.date}) - ${e.type}
      <button class="delete-btn" onclick="supprimerEvenement(${index})">🗑️</button>
    </div>
  `).join('');
}

// Affiche les events pour l’admin
function afficherEvenementsAdmin(events) {
  const container = document.getElementById('userEvents');
  if (!events.length) {
    container.innerHTML = "<p>Aucun événement</p>";
    return;
  }

  container.innerHTML = events.map((e, index) => `
    <div class="event-item">
      <strong>${e.titre}</strong> (${e.date}) - ${e.type} — <em>${e.owner}</em>
      <button class="delete-btn" onclick="supprimerEvenementAdmin('${e.owner}', ${index})">🗑️</button>
    </div>
  `).join('');
}

// Suppression événement pour utilisateur normal
async function supprimerEvenement(index) {
  const username = localStorage.getItem('username');
  const res = await fetch(`${window.location.origin}/api/users/delete-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, index })
  });

  const data = await res.json();
  if (res.ok) {
    eventsGlobaux = data.events;
    afficherEvenements(eventsGlobaux);
    genererCalendrier(eventsGlobaux);
  } else {
    alert(data.message);
  }
}

// Suppression pour admin
async function supprimerEvenementAdmin(username, index) {
  const res = await fetch(`${window.location.origin}/api/users/delete-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, index })
  });

  const data = await res.json();
  if (res.ok) {
    eventsGlobaux = eventsGlobaux.filter((_, i) => i !== index);
    afficherEvenementsAdmin(eventsGlobaux);
    genererCalendrier(eventsGlobaux);
  } else {
    alert(data.message);
  }
}

// Générer calendrier
function genererCalendrier(events = []) {
  const calendar = document.getElementById('calendar');
  const affichage = document.getElementById('calendarEvents');
  if (!calendar) return;

  calendar.innerHTML = '';
  affichage.innerHTML = '';
  const today = new Date();
  const mois = today.getMonth();
  const annee = today.getFullYear();
  const todayDate = today.getDate();

  const premierJour = new Date(annee, mois, 1).getDay();
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  for (let i = 0; i < premierJour; i++) {
    const vide = document.createElement('div');
    calendar.appendChild(vide);
  }

  for (let jour = 1; jour <= nbJours; jour++) {
    const div = document.createElement('div');
    div.classList.add('calendar-day');
    div.textContent = jour;

    const aDesEvents = events.some(e => {
      const d = new Date(e.date);
      return d.getDate() === jour && d.getMonth() === mois && d.getFullYear() === annee;
    });

    if (jour === todayDate) div.classList.add('today');
    if (aDesEvents) div.classList.add('event-day');

    div.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));
      div.classList.add('selected-day');

      const eventsJour = events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === jour && d.getMonth() === mois && d.getFullYear() === annee;
      });

      if (eventsJour.length) {
        affichage.innerHTML = `<h4>Événements du ${jour}/${mois + 1}</h4>` + eventsJour.map(e =>
          `<p><strong>${e.titre}</strong> - ${e.type} ${e.owner ? `(<em>${e.owner}</em>)` : ''}</p>`
        ).join('');
      } else {
        affichage.innerHTML = `<p>Aucun événement ce jour</p>`;
      }
    });

    calendar.appendChild(div);
  }
}

// Initialisation
window.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');

  if (username && username !== 'admin') {
    const res = await fetch(`${window.location.origin}/api/users/get-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    afficherEmploiDuTemps(username, schedule, data.events || []);
  } else if (username === 'admin') {
    afficherEmploiDuTemps('admin', [], []);
  }
});

// Gestion création d’événement
document.addEventListener('submit', async (e) => {
  if (e.target && e.target.id === 'eventForm') {
    e.preventDefault();

    const username = localStorage.getItem('username');
    const titre = document.getElementById('eventTitre').value;
    const date = document.getElementById('eventDate').value;
    const type = document.getElementById('eventType').value;

    if (!username || !titre || !date || !type) {
      alert("Tous les champs doivent être remplis.");
      return;
    }

    const res = await fetch(`${window.location.origin}/api/users/add-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, titre, date, type })
    });

    const data = await res.json();

    if (res.ok) {
      eventsGlobaux = data.events;
      if (username === 'admin') {
        afficherEvenementsAdmin(eventsGlobaux);
      } else {
        afficherEvenements(eventsGlobaux);
      }
      genererCalendrier(eventsGlobaux);
      e.target.reset();
    } else {
      alert(data.message || "Erreur lors de l'ajout.");
    }
  }
});
