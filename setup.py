#!/usr/bin/env python3
"""
Setup script for Flask Task Manager
Run this script to set up the project structure and install dependencies
"""

import os
import subprocess
import sys

def create_directory_structure():
    """Create the necessary directory structure"""
    directories = [
        'templates',
        'static',
        'static/css',
        'static/js'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def create_template_files():
    """Create template files with basic structure"""
    # This would be where you'd save the HTML templates
    # For now, just create the directories
    pass

def install_dependencies():
    """Install required Python packages"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✓ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("✗ Failed to install dependencies")
        print("Please run: pip install -r requirements.txt")

def main():
    print("Setting up Flask Task Manager...")
    print("=" * 40)
    
    create_directory_structure()
    install_dependencies()
    
    print("\n" + "=" * 40)
    print("Setup complete! 🎉")
    print("\nTo run the application:")
    print("1. Save the Flask app code as 'app.py'")
    print("2. Save the HTML templates in the 'templates' directory")
    print("3. Run: python app.py")
    print("4. Open http://localhost:5000 in your browser")
    print("\nFeatures included:")
    print("• Task management with projects")
    print("• Due date tracking and overdue detection")
    print("• Priority levels (high, medium, low)")
    print("• Timeline/Gantt chart view")
    print("• SQLite database for persistence")
    print("• Responsive design")

if __name__ == "__main__":
    main()