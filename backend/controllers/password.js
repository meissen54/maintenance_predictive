const validatePassword = (password) => {
    const minLength = 8;
    const regexUppercase = /[A-Z]/;
    const regexLowercase = /[a-z]/;
    const regexDigit = /[0-9]/;
    const regexSpecialChar = /[@$!%*?&]/;

    if (password.length < minLength) {
        return { valid: false, message: "Le mot de passe doit contenir au moins 8 caractères." };
    }
    if (!regexUppercase.test(password)) {
        return { valid: false, message: "Le mot de passe doit contenir au moins une lettre majuscule." };
    }
    if (!regexLowercase.test(password)) {
        return { valid: false, message: "Le mot de passe doit contenir au moins une lettre minuscule." };
    }
    if (!regexDigit.test(password)) {
        return { valid: false, message: "Le mot de passe doit contenir au moins un chiffre." };
    }
    if (!regexSpecialChar.test(password)) {
        return { valid: false, message: "Le mot de passe doit contenir au moins un caractère spécial (@, $, !, %, *, ?, &)." };
    }

    return { valid: true, message: "Mot de passe valide." };
};

module.exports = { validatePassword };
