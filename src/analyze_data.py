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
import seaborn as sns


load_dotenv("./.env")

hash = sys.argv[1] 

def main(hash):
    headers = {
    'Authorization': 'Bearer ' + os.getenv("API_SECRET_KEY")
    }
    df = pd.read_json(r'http://54.236.30.169:4000/api/dataset', storage_options=headers)

    unNeededColumns = ['_id', '_date', '_user', 'bm_HR_max', 'bm_act_steps']
    df.drop(unNeededColumns, axis=1, inplace=True)

    dfClean = df.dropna()

    X = dfClean.iloc[:, -3:]

    # Define targets
    targets = {
        'fm_time': dfClean.iloc[:, 0],
        'fm_acc': dfClean.iloc[:, 1],
        'visual_time': dfClean.iloc[:, 2],
        'visual_acc': dfClean.iloc[:, 3],
        'visual_trg_acc': dfClean.iloc[:, 4],
        'audio_time': dfClean.iloc[:, 5]
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
    
    results = []
    best_models = {}
    plot_paths = {}
   
    # Prepare a plot with subplots for model performance comparison
    fig, axes = plt.subplots(nrows=2, ncols=3, figsize=(18, 12))
    axes = axes.flatten()  # Flatten to easily index them

    for i, (name, (X_train, X_test, y_train, y_test)) in enumerate(splits.items()):
        model_performance = []
        min_mse = float('inf') 
        best_model_info = None

        for model_name, pipe in models.items():
            grid_search = GridSearchCV(pipe, param_grids[model_name], cv=5, scoring='neg_mean_squared_error')
            grid_search.fit(X_train, y_train.ravel())
            best_model = grid_search.best_estimator_
            y_pred = best_model.predict(X_test)
            mse = mean_squared_error(y_test.ravel(), y_pred)
            results.append({'Variable': name, 'Model': model_name, 'MSE': mse})
            model_performance.append((model_name, mse))
            
            if mse < min_mse:
                min_mse = mse
                best_model_info = (best_model, model_name, mse)
        
        best_models[name] = best_model_info

        # Plot model performance on the corresponding subplot
        performance_df = pd.DataFrame(model_performance, columns=['Model', 'MSE'])
        performance_df.set_index('Model').plot(kind='bar', ax=axes[i], title=name)
        axes[i].set_ylabel('MSE')
        axes[i].set_ylim([0, max(performance_df['MSE']) + 1])  # Adjust Y-limits for better comparison

    # Adjust layout and save the model performance plot
    plt.tight_layout()
    plt.subplots_adjust(top=0.9)
    plt.suptitle('Model Performance Comparison Across Variables - Smaller the MSE value, better performance.', size=16)
    performance_plot_path = tempfile.gettempdir() + "/" + hash + "/model_performance_comparison.png"
    plt.savefig(performance_plot_path)
    plt.close()
    plot_paths['model_performance_comparison'] = hash + "/model_performance_comparison.png"

    # Plot and save actual vs predicted for the best models
    #change background color of plot
    
    for name, (best_model, model_name, _) in best_models.items():
        _, X_test, _, y_test = splits[name]
        y_pred = best_model.predict(X_test)
        plt.rcParams.update({'figure.facecolor': 'white'})    
        plt.figure()
        plt.plot(range(len(y_test)), y_test.ravel(), label='Actual', linestyle='-', marker='o', color='blue')
        plt.plot(range(len(y_pred)), y_pred, label=f'Predicted - {model_name}', linestyle='--', marker='x', color='red')
        plt.title(f'{name} - Actual vs Predicted using {model_name}')
        plt.xlabel('Index')
        plt.ylabel('Value')
        plt.legend()
        actual_vs_predicted_path = tempfile.gettempdir() + "/" + hash + f"/{name}_actual_vs_predicted.png"
        plt.savefig(actual_vs_predicted_path)
        plt.close()
        actual_vs_predicted_path = actual_vs_predicted_path.replace("/tmp/", "")
        if name != "Model":
            plot_paths[name] = actual_vs_predicted_path

    correlation_matrix = dfClean.corr()
    plt.figure(figsize=(10, 8))
    plt.title('Correlation Matrix')
    sns.heatmap(correlation_matrix, annot=True, fmt=".2f", cmap='viridis', cbar=True, square=True, linewidths=.5)
    plt.xticks(range(len(correlation_matrix.columns)), correlation_matrix.columns, rotation=45)
    plt.yticks(range(len(correlation_matrix.columns)), correlation_matrix.columns)
    correlation_matrix_path = tempfile.gettempdir() + "/" + hash + "/correlation_matrix.png"
    plt.savefig(correlation_matrix_path)
    plt.close()
    plot_paths['correlation_matrix'] = hash + "/correlation_matrix.png"

    # # plot the correlation matrix
    # correlation_matrix = dfClean.corr()
    # plt.figure(figsize=(12, 10))    
    # plt.title('Correlation Matrix')
    # plt.imshow(correlation_matrix, cmap='viridis', interpolation='nearest')
    # plt.colorbar()
    # plt.xticks(range(len(correlation_matrix.columns)), correlation_matrix.columns, rotation=45)
    # plt.yticks(range(len(correlation_matrix.columns)), correlation_matrix.columns)
    # correlation_matrix_path = tempfile.gettempdir() + "/" + hash + "/correlation_matrix.png"
    # plt.savefig(correlation_matrix_path)
    # plt.close()
    # plot_paths['correlation_matrix'] = hash + "/correlation_matrix.png"

    return json.dumps(plot_paths)


if __name__ == "__main__":
    hash_arg = sys.argv[1] if len(sys.argv) > 1 else "default_hash"
    print(main(hash_arg))