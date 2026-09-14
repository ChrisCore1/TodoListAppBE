export const categoryDecorator = (category) => {
    return {
        category_id: category.id,
        name_category: category.name,
        userId: category.user_id,
    }
};

export const categoriesListDecorator = (categories) => {
    return categories.map(categoryDecorator);
};
