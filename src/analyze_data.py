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
from dotenv import load_dotenv
import requests
import json
import sys
import tempfile


load_dotenv("./.env")

hash = sys.argv[1] 

def main(hash):
    headers = {
    'Authorization': 'Bearer ' + os.getenv("API_SECRET_KEY")
    }
    df = pd.read_json(r'http://52.204.70.204:4000/api/dataset', storage_options=headers)

    unNeededColumns = ['_id', '_date', '_user', 'bm_HR_max', 'bm_act_steps']
    df.drop(unNeededColumns, axis=1, inplace=True)

    dfClean = df.dropna()

    X = dfClean.iloc[:, -3:]

    # Define targets
    targets = {
        'FM Time': dfClean.iloc[:, 0],
        'FM Acc.': dfClean.iloc[:, 1],
        'Visual Time': dfClean.iloc[:, 2],
        'Visual Acc.': dfClean.iloc[:, 3],
        'Visual trg Acc.': dfClean.iloc[:, 4],
        'Audio Time': dfClean.iloc[:, 5]
    }

  
    # Scale targets
    scaler = StandardScaler()
    scaled_targets = {name: scaler.fit_transform(target.values.reshape(-1, 1)) for name, target in targets.items()}

    # Split the data
    splits = {name: train_test_split(X, scaled, test_size=0.2, random_state=4217) for name, scaled in scaled_targets.items()}


    # Model configurations
    models = {
        'Linear Regression': Pipeline([('scaler', StandardScaler()), ('clf', LinearRegression())]),
        'SVM': Pipeline([('scaler', StandardScaler()), ('clf', SVR())]),
        'Random Forest': Pipeline([('scaler', StandardScaler()), ('clf', RandomForestRegressor())]),
        'KNN': Pipeline([('scaler', StandardScaler()), ('clf', KNeighborsRegressor())])
    }

    param_grids = {
        'Linear Regression': {'clf__fit_intercept': [True, False]},
        'SVM': {'clf__C': [0.1, 1, 10], 'clf__kernel': ['linear', 'rbf']},
        'Random Forest': {'clf__n_estimators': [50, 100, 200], 'clf__max_depth': [None, 10, 20]},
        'KNN': {'clf__n_neighbors': [3, 5, 7], 'clf__weights': ['uniform', 'distance']}
    }


    best_models = {}
    results = []

    for name, (X_train, X_test, y_train, y_test) in splits.items():
        min_mse = float('inf')
        best_model_info = None
        for model_name, pipe in models.items():
            grid_search = GridSearchCV(pipe, param_grids[model_name], cv=5, scoring='neg_mean_squared_error')
            grid_search.fit(X_train, y_train.ravel())
            best_model = grid_search.best_estimator_
            y_pred = best_model.predict(X_test)
            mse = mean_squared_error(y_test.ravel(), y_pred)
            results.append({'Variable': name, 'Model': model_name, 'MSE': mse})
            if mse < min_mse:
                min_mse = mse
                best_model_info = best_model
        best_models[name] = best_model_info

    # Ensure directory exists
    output_dir = os.path.join(tempfile.gettempdir(), hash)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Plotting actual vs predicted for the best models using line plots and saving them
    plot_paths = {}
    for name, model in best_models.items():
        _, X_test, _, y_test = splits[name]
        y_pred = model.predict(X_test)
        plt.figure()
        plt.plot(range(len(y_test)), y_test.ravel(), label='Actual', linestyle='-', marker='o', color='blue')
        plt.plot(range(len(y_pred)), y_pred, label='Predicted', linestyle='--', marker='x', color='red')
        plt.title(f'{name} - Actual vs Predicted')
        plt.xlabel('Index')
        plt.ylabel('Value')
        plt.legend()
        plot_path = os.path.join(output_dir, f"{name}.png")
        plt.savefig(plot_path)
        plt.close()
        plot_paths[name] = plot_path

    return json.dumps(plot_paths)


if __name__ == "__main__":
    hash_arg = sys.argv[1] if len(sys.argv) > 1 else "default_hash"
    print(main(hash_arg))