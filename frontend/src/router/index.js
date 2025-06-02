import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', name: 'Landing Page', component: () => import('../components/page/LandingPage.vue'), meta: { title: '' } },
    { path: '/profile/login', name: 'Login', component: () => import('../components/page/Login.vue'), meta: { title: ' - Login' } },
    { path: '/profile/register', name: 'Register', component: () => import('../components/page/Register.vue'), meta: { title: ' - Register' } },
    { path: '/tournament/create', name: 'Create Tournament', component: () => import('../components/page/CreateTournament.vue'), meta: { title: ' - Create Tournament' } },
    { path: '/tournament/my-tournaments', name: 'My Tournaments', component: () => import('../components/page/MyTournaments.vue'), meta: { title: ' - My Tournaments' } },
    { path: '/tournament/:id', name: 'Tournament', component: () => import('../components/page/Tournament.vue'), meta: { title: ' - Tournament' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from) => {
    document.title = to.meta?.title ? 'Conquest TO' + to.meta.title : 'Conquest TO'
});

export default router;