import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', name: 'Landing Page', component: () => import('../components/page/LandingPage.vue'), meta: { title: '' } },
    { path: '/profile/login', name: 'Login', component: () => import('../components/page/Login.vue'), meta: { title: ' - Login' } },
    { path: '/profile/register', name: 'Register', component: () => import('../components/page/Register.vue'), meta: { title: ' - Register' } },
    { path: '/profile', name: 'Profile', component: () => import('../components/page/Profile.vue'), meta: { title: ' - Profile' } },
    { path: '/tournament/create', name: 'Create Tournament', component: () => import('../components/page/CreateTournament.vue'), meta: { title: ' - Create Tournament' } },
    { path: '/tournament/my-tournaments', name: 'My Tournaments', component: () => import('../components/page/MyTournaments.vue'), meta: { title: ' - My Tournaments' } },
    { path: '/tournament/joined-tournaments', name: 'Joined Tournaments', component: () => import('../components/page/JoinedTournaments.vue'), meta: { title: ' - Joined Tournaments' } },
    { path: '/tournament/tournament-list', name: 'Tournaments', component: () => import('../components/page/TournamentList.vue'), meta: { title: ' - Tournaments' } },
    { path: '/tournament/:id', name: 'Tournament', component: () => import('../components/page/Tournament.vue'), meta: { title: ' - Tournament' } },
    { path: '/tournament/add-players/:id', name: 'Add Players', component: () => import('../components/page/AddPlayers.vue'), meta: { title: ' - Add Players' } },
    { path: '/tournament/tournament-round/:id/:round?', name: 'Tournament Round', component: () => import('../components/page/TournamentRound.vue'), meta: { title: ' - Round' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from) => {
    document.title = to.meta?.title ? 'Conquest TO' + to.meta.title : 'Conquest TO'
});

export default router;