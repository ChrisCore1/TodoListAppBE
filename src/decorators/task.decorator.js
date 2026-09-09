export const taskDecorator = (task) => {
    return{
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        categoryId: task.category_id,
        categoryName: task.category_name || null,
        userId: task.userId,
        tags: task.tags ? task.tags.split(',') : [],
    };
};

export const tasksListDecorator = (tasks) => {
    return tasks.map(taskDecorator);
};
