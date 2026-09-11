export const normalizedTags = (tags) => {
    const normalized = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    return normalized;
};
