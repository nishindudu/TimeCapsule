# TimeCapsule Web
A website for creating and viewing time capsules with messages to be opened at a specified date.

## Features
- Create time capsules with a message and a future open date.
- View time capsules by entering their unique ID.

## Technologies Used
- Python
- Flask
- HTML/CSS/JS

## Setup Instructions
1. Clone this repository.
    ```
    git clone https://github.com/nishindudu/TimeCapsule.git
    ```

2. Navigate to the project directory and create a virtual environment.
    ```
    cd TimeCapsule
    python -m venv .venv
    ```

3. Activate the virtual environment.
    - On Windows:
        ```
        .venv\Scripts\activate
        ```
    - On macOS/Linux:
        ```
        source .venv/bin/activate
        ```

4. Install the required dependencies.
    ```
    pip install -r requirements.txt
    ```

5. Set environment variables for the database.<br>
    DATABASE_URL<br>
    TOKEN
    

6. Run the application.
    ```
    py main.py
    ```

    or 

    ```
    waitress-serve --listen=*:5000 main:app
    ```


7. Open your web browser and navigate to `http://localhost:5000` to access the TimeCapsule web application.


## Live Demo

Visit [`https://timecapsule-vxdi.onrender.com/`](https://timecapsule-vxdi.onrender.com/) to see the live demo.

## AI Usage

AI was used to suggest features and improvements.