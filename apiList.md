# LinkSphere APIs

## authRouter
- POST /signup ->DONE
- POST /login ->DONE
- POST /logout ->DONE

## profileRouter
- GET /profile/view ->DONE
- PATCH /profile/edit ->DONE
- PATCH /profile/password ->DONE

## connectionRequestRouter
- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId


## userRouter
- GET /connections
- GET /requests/received
- GET /feed - Gets you the profile of other users
