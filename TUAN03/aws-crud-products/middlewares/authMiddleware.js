export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

export const hasRole = (role) => {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            return next();
        }
        // If admin, allow everything? Usually yes.
        if (req.session.user && req.session.user.role === 'admin') {
            return next();
        }
        res.status(403).send('Forbidden: You do not have permission.');
    };
};
