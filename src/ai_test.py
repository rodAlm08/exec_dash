import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import sys
import tempfile


hash = sys.argv[1] 

def main(hash):
        
    output_dir = tempfile.mkdtemp()

    # plot a simple chart to test use savefig to save the chart
    plt.plot([1, 2, 3, 4])
    plt.ylabel('some numbers')
    plt.savefig(os.path.join(output_dir, hash, 'simple_chart.png'))
    plt.close()

    return json.dumps({'test': "simple_chart.png"})

if __name__ == '__main__':
    main(sys.argv[1])