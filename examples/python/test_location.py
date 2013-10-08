import random
import time
from test import client

"""
Simple test for tracking location
"""

# Create the bounding box
#set longitude values - Y values
minx = -180
maxx = 180

#set latitude values - X values
miny = -23.5
maxy = 23.5

# Define model for our event
client.model("phone", "location",
	name="Phone Location",
	description="Locations of my phone.",
	icon="$location")

# Track location
for i in range(5000):
	client.track("phone", "location", properties={
		"@lat": random.uniform(minx, maxx),
		"@lng": random.uniform(miny,maxy)
	})
	time.sleep(2)