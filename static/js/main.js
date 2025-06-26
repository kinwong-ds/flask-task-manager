// How many time-units should be visible without scrolling?
const VISIBLE_UNITS = {
    weekly : 2,  // show 2 weeks
    monthly: 2   // show 2 months
};

// returns the pixel width for ONE time-unit so that only `visibleUnits` fit the view
function calcUnitWidth(containerWidth, visibleUnits) {
    return containerWidth / visibleUnits;
}
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

function openViewTaskModalFromGantt(element) {
    const task = JSON.parse(element.dataset.task);
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

// Gantt Chart functionality
let ganttData = [];
let ganttView = 'weekly'; // 'weekly', 'monthly', or 'twoweek'

// Initialize Gantt chart on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadGanttData();
    renderGanttChart();
});

async function loadGanttData() {
    try {
        const response = await fetch('/api/gantt-data');
        ganttData = await response.json();
    } catch (error) {
        console.error('Error loading Gantt data:', error);
        ganttData = [];
    }
}

function setGanttView(view) {
    ganttView = view;
    
    // Update button states
    document.getElementById('weeklyViewBtn').classList.toggle('active', view === 'weekly');
    document.getElementById('monthlyViewBtn').classList.toggle('active', view === 'monthly');
    
    renderGanttChart();
}

function renderGanttChart() {
    const container = document.getElementById('ganttContainer');
    
    if (!ganttData || ganttData.length === 0) {
        container.innerHTML = `
            <div class="gantt-empty-state">
                <i class="fas fa-chart-gantt"></i>
                <h3>No tasks with dates found</h3>
                <p>Create tasks with both start and due dates to see them in the Gantt chart.</p>
            </div>
        `;
        return;
    }
    
    // Sort tasks by due date (earliest first)
    const sortedTasks = [...ganttData].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    // Calculate visible date range (limited view)
    const visibleDateRange = calculateDateRange(sortedTasks);
    const visibleTimeUnits = generateTimeUnits(visibleDateRange.start, visibleDateRange.end);
    
    // Calculate full date range for scrolling
    const fullDateRange = calculateFullDateRange(sortedTasks);
    const fullTimeUnits = generateTimeUnits(fullDateRange.start, fullDateRange.end);
    
    // ----- NEW: work out the “viewport” width so only N units are visible -----
    const TASK_COL_WIDTH = 200;                                     // matches CSS
    const containerWidth  = container.clientWidth - TASK_COL_WIDTH; // space left for timeline
    const unitWidth       = calcUnitWidth(
            containerWidth,
            VISIBLE_UNITS[ganttView]        // 2 weeks or 2 months
    );
    const timelineWidth   = fullTimeUnits.length * unitWidth;
    // -------------------------------------------------------------------------
    
    // Generate HTML with scrollable timeline
    container.innerHTML = `
        <div class="gantt-header">
            <div class="gantt-task-column">Tasks</div>
            <div class="gantt-timeline-wrapper">
                <div class="gantt-timeline" style="width: ${timelineWidth}px;">
                    ${fullTimeUnits.map(unit => `
                        <div class="gantt-time-unit" style="width: ${unitWidth}px;">${unit.label}</div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="gantt-body">
            <div class="gantt-rows-container">
                ${sortedTasks.map(task => renderGanttRow(task, fullDateRange, fullTimeUnits, timelineWidth)).join('')}
            </div>
            <div class="gantt-grid-lines" style="width: ${timelineWidth}px;">
                ${fullTimeUnits.map((unit, index) => `
                    <div class="gantt-grid-line ${isToday(unit.date) ? 'gantt-today-line' : ''}"
                         style="left: ${ (index + 1) * unitWidth }px"></div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Scroll to show the current visible range
    scrollToVisibleRange(visibleDateRange, fullDateRange, timelineWidth);
}
// --- keep first column fixed on horizontal scroll ---
    (function lockFirstColumn() {
        const firstColsSelector = '.gantt-task-column, .gantt-task-info';
        container.addEventListener('scroll', function () {
            const x = this.scrollLeft + 'px';
            this.querySelectorAll(firstColsSelector).forEach(el => {
                el.style.transform = `translateX(${x})`;
            });
        });
    })();

function scrollToVisibleRange(visibleRange, fullRange, timelineWidth) {
    const container = document.getElementById('ganttContainer');
    const totalDuration = fullRange.end - fullRange.start;
    const visibleStartOffset = visibleRange.start - fullRange.start;
    const scrollPosition = (visibleStartOffset / totalDuration) * timelineWidth;
    
    // Scroll to show the current time period
    setTimeout(() => {
        container.scrollLeft = Math.max(0, scrollPosition - 100); // Small offset for better visibility
        
        // Synchronize header and body scrolling
        synchronizeScrolling();
    }, 100);
}

function synchronizeScrolling() {
    const container = document.getElementById('ganttContainer');
    const timelineWrapper = container.querySelector('.gantt-timeline-wrapper');
    const ganttBody = container.querySelector('.gantt-body');
    
    if (!timelineWrapper || !ganttBody) return;
    
    // Sync body scroll to header scroll
    ganttBody.addEventListener('scroll', function() {
        if (timelineWrapper.scrollLeft !== this.scrollLeft) {
            timelineWrapper.scrollLeft = this.scrollLeft;
        }
    });
    
    // Sync header scroll to body scroll
    timelineWrapper.addEventListener('scroll', function() {
        if (ganttBody.scrollLeft !== this.scrollLeft) {
            ganttBody.scrollLeft = this.scrollLeft;
        }
    });
}

function calculateDateRange(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    let start, end;
    
    if (ganttView === 'weekly') {
        // Weekly view: start 3 days earlier, then show 2 full weeks (14 days total)
        const HALF_WEEK_OFFSET = 3;                // 3 days  ≈ ½ week

        const startOfWeek = new Date(today);
        const dayOfWeek   = today.getDay();        // 0 = Sun, 1 = Mon, …
        startOfWeek.setDate(today.getDate() - dayOfWeek);

        start = new Date(startOfWeek);
        start.setDate(start.getDate() - HALF_WEEK_OFFSET); // <-- shift left

        end   = new Date(start);
        end.setDate(end.getDate() + 13);           // two weeks span
    } else {
        // Monthly view: Start from "today - 1 week" and show 4 weeks
        start = new Date(today);
        start.setDate(today.getDate() - 7); // Today - 1 week
        
        end = new Date(start);
        end.setDate(end.getDate() + 27); // 4 weeks (28 days - 1)
    }
    
    return { start, end };
}

function calculateFullDateRange(tasks) {
    // Calculate the full range of all tasks for scrolling purposes
    if (tasks.length === 0) return { start: new Date(), end: new Date() };
    
    const startDates = tasks.map(t => new Date(t.start_date));
    const endDates = tasks.map(t => new Date(t.due_date));
    
    const minStart = new Date(Math.min(...startDates));
    const maxEnd = new Date(Math.max(...endDates));
    
    // Add some padding
    const start = new Date(minStart);
    start.setDate(start.getDate() - 7);
    
    const end = new Date(maxEnd);
    end.setDate(end.getDate() + 7);
    
    return { start, end };
}

function generateTimeUnits(startDate, endDate) {
    const units = [];
    const current = new Date(startDate);
    
    if (ganttView === 'weekly') {
        // Weekly view - show weeks
        while (current <= endDate) {
            const weekStart = new Date(current);
            const weekEnd = new Date(current);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            units.push({
                date: new Date(current),
                label: `${formatDate(weekStart, 'M/d')} - ${formatDate(weekEnd, 'M/d')}`,
                start: new Date(weekStart),
                end: new Date(weekEnd)
            });
            
            current.setDate(current.getDate() + 7);
        }
    } else {
        // Monthly view - show months
        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            
            units.push({
                date: new Date(current),
                label: formatDate(current, 'MMM yyyy'),
                start: new Date(monthStart),
                end: new Date(monthEnd)
            });
            
            current.setMonth(current.getMonth() + 1);
        }
    }
    
    return units;
}

function renderGanttRow(task, dateRange, timeUnits, timelineWidth) {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date);
    
    // Calculate position and width in pixels
    const totalDuration = dateRange.end - dateRange.start;
    const taskStartOffset = taskStart - dateRange.start;
    const taskDuration = taskEnd - taskStart;
    
    const leftPixels = (taskStartOffset / totalDuration) * timelineWidth;
    const widthPixels = Math.max(20, (taskDuration / totalDuration) * timelineWidth); // Minimum 20px width
    
    // Create task data object for the modal
    const taskData = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        start_date: task.start_date,
        due_date: task.due_date,
        completed: task.completed,
        priority: task.priority,
        project: task.project
    };
    
    return `
        <div class="gantt-row">
            <div class="gantt-task-info">
                <div class="gantt-task-title">${task.title}</div>
                <div
                  class="task-project-name"
                  style="background-color: ${task.project.color}33;">
                    ${task.project.name}
                </div>
            </div>
            <div class="gantt-timeline-container" style="width: ${timelineWidth}px;">
                <div class="gantt-bar-container">
                    <div class="gantt-bar ${task.completed ? 'completed' : ''}"
                         style="left: ${Math.max(0, leftPixels)}px;
                                width: ${widthPixels}px;
                                background-color: ${task.project.color};
                                cursor: pointer;"
                         title="${task.title} (${formatDate(taskStart, 'M/d')} - ${formatDate(taskEnd, 'M/d')})"
                         data-task='${JSON.stringify(taskData)}'
                         onclick="openViewTaskModalFromGantt(this)">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatDate(date, format) {
    const options = {
        'M/d': { month: 'numeric', day: 'numeric' },
        'MMM yyyy': { month: 'short', year: 'numeric' }
    };
    
    return date.toLocaleDateString('en-US', options[format] || {});
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// Initialize weekly view as active
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('weeklyViewBtn').classList.add('active');
});