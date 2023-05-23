const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
app.use(express.json());
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server Running at http://localhost:3003/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerList = `
    SELECT
      *
    FROM
      cricket_team`;

  const profileList = await db.all(getPlayerList);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(
    profileList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;

  const playerDetails = await db.get(playerQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(convertDbObjectToResponseObject(playerDetails));
});

app.post("/players/", async (request, response) => {
  const { playerDetails } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetails = `
        INSERT INTO
            cricket_team ( player_name, jersey_number, role)
        VALUES
            (
                "${playerName}",
                ${jerseyNumber},
                "${role}"
            )
    `;
  const dbResponse = await db.run(addPlayerDetails);
  const playerId = dbResponse.lastID;
  //response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateDbQuery = `
        UPDATE
            cricket_team
        SET
            player_name = ${playerName},
            jersey_number = ${jerseyNumber},
            role = ${role},
        WHERE
            player_id = ${playerId}
    `;
  await db.run(updateDbQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerId = `
        DELETE FROM 
            cricket_team
        WEHRE
            player_id = ${playerId}
    `;
  await db.run(deletePlayerId);
  response.send("Player Removed");
});

module.exports = app;
