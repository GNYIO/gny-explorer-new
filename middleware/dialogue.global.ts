
// this closes the dialogue when navigating to another page
export default defineNuxtRouteMiddleware((to, from) => {

    const dialog = useState('dialog');

    // if dialog open, close it
    if (dialog) {
        dialog.value = false;
    }

    return;
});
