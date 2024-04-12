import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import sys
import tempfile


hash = sys.argv[1] 

def main(hash):

    # plot a simple chart to test use savefig to save the chart
    plt.plot([1, 2, 3, 4])
    plt.ylabel('some numbers')
    plt.savefig(tempfile.gettempdir() + "/" + hash + "/simple_chart.png")
    plt.close()

    return json.dumps({'test': "simple_chart.png"})

if __name__ == '__main__':
   print(main(hash))