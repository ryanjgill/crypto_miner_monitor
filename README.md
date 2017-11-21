# crypto_miner_monitor
Monitor temperatures of cryptocurrency mining hardware.

## Alexa integration
- "Alexa, ask Crypto Mining Monitor for tempertaure of the case/GPUs."
- "Alexa, ask Crypto Mining Monitor to restart the mining rig."


## Stack
- Express webserver running on linux device (Pi, Linkit 7688, Khadas Vim) 
  - GET routes for temperatures
  - POST route for reseting rig PSU
  - Johnny-five to communicate to MRK1000
    - Temperature probes per GPU and case
    - Relay for PSU reset

- MKR1000 
  - running firmata and communicating to linux webserver with built in wifi module through firmata/johnny-five
  - temperature probes connected to analog inputs