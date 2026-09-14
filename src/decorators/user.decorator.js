export const userDecorator = (user, token) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken: token
    }
};
