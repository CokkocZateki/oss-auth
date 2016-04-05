## EVE Online - OSS Auth

# THIS README IS DEPRECATED

What is it?
http://puu.sh/f5Gfd/2738bf4daa.png
http://puu.sh/f5Ha1/834b57620c.png
http://puu.sh/f8Dnd/5f1c10107b.png


### Requirements:
 - Meteor
 - Node.js
 - MongoDB

### Getting started
1. git clone http://git.ermer.de/eve/auth.git
2. Create settings.json in root (content see below)
3. Run Meteor

#### Run Meteor:
ROOT_URL=https://domain meteor --production --settings settings.json

#### settings.json content:

isDev prevents cronJobs.

```
{
  "isDev": 1, 
  "allianceID": "alliance id",
  "api": {
    "keyID": "keyid with standings access",
    "vCode": "vcode of said key",
    "characterID": "character to use standings from"
  },
  "email": {
    "smtp": "smtp://user:pw@mail.bos.gs:25",
    "from": "The OSS - AUTH <auth@bos.gs>"
  },
  "public": {
    "publicJabber": 1
  }
}

```