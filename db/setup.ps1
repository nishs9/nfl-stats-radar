# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run database setup
python setup_db.py

Write-Host "Setup complete! Virtual environment is activated and database is created." 