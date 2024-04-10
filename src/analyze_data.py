import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import requests

# Load environment variables from .env file
load_dotenv("./.env")

# Create authorization headers
headers = {
    'Authorization': 'Bearer ' + os.getenv("API_SECRET_KEY")
}

# API endpoint URL
url = 'http://54.236.53.46:4000/api/dataset'

# Send GET request with headers
response = requests.get(url, headers=headers)

# Check if request was successful
if response.status_code == 200:
    # Read JSON data into DataFrame
    print("Data retrieved successfully.")
    df = pd.read_json(response.text)
    # Now you can use 'df' DataFrame for further processing
    print(df.count())
else:
    print(f"Error: Failed to retrieve data. Status code: {response.status_code}")


unNeededColumns = ['_id', '_date', '_user', 'bm_HR_max', 'bm_act_steps']
df.drop(unNeededColumns, axis=1, inplace=True)
dfClean = df.dropna()

# Split data
X = dfClean.iloc[:, -3:]
y_fm_time_scaled = StandardScaler().fit_transform(dfClean.iloc[:, 0:1])
y_fm_acc_scaled = StandardScaler().fit_transform(dfClean.iloc[:, 1:2])
y_vx_time_scaled = StandardScaler().fit_transform(dfClean.iloc[:, 2:3])
y_vx_shot_acc_scaled = StandardScaler().fit_transform(dfClean.iloc[:, 3:4])
y_vx_trg_acc_scaled = StandardScaler().fit_transform(dfClean.iloc[:, 4:5])
y_au_time_scaled = StandardScaler().fit_transform(dfClean.iloc[:, 5:6])

# Apply ravel() to flatten y
y_fm_time_scaled = np.ravel(y_fm_time_scaled)
y_fm_acc_scaled = np.ravel(y_fm_acc_scaled)
y_vx_time_scaled = np.ravel(y_vx_time_scaled)
y_vx_shot_acc_scaled = np.ravel(y_vx_shot_acc_scaled)
y_vx_trg_acc_scaled = np.ravel(y_vx_trg_acc_scaled)
y_au_time_scaled = np.ravel(y_au_time_scaled)

X_train, X_test, y_fm_time_train, y_fm_time_test, y_fm_acc_train, y_fm_acc_test, y_vx_time_train, y_vx_time_test, y_vx_shot_acc_train, y_vx_shot_acc_test, y_vx_trg_acc_train, y_vx_trg_acc_test, y_au_time_train, y_au_time_test = train_test_split(
    X, y_fm_time_scaled, y_fm_acc_scaled, y_vx_time_scaled, y_vx_shot_acc_scaled, y_vx_trg_acc_scaled, y_au_time_scaled, test_size=0.2, random_state=4217)

# Define parameter grids for each model
param_grid_lr = {'clf__fit_intercept': [True, False]}
param_grid_svm = {'clf__C': [0.1, 1, 10], 'clf__kernel': ['linear', 'rbf']}
param_grid_rf = {'clf__n_estimators': [50, 100, 200], 'clf__max_depth': [None, 10, 20]}
param_grid_knn = {'clf__n_neighbors': [3, 5, 7], 'clf__weights': ['uniform', 'distance']}

# Create pipelines for each model with scaling
pipe_lr = Pipeline([('scaler', StandardScaler()), ('clf', LinearRegression())])
pipe_svm = Pipeline([('scaler', StandardScaler()), ('clf', SVR())])
pipe_rf = Pipeline([('scaler', StandardScaler()), ('clf', RandomForestRegressor())])
pipe_knn = Pipeline([('scaler', StandardScaler()), ('clf', KNeighborsRegressor())])

# Create parameter grids dictionary for each model
param_grids = {
    'lr': (pipe_lr, param_grid_lr),
    'svm': (pipe_svm, param_grid_svm),
    'rf': (pipe_rf, param_grid_rf),
    'knn': (pipe_knn, param_grid_knn)
}

# Function to fit models and evaluate
def fit_models_and_evaluate(X_train, X_test, y_train, y_test):
    results = {}
    for model_name, (pipe, param_grid) in param_grids.items():
        grid_search = GridSearchCV(pipe, param_grid, cv=5, scoring='neg_mean_squared_error')
        grid_search.fit(X_train, y_train)
        best_model = grid_search.best_estimator_
        y_pred = best_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        results[model_name] = {
            'best_params': grid_search.best_params_,
            'best_score': -grid_search.best_score_,  # Convert back to positive MSE
            'test_mse': mse
        }
    return results

# Fit models and evaluate for each target variable
results_fm_time = fit_models_and_evaluate(X_train, X_test, y_fm_time_train, y_fm_time_test)
results_fm_acc = fit_models_and_evaluate(X_train, X_test, y_fm_acc_train, y_fm_acc_test)
results_vx_time = fit_models_and_evaluate(X_train, X_test, y_vx_time_train, y_vx_time_test)
results_vx_shot_acc = fit_models_and_evaluate(X_train, X_test, y_vx_shot_acc_train, y_vx_shot_acc_test)
results_vx_trg_acc = fit_models_and_evaluate(X_train, X_test, y_vx_trg_acc_train, y_vx_trg_acc_test)
results_au_time = fit_models_and_evaluate(X_train, X_test, y_au_time_train, y_au_time_test)

# Define a function to extract the best model for each variable
def get_best_model(results):
    best_models = {}
    for variable, result in results.items():
        best_model_name = max(result, key=lambda x: result[x]['test_mse'])
        best_models[variable] = (best_model_name, result[best_model_name]['best_params'])
    return best_models

# Extract the best models for each variable
best_models = get_best_model({
    'y_fm_time': results_fm_time,
    'y_fm_acc': results_fm_acc,
    'y_vx_time': results_vx_time,
    'y_vx_shot_acc': results_vx_shot_acc,
    'y_vx_trg_acc': results_vx_trg_acc,
    'y_au_time': results_au_time
})

def plot_actual_vs_predicted(X_test, y_test, best_model, variable):
    model_name, best_params = best_model
    pipe, _ = param_grids[model_name]
    pipe.set_params(**best_params)

    # Ensure y_test is a 1D array
    y_test = np.ravel(y_test)

    pipe.fit(X_train, globals()[f'{variable}_train'])
    y_pred = pipe.predict(X_test)

    plt.figure(figsize=(8, 6))
    plt.plot(y_test, label='Actual', color='blue')
    plt.plot(y_pred, label='Predicted', color='red', linestyle='dashed')
    plt.xlabel('Index')
    plt.ylabel('Value')
    plt.title(f'Actual vs Predicted for {variable} - {model_name}')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f'images/{variable}.png')
    plt.close()

def clear_images_folder():
    folder = './images'
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Failed to delete {file_path}. Reason: {e}")

# Clear the images folder before saving new images
clear_images_folder()

# Plot actual vs. predicted values for each variable
for variable, best_model in best_models.items():
    plot_actual_vs_predicted(X_test, globals()[f'{variable}_test'], best_model, variable)

# Save the best models and results
with open('best_models_results.txt', 'w') as file:
    for variable, best_model in best_models.items():
        file.write(f"{variable}: {best_model}\n")



# Flask app
app = Flask(__name__)
CORS(app)

# Global variable to keep track of the current image index
current_image_index = 0

# Function to get the next image filename
def get_next_image():
    global current_image_index
    image_folder = r'C:\Users\rodri\repos\exec_dash\images'
    images = [f for f in os.listdir(image_folder) if f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    if current_image_index < len(images):
        next_image = images[current_image_index]
        current_image_index += 1
        return next_image
    else:
        # Reset the index when all images are displayed
        current_image_index = 0
        if images:
            return images[current_image_index]
        else:
            return None

# Route to serve the next image
@app.route('/')
def serve_next_image():
    next_image = get_next_image()
    if next_image:
        return f'''
            <html>
                <head>
                    <style>
                        img {{
                            width: 1000px; /* Set width to your desired size */
                            height: auto; /* Maintain aspect ratio */
                        }}
                    </style>
                </head>
                <body>
                    <img src="/images/{next_image}" alt="{next_image}">
                    <br>
                    <a href="/">Next Image</a>
                </body>
            </html>
        '''
    else:
        return "No images found."

# Route to serve individual image
@app.route('/images/<path:filename>')
def serve_image(filename):
    print("Request received for:", filename)
    return send_from_directory(r'C:\Users\rodri\repos\exec_dash\images', filename)

# Run the Flask application
if __name__ == '__main__':
    app.run(port=5000)
