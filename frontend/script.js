const form = document.getElementById('loginForm');
const resultat = document.getElementById('resultat');
const API_BASE = window.location.origin;

const logoutBtn = document.getElementById('logoutBtn');
let eventsGlobaux = [];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/api/users/login`, {
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

logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  form.style.display = 'flex';
  resultat.classList.add('hidden');
});

async function afficherEmploiDuTemps(username, schedule, events = []) {
  form.style.display = 'none';
  resultat.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');

  document.getElementById('emploisDuTempsContainer').innerHTML = '';
  document.getElementById('userEvents').innerHTML = '';
  document.getElementById('calendar').innerHTML = '';
  document.getElementById('calendarEvents').innerHTML = '';

  if (username === 'admin') {
    const res = await fetch(`${API_BASE}/api/users/schedules`);
    const users = await res.json();
    let html = `<h2>Bienvenue ${username}</h2><h3>Plannings de tous les utilisateurs</h3>`;
    users.forEach(user => {
      html += `<div><h4>${user.username}</h4><ul>${user.schedule.map(j => `<li>${j}</li>`).join('')}</ul></div>`;
    });
    document.getElementById('emploisDuTempsContainer').innerHTML = html;
  } else {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    let html = `<h2>Bienvenue ${username}</h2><h3>Emploi du temps</h3>`;
    for (let i = 0; i < jours.length; i++) {
      const heure = schedule[i] || '--';
      html += `<p>${jours[i]} : ${heure}</p>`;
    }
    document.getElementById('emploisDuTempsContainer').innerHTML = html;

    eventsGlobaux = events;
    genererCalendrier(eventsGlobaux);
    afficherEvenements(eventsGlobaux);
  }
}

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

document.addEventListener('submit', async (e) => {
  if (e.target && e.target.id === 'eventForm') {
    e.preventDefault();

    const username = localStorage.getItem('username');
    const titre = document.getElementById('eventTitre').value;
    const date = document.getElementById('eventDate').value;
    const type = document.getElementById('eventType').value;

    const res = await fetch(`${API_BASE}/api/users/add-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, titre, date, type })
    });

    const data = await res.json();
    if (res.ok) {
      eventsGlobaux = data.events;
      genererCalendrier(eventsGlobaux);
      afficherEvenements(eventsGlobaux);
      e.target.reset();
    } else {
      alert(data.message);
    }
  }
});

async function supprimerEvenement(index) {
  const username = localStorage.getItem('username');
  const res = await fetch(`${API_BASE}/api/users/delete-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, index })
  });

  const data = await res.json();
  if (res.ok) {
    eventsGlobaux = data.events;
    genererCalendrier(eventsGlobaux);
    afficherEvenements(eventsGlobaux);
  } else {
    alert(data.message);
  }
}

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
        affichage.innerHTML = `<h4>Événements du ${jour}/${mois+1}</h4>` + eventsJour.map(e =>
          `<p><strong>${e.titre}</strong> - ${e.type}</p>`
        ).join('');
      } else {
        affichage.innerHTML = `<p>Aucun événement ce jour</p>`;
      }
    });

    calendar.appendChild(div);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');

  if (username && username !== 'admin') {
    const res = await fetch(`${API_BASE}/api/users/get-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    afficherEmploiDuTemps(username, schedule, data.events || []);
  }
});
