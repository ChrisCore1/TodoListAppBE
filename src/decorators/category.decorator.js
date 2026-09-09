export const categoryDecorator = (category) => {
    return {
        id: category.id,
        name: category.name,
        userId: category.user_id,
    }
};

export const categoriesListDecorator = (categories) => {
    return categories.map(categoryDecorator);
};
