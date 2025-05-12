import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', name: 'Login', component: () => import('../components/page/Login.vue'), meta: { title: 'Login' } },
    { path: '/profile/login', name: 'Login', component: () => import('../components/page/Login.vue'), meta: { title: 'Login' } },
    { path: '/profile/register', name: 'Register', component: () => import('../components/page/Register.vue'), meta: { title: 'Register' } },
    { path: '/tournament/create', name: 'Create Tournament', component: () => import('../components/page/CreateTournament.vue'), meta: { title: 'Create Tournament' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from) => {
    document.title = to.meta?.title ? 'Conquest TO - ' + to.meta.title : 'Conquest TO'
});

export default router;