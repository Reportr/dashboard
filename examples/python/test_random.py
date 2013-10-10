import random
import time
from test import client

"""
Simple test which track random events
"""

for i in range(5000):
	client.track("random", "random%i" % random.randint(0, i), properties={})
	time.sleep(2)