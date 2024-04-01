import sys
import json
import matplotlib.pyplot as plt
import numpy as np
import base64
from io import BytesIO

def generate_plot(selected_columns):
    # For the purpose of this demonstration, we're not using selected_columns
    # directly to generate the plot. In a real scenario, you should use this
    # data to filter or select the appropriate data for analysis.

    # Generating some random data for the plot
    x = np.linspace(0, 10, 100)
    y = np.sin(x) + np.random.normal(0, 0.1, 100)  # Sin wave with some noise

    plt.figure(figsize=(10, 6))
    plt.plot(x, y, label='Data')
    plt.title('Sample Data Analysis')
    plt.xlabel('X Axis')
    plt.ylabel('Y Axis')
    plt.legend()

    # Save the plot to a BytesIO object in memory (as PNG)
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)  # Seek to the start of the BytesIO object

    # Encode the image in memory as Base64 and decode it to a string
    img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')

    return img_base64

if __name__ == '__main__':
    # The first command-line argument is the script name, the second is the JSON data
    data_str = sys.argv[1]
    data = json.loads(data_str)

    # The 'data' variable now contains the JSON data as a Python dictionary
    # For simplicity, let's assume 'columns' is part of the data structure
    selected_columns = data.get('columns', [])

    # Generate the plot
    plot_base64 = generate_plot(selected_columns)

    # Print the Base64 encoded plot
    print(plot_base64)
