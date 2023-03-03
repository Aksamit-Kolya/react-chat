import axios from "axios";


class AuthService {

    static async auth(login, password, path) {
        return await axios.post("http://localhost:8080/api/auth/" + path, {
            login: login,
            password: password
        });
    }

    static async login(login, password) {
        // проверка учетных данных пользователя
        return await AuthService.auth(login, password, "login");
    }

    static async signUp(login, password, confirmPassword) {
        // проверка учетных данных пользователя
        if (password === confirmPassword) {
            return await AuthService.auth(login, password, "signup");
        }
        return await AuthService.auth(login, password, "signup");
    }

    logout() {
        // удаление информации об авторизации
        localStorage.removeItem('isAuthenticated');
    }

    isAuthenticated() {
        // проверка, сохранена ли информация об авторизации
        return localStorage.getItem('isAuthenticated') === 'true';
    }
}

export default AuthService;