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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                closeModal(modal.id);
            }
        });
    }
});

function openViewTaskModal(button) {
    const task = JSON.parse(button.dataset.task);
    const content = document.getElementById('viewTaskContent');
    
    // Format the due date nicely
    let dueDateText = 'Not set';
    if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDateText = dueDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Format the start date nicely
    let startDateText = 'Not set';
    if (task.start_date) {
        const startDate = new Date(task.start_date);
        startDateText = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    content.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">${task.title}</h3>
            <p style="margin: 0;"><strong>Project:</strong> ${task.project ? task.project.name : 'No project'}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
                <p style="margin: 0.5rem 0;"><strong>Priority:</strong> <span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></p>
                <p style="margin: 0.5rem 0;"><strong>Status:</strong> ${task.completed ? 'Completed' : 'Active'}</p>
            </div>
            <div>
                <p style="margin: 0.5rem 0;"><strong>Start Date:</strong> ${startDateText}</p>
                <p style="margin: 0.5rem 0;"><strong>Due Date:</strong> ${dueDateText}</p>
            </div>
        </div>
        
        <div>
            <p style="margin-bottom: 0.5rem;"><strong>Description:</strong></p>
            <div style="background-color: #f8f9fa; padding: 1rem; border-radius: 4px; border-left: 3px solid ${task.project ? task.project.color : '#3498db'};">
                ${task.description || 'No description provided.'}
            </div>
        </div>
    `;
    openModal('viewTaskModal');
}