export const taskDecorator = (task) => {
    const tagIds = task.tag_id ? task.tag_id.split(',') : [];
    const tagNames = task.name_tag ? task.name_tag.split(',') : [];

    const tags = tagIds.map((id, index) => ({
        tag_id: id,
        name_tag: tagNames[index]
    }));

    return{
        task_id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        category_id: task.category_id,
        category_name: task.category_name || null,
        userId: task.userId,
        tags
    };
};

export const tasksListDecorator = (tasks) => {
    return tasks.map(taskDecorator);
};
