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

    y_fm_time = dfClean.iloc[:, 0:1]
    y_fm_acc = dfClean.iloc[:, 1:2] 
    y_vx_time = dfClean.iloc[:, 2:3]
    y_vx_shot_acc = dfClean.iloc[:, 3:4]
    y_vx_trg_acc = dfClean.iloc[:, 4:5]
    y_au_time = dfClean.iloc[:, 5:6]    

    scaler = StandardScaler()

    y_fm_time_scaled = scaler.fit_transform(y_fm_time)
    y_fm_acc_scaled = scaler.fit_transform(y_fm_acc)
    y_vx_time_scaled = scaler.fit_transform(y_vx_time)
    y_vx_shot_acc_scaled = scaler.fit_transform(y_vx_shot_acc)
    y_vx_trg_acc_scaled = scaler.fit_transform(y_vx_trg_acc)
    y_au_time_scaled = scaler.fit_transform(y_au_time)

    # Split the data
    # X_train, X_test, y_fm_time_train, y_fm_time_test, y_fm_acc_train, y_fm_acc_test, y_vx_time_train, y_vx_time_test, y_vx_shot_acc_train, y_vx_shot_acc_test, y_vx_trg_acc_train, y_vx_trg_acc_test, y_au_time_train, y_au_time_test = train_test_split(X, y_fm_time_scaled, y_fm_acc_scaled, y_vx_time_scaled, y_vx_shot_acc_scaled, y_vx_trg_acc_scaled, y_au_time_scaled, test_size=0.2, random_state=4217)
    # Splitting the dataset for each target separately
    X_train, X_test, y_fm_time_train, y_fm_time_test = train_test_split(X, y_fm_time_scaled, test_size=0.2, random_state=4217)
    X_train, X_test, y_fm_acc_train, y_fm_acc_test = train_test_split(X, y_fm_acc_scaled, test_size=0.2, random_state=4217)
    X_train, X_test, y_vx_time_train, y_vx_time_test = train_test_split(X, y_vx_time_scaled, test_size=0.2, random_state=4217)
    X_train, X_test, y_vx_shot_acc_train, y_vx_shot_acc_test = train_test_split(X, y_vx_shot_acc_scaled, test_size=0.2, random_state=4217)
    X_train, X_test, y_vx_trg_acc_train, y_vx_trg_acc_test = train_test_split(X, y_vx_trg_acc_scaled, test_size=0.2, random_state=4217)
    X_train, X_test, y_au_time_train, y_au_time_test = train_test_split(X, y_au_time_scaled, test_size=0.2, random_state=4217)


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
    
    best_models = {}
    results = []
 
        
    for (y_train, y_test, y_variable) in [
        (y_fm_time_train, y_fm_time_test, 'FM Time'), 
        (y_fm_acc_train, y_fm_acc_test, 'FM Acc.'), 
        (y_vx_time_train, y_vx_time_test, 'Visual Time'), 
        (y_vx_shot_acc_train, y_vx_shot_acc_test, 'Visual Acc.'), 
        (y_vx_trg_acc_train, y_vx_trg_acc_test, 'Visual trg Acc.'), 
        (y_au_time_train, y_au_time_test, 'Audio Time')]: 
        
        min_mse = float('inf')
        best_model_info = None
        for model_name, (pipe, param_grid) in param_grids.items():
            grid_search = GridSearchCV(pipe, param_grid, cv=5, scoring='neg_mean_squared_error')
            grid_search.fit(X_train, y_train)
            best_model = grid_search.best_estimator_
            y_pred = best_model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            results.append({'Variable': y_variable, 'Model': model_name, 'MSE': mse})
            

    # Convert results to a DataFrame
    df_results = pd.DataFrame(results) 

    # Pivot the DataFrame to better format for plotting
    pivot_df = df_results.pivot(index='Variable', columns='Model', values='MSE')

    # Plotting
    pivot_df.plot(kind='bar', figsize=(14, 8), ylabel='Mean Squared Error', title='Comparison of MSE Across Models and Variables')
    plt.xticks(rotation=45)
    plt.legend(title='Model')
    plt.tight_layout()  
    plt.show()
    
    



    return json.dumps({'model': model_name})


def get_best_model(results):
    best_models = {}
    for variable, result in results.items():
        best_model_name = max(result, key=lambda x: result[x]['test_mse'])
        best_models[variable] = (best_model_name, result[best_model_name]['best_params'])
    return best_models




if __name__ == "__main__":
    print(main(hash))