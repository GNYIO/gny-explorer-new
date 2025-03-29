
// this closes the dialogue when navigating to another page
export default defineNuxtRouteMiddleware((to, from) => {

    //   if (import.meta.server) return
    if (import.meta.server) return

    const dialog = useState('dialog');

    // if dialog open, close it
    if (dialog) {
        dialog.value = false;
    }

    return;
});
