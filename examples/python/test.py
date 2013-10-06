from random import randint
from reportr import Reportr

# Create a Reportr Client
client = Reportr(
	host="http://www.reportr.io",
	token="fb5dfd49-760a-4bce-bf67-fa6131283c71")

# Define model for our event
client.model("reportr", "ping",
	name="Ping",
	description="Ping tests for the Reportr API with random value.",
	icon="$message")

# Track an event
client.track("reportr", "ping", properties={
	"n": randint(0, 100)
})