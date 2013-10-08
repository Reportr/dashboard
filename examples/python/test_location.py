import random
import time
from test import client

"""
Simple test for tracking location
"""

# Location base
basex = 43.9333
basey = 2.1500

sizex = 0.12
sizey = 0.12

# Create the bounding box
#set longitude values - Y values
minx = basex - sizex
maxx = basex + sizex

#set latitude values - X values
miny = basey - sizey
maxy = basey + sizey

# Define model for our event
client.model("phone", "location",
	name="Phone Locations",
	description="Locations of my phone.",
	icon="$location")

# Track location
for i in range(5000):
	print random.uniform(minx, maxx), random.uniform(miny,maxy)
	client.track("phone", "location", properties={
		"@lat": random.uniform(minx, maxx),
		"@lng": random.uniform(miny,maxy)
	})
	time.sleep(2)