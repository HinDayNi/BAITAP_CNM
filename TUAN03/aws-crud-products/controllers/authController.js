import * as userService from '../services/userService.js';

export const getLoginPage = (req, res) => {
    res.render('login', { title: 'Login', error: null });
};

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userService.login(username, password);
        req.session.user = user;
        res.redirect('/products');
    } catch (error) {
        res.render('login', { title: 'Login', error: error.message });
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

export const getRegisterPage = (req, res) => {
    res.render('register', { title: 'Register', error: null });
};

export const postRegister = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        await userService.register(username, password, role);
        res.redirect('/login');
    } catch (error) {
        res.render('register', { title: 'Register', error: error.message });
    }
};
