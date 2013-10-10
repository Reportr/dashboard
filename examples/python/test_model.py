import random
import time
from test import client

"""
Simple test which define a model without event
"""

# Define model for our event
client.model("test", "model",
	name="Test model",
	description="Test model.",
	icon="$location")