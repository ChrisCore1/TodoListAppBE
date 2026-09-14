export const tagDecorator = (tag) => {
    return {
        tag_id: tag.id,
        name_tag: tag.name,
        userId: tag.user_id
    };
};

export const tagsListDecorator = (tags) => {
    return tags.map(tagDecorator);
};
