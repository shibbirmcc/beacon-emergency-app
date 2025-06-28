import json
import random
from datetime import datetime, timezone


names = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "David Miller",
    "Emma Wilson",
    "Frank Harris",
    "Grace Evans",
    "Hannah Moore",
    "Ivan Scott",
    "Julia Adams",
    "Kevin Turner",
    "Laura Parker",
    "Mike Hill",
    "Nina Collins",
    "Oscar Ward",
    "Paula Cooper",
    "Quentin Rogers",
    "Rachel Cook",
    "Steve Bailey",
    "Tina Richardson",
    "Ulf Simmons",
    "Vera Kelly",
    "Walter Price",
    "Xenia Howard",
    "Yusuf Patterson",
    "Zara Hughes",
    "Aaron Foster",
    "Bella Morgan",
    "Caleb Ross",
    "Diana Murphy",
    "Ethan Hughes",
    "Fiona Edwards",
    "Gavin Peterson",
    "Hailey Powell",
    "Isaac Jenkins",
    "Jasmine Bryant",
    "Kyle Hayes",
    "Lily Barnes",
    "Mason Coleman",
    "Natalie Griffin",
    "Oliver Sullivan",
    "Penelope Long",
    "Quincy Bennett",
    "Rebecca Russell",
    "Samuel Hamilton",
    "Tara Graham",
    "Umar Ellis",
    "Valerie Alexander",
    "William Gardner",
    "Xander Stone",
    "Yara Stephens",
    "Zane Carr",
    "Adrian Chapman",
    "Bethany Lane",
    "Cameron Shaw",
    "Derek Dean",
    "Elena Spencer",
    "Felix Warren",
    "Georgia Lawson",
    "Harvey Hart",
    "Isla Fox",
    "Jonah Riley",
    "Kara Hunt",
    "Leonard Brewer",
    "Molly Holland",
    "Nathan Dean",
    "Olivia Watts",
    "Patrick Ford",
    "Queenie Bates",
    "Ronan Fuller",
    "Sophie Matthews",
    "Thomas Newman",
    "Una Blake",
    "Victor Lynch",
    "Wendy Reynolds",
    "Ximena Berry",
    "Yannis Boyd",
    "Zoey Perry",
    "Abel Walton",
    "Bonnie Bishop",
    "Clark Holt",
    "Daisy Miles",
    "Elliot Cruz",
    "Faith Hoffman",
    "Graham Perkins",
    "Heidi Fleming",
    "Ian Davidson",
    "Joyce Greene",
    "Kurt Hudson",
    "Luna Barrett",
    "Miles Fleming",
    "Nora Barrett",
    "Owen Steele",
    "Phoebe Lane",
    "Quinn Barrett",
    "Riley Benson",
    "Sadie Ray",
    "Tristan Elliott",
    "Uriah Walters",
    "Vanessa Barker"
]

responder_types = [
    "Ambulance", "Doctor", "Fire Truck", "Rescue Team", "Generator", "Water Supply"
]

# Generate 100 users
users = []

for i in range(1, 101):
    user_id = str(i)
    responder_type = random.choice(responder_types)
    lat = round(random.uniform(59.3000, 59.3700), 6)
    lon = round(random.uniform(18.0200, 18.1500), 6)
    timestamp = datetime.now(timezone.utc).isoformat()

    user_doc = {
        "type": "user",
        "userId": user_id,
        "name": names[i-1],
        "userType": "responder",
        "responderType": responder_type,
        "location": {
            "lat": lat,
            "lon": lon
        },
        "status": "available",
        "lastUpdated": timestamp
    }

    users.append(user_doc)


requester_names = [
    "Elijah Norris",
    "Matilda Rose",
    "Silas Vaughn",
    "Clara Jennings",
    "Dominic Tate"
]

## Creating normal users
for i in range(1, 6):
    user_id = str(100+i)
    lat = round(random.uniform(59.3000, 59.3700), 6)
    lon = round(random.uniform(18.0200, 18.1500), 6)
    timestamp = datetime.now(timezone.utc).isoformat()

    user_doc = {
        "type": "user",
        "userId": user_id,
        "name": requester_names[i-1],
        "userType": "requester",
        "location": {
            "lat": lat,
            "lon": lon
        },
        "status": "available",
        "lastUpdated": timestamp
    }
    users.append(user_doc)


# Write users.json (CBIMPORT format)
with open("users.json", "w") as f:
    json.dump(users, f, indent=2)

print("✅ Generated users.json and user_credentials.json!")
