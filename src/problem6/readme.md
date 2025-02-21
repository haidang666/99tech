# Scoreboard API Module Specification

## Features
Websocket Scoreboard Updates: to reflects the top 10 user scores in real-time.
Score Updates via API: Users gain points through an action.

## Diagram


## API Endpoints
### `GET /api/v1/leaderboard`
Returns the top 10 users with the highest scores.
Response: 
```json
{
  "data": [
    {
      "username": "user1",
      "score": 100,
      "updatedAt": "2021-01-01T00:00:00Z"
    },
  ]
}
```
Implementation Details:
  - Use redis to cache the leaderboard for 1 minute.
  - Use redis to cache min score to enter the leaderboard.

### `POST /api/v1/user/score`
Update the user's score.
Authorization JWT token is required.
Request:
```json
{
  "score": 100,
  "actionType": "type1",
}
```
Response 200:
```json
{
  "success": true,
  "message": "Score updated successfully"
}
```
Response 400:
```json
{
  "success": false,
  "message": "Invalid request"
}
```
Response 401:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
Implementation Details:
- actionType is used to verify the action and calculate the score.
- score is the score to be adjusted. always positive.
- use transaction to update the user's score.
- when a user's score is updated.
  - if the score is higher than the leaderboard min score.
    - call to update the leaderboard re-cache the leaderboard.
    - emit a leaderboard change websocket event 

## Websocket: Socket.io
### Namespace `ws/scoreboard`

- require JWT token in the socket connection header.
- using redis adapter for socket.io.
- emit a `leaderboard` event when the leaderboard is updated.    

Event Data:
```json
{
  "data": [
    {
      "username": "user1",
      "score": 100,
      "updatedAt": "2021-01-01T00:00:00Z"
    },
  ]
}
```

## Enhancements
- Add an index on the score field in the database.
- Add a rate limiter to the API.
- Add redis lock to prevent cache stampede
