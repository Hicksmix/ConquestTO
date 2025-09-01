/**
 * Store zum Anzeigen von Toasts.
 * Wird benötigt, da useToast nicht direkt im Axios Interceptor eingebunden werden kann
 */
import { reactive, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

// Reaktiver Zustand für Toast-Nachrichten
export const toastStore = reactive({
    toasts: [] // Enthält die Liste der Toast-Nachrichten
});

// Funktion zum Verwenden des Toast-Stores
export const useToastStore = () => {
    const toast = useToast(); // Zugriff auf die Toast-Funktionalität von PrimeVue

    // Beobachtet Änderungen in der Toast-Liste und zeigt neue Toasts an
    watch(
        toastStore.toasts,
        (toasts) => {
            if (toasts.length) {
                // Fügt die neueste Toast-Nachricht hinzu und zeigt sie an
                toast.add({ life: 5000, ...toasts[toasts.length - 1] });
                // Entfernt die angezeigte Nachricht aus der Liste
                toasts.pop();
            }
        }
    );
};
