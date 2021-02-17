# PEPLINK GPS LOCATION OVER SOCKET EXAMPLE
# By MARTIN LANGMAID
# 15th May 2017
import socket
import sys
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#Connect to the device on the right Ip & port
client_socket.connect(("192.168.1.1", 60660))
thedata=""
a = True
while a:
	#Whilst we're recieveing data from the socket...
	data = client_socket.recv(1024)
	# make sure we actually have something.
	if len(data) > 0:
		#decode the data from byte to string to make working with it easier
		thedata=data.decode('ascii')
		# split the data into a list of lines
		lines = thedata.splitlines(1)
		# iterate over each line
		for line in lines:
			#Data sent is coimma delimited so lets split it
			gpsstring = line.split(',')
			#if the first column contains $GPRMC we have hit paydirt
			if gpsstring[0] == '$GPRMC' :
				#Get the Lat and Long
				print (gpsstring[3] + gpsstring[4])
				a = False
sys.exit(0)