from random import randint
from reportr import Reportr

client = Reportr(host="http://localhost:5000", token="7228d11d-cdc4-4386-ad96-1db06af3623e")

client.model("message", "facebook", name="Messages facebook", description="Numbers of messages send on facebook", icon="/static/images/models/facebook.png")
print client.model("tweet", "twitter", name="Tweets", description="Numbers of tweets posted by me", icon="/static/images/models/twitter.png").text

client.track("message", "facebook", properties={
	"n": randint(0, 100)
})
client.track("tweet", "twitter", properties={
	"n": randint(0, 100)
})