import {createApp} from 'vue'
import App from './App.vue'
import './assets/style.scss';
import router from './router';
import pinia from './store';
import './axios';
import './assets/main.css';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import {definePreset} from '@primevue/themes';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// Siehe https://primevue.org/theming/styled/
const MyPreset = definePreset(Aura, {
    components: {
        dialog: {
            background: 'var(--color-background-dark)',
            color: 'var(--color-heading)',
            border: {
                color: 'transparent',
                radius: '0.25rem',
            }
        },
        datatable: {
            headerCell: {
                background: 'var(--color-background-soft)',
                color: 'var(--color-text-light)',
                padding: '0.35rem 0.5rem'
            },
            row: {
                background: 'transparent',
                color: 'var(--color-text)',
            },
            bodyCell: {
                padding: '0.35rem 0.5rem'
            }
        }
    }
});

export const app = createApp(App)
app.use(router).use(pinia).use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: false,
        }
    }
}).use(ConfirmationService).use(ToastService);
app.mount('#app');
