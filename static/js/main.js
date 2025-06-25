document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card').forEach(card => {
        const color = card.dataset.color;
        card.style.borderColor = color;
        card.style.backgroundColor = color + '1A';
    });

    document.querySelectorAll('.task-item-preview').forEach(item => {
        const color = item.dataset.color;
        item.style.borderLeftColor = color;
    });

    document.querySelectorAll('.task-item').forEach(item => {
        const color = item.dataset.color;
        item.style.borderLeftColor = color;
        item.style.backgroundColor = color + '1A';
    });
});

function openViewTaskModal(button) {
    const task = JSON.parse(button.dataset.task);
    const content = document.getElementById('viewTaskContent');
    content.innerHTML = `
        <h3>${task.title}</h3>
        <p><strong>Project:</strong> ${task.project.name}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Due Date:</strong> ${task.due_date}</p>
        <p><strong>Description:</strong></p>
        <p>${task.description || 'No description provided.'}</p>
    `;
    openModal('viewTaskModal');
}