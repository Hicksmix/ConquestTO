import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    //{ path: '/profile/login', name: 'Login', component: () => import('../components/page/Login.vue'), meta: { title: 'Login' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from) => {
    document.title = to.meta?.title ? 'Conquest TO - ' + to.meta.title : 'Conquest TO'
});

export default router;