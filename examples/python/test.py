import time 
from random import randint
from reportr import Reportr

# Create a Reportr Client
client = Reportr(
	host="http://localhost:5000",
	token="9deab9d0-2f2a-4e6a-ae05-5451cbbf2973")

# Define model for our event
client.model("reportr", "ping",
	name="Ping",
	description="Ping tests for the Reportr API with random value.",
	icon="$message")

# Track an event
for i in range(5000):
	client.track("reportr", "ping", properties={
		"i": i,
		"n": randint(0, 100)
	})
	time.sleep(0.4)