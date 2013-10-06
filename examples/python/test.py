from random import randint
from reportr import Reportr

client = Reportr(host="http://localhost:5000", token="59c9088e-397c-44b2-a5d0-4fccea29760a")

client.model("reportr", "ping", name="Ping", description="Ping test for the Reportr API with random value.", icon="$message")

client.track("reportr", "ping", properties={
	"n": randint(0, 100)
})