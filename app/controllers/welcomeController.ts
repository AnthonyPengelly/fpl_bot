import { Router, Request, Response } from 'express';

import RecommendationService from '../services/recommendationService';
import PlayersService from '../services/playersService';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.sendFile(__dirname + '/index.html');
});

router.get('/recommend', (req: Request, res: Response) => {
    let promise = RecommendationService.recommendATeam();
    promise.then(function(value) {
        console.log("Successfully returned!");
        res.send(value);
    });
    promise.catch(function(reason) {
        console.log("Error:" + reason);
        res.send(reason);
    });
});

router.get('/players', (req: Request, res: Response) => {
    let promise = PlayersService.getAllPlayers();
    promise.then(function(value) {
        console.log("Successfully returned!");
        res.send(value);
    });
    promise.catch(function(reason) {
        console.log("Error:" + reason);
        res.send(reason);
    });
});

// Export the express.Router() instance to be used by server.ts
export const WelcomeController: Router = router;