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

// Falls eigenes Styling für Primevue genutzt werden soll
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
