export const tagDecorator = (tag) => {
    return {
        id: tag.id,
        name: tag.name,
        userId: tag.user_id
    };
};

export const tagsListDecorator = (tags) => {
    return tags.map(tagDecorator);
};
