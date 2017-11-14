# FaktNews Server

## Run

_Assumes `python3` and `pip3` are installed, and that the Majestic API key has been placed in `majestic-api-key` file._

In `server` directory: 

1. `pip3 install virtualenv`: Installs virtualenv Python package
2. `python3 -m venv venv`: Creates new venv, called 'venv' 
3. `source venv/bin/activate`: Source venv's binaries
4. `pip install -r requirements.txt`: Install python requirements within venv
5. `./run.sh`: Source majestic-api-key and run Flask app
