from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#3498db')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'created_at': self.created_at.isoformat(),
            'tasks': [task.to_dict() for task in self.tasks]
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date)
    start_date = db.Column(db.Date, default=date.today)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(10), default='medium')
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'completed': self.completed,
            'priority': self.priority,
            'project_id': self.project_id,
            'project': {
                'id': self.project.id,
                'name': self.project.name,
                'color': self.project.color
            } if self.project else None,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

# Routes
@app.route('/')
def index():
    projects = Project.query.all()
    
    # Get tasks categorized
    upcoming_tasks = Task.query.filter(
        Task.completed == False,
        Task.due_date >= date.today()
    ).order_by(Task.due_date).all()
    
    overdue_tasks = Task.query.filter(
        Task.completed == False,
        Task.due_date < date.today()
    ).order_by(Task.due_date).all()
    
    completed_tasks = Task.query.filter_by(completed=True).order_by(Task.completed_at.desc()).limit(20).all()
    
    return render_template('index.html',
                         projects=projects,
                         upcoming_tasks=upcoming_tasks,
                         overdue_tasks=overdue_tasks,
                         completed_tasks=completed_tasks,
                         date=date)


@app.route('/api/projects', methods=['GET', 'POST'])
def handle_projects():
    if request.method == 'POST':
        data = request.get_json()
        project = Project(
            name=data['name'],
            description=data.get('description', ''),
            color=data.get('color', '#3498db')
        )
        db.session.add(project)
        db.session.commit()
        return jsonify({'id': project.id, 'name': project.name, 'color': project.color})
    
    projects = Project.query.all()
    return jsonify([{
        'id': p.id, 
        'name': p.name, 
        'description': p.description,
        'color': p.color,
        'task_count': len(p.tasks)
    } for p in projects])

@app.route('/api/projects/<int:project_id>', methods=['PUT', 'DELETE'])
def handle_project(project_id):
    project = Project.query.get_or_404(project_id)
    if request.method == 'PUT':
        data = request.get_json()
        project.name = data.get('name', project.name)
        project.description = data.get('description', project.description)
        project.color = data.get('color', project.color)
        db.session.commit()
        return jsonify({'id': project.id, 'name': project.name, 'color': project.color})
    
    db.session.delete(project)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'POST':
        data = request.get_json()
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None,
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else date.today(),
            priority=data.get('priority', 'medium'),
            project_id=data['project_id']
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({'id': task.id, 'title': task.title})
    
    tasks = Task.query.all()
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'due_date': t.due_date.isoformat() if t.due_date else None,
        'start_date': t.start_date.isoformat() if t.start_date else None,
        'completed': t.completed,
        'priority': t.priority,
        'project_id': t.project_id,
        'project_name': t.project.name,
        'project_color': t.project.color
    } for t in tasks])

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def handle_task(task_id):
    task = Task.query.get_or_404(task_id)
    if request.method == 'PUT':
        data = request.get_json()
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None
        task.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else task.start_date
        task.priority = data.get('priority', task.priority)
        task.project_id = data.get('project_id', task.project_id)
        db.session.commit()
        return jsonify({'id': task.id, 'title': task.title})
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/tasks/<int:task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None
    db.session.commit()
    return jsonify({'completed': task.completed})


# Initialize database function
def init_db():
    """Initialize database with tables and sample data"""
    db.create_all()
    
    # Add sample data if no projects exist
    if Project.query.count() == 0:
        sample_projects = [
            Project(name='Web Development', description='Frontend and backend tasks', color='#e74c3c'),
            Project(name='Marketing', description='Marketing and promotion tasks', color='#2ecc71'),
            Project(name='Research', description='Research and analysis tasks', color='#9b59b6')
        ]
        
        for project in sample_projects:
            db.session.add(project)
        
        db.session.commit()
        
        # Add sample tasks
        sample_tasks = [
            Task(title='Design homepage mockup', due_date=date.today() + timedelta(days=3), project_id=1, priority='high'),
            Task(title='Implement user authentication', due_date=date.today() + timedelta(days=7), project_id=1, priority='medium'),
            Task(title='Create social media campaign', due_date=date.today() + timedelta(days=5), project_id=2, priority='low'),
            Task(title='Market research analysis', due_date=date.today() + timedelta(days=10), project_id=3, priority='medium'),
        ]
        
        for task in sample_tasks:
            db.session.add(task)
        
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        init_db()
    
    app.run(host='127.0.0.1', port=8080, debug=True)