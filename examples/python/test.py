from random import randint
from reportr import Reportr

# Create a Reportr Client
client = Reportr(
	host="http://localhost:5000",
	token="59c9088e-397c-44b2-a5d0-4fccea29760a")

# Define model for our event
client.model("reportr", "ping",
	name="Ping",
	description="Ping test for the Reportr API with random value.",
	icon="$message")

# Track an event
client.track("reportr", "ping", properties={
	"n": randint(0, 100)
})