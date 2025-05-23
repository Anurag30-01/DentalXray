##------------To start venv and install packages-----------------##
cd backend
python -m venv venv
venv\Scripts\Activate.ps1   # On Windows
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt

#--------Create a .env file-------#
ROBOFLOW_API_KEY=your_roboflow_api_key
GEMINI_API_KEY=your_gemini_api_key
MODEL_NAME=gemini-2.0-flash

#--Run FastAPI Server--#
uvicorn main:app --reload

#----for frontend------#
cd frontend
npm install
npm run dev
