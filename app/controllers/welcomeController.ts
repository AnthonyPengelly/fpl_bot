/* app/controllers/welcomeController.ts */

// Import only what we need from express
import { Router, Request, Response } from 'express';

import FplFetcher from '../fetchers/fplFetcher';
import RecommendationService from '../services/recommendationService';
import ScoreService from '../services/scoreService';

// Assign router to the express.Router() instance
const router: Router = Router();

// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /welcome
router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    let promise = FplFetcher.getOverview();
    promise.then(function(value) {
        console.log("Successfully returned!");
        res.send(value);
    });
    promise.catch(function(reason) {
        console.log("Error:" + reason);
        res.send(reason);
    });
});

router.get('/player/:id', (req: Request, res: Response) => {
    // Extract the name from the request parameters
    let { id } = req.params;

    let promise = FplFetcher.getPlayer(id);
    promise.then(function(value) {
        console.log("Successfully returned!");
        res.send(value);
    });
    promise.catch(function(reason) {
        console.log("Error:" + reason);
        res.send(reason);
    });
});

router.get('/myTeam/:gameweek', (req: Request, res: Response) => {
    let { gameweek } = req.params;

    let promise = FplFetcher.getMyTeam(gameweek);
    promise.then(function(value) {
        console.log("Successfully returned!");
        res.send(value);
    });
    promise.catch(function(reason) {
        console.log("Error:" + reason);
        res.send(reason);
    });
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

router.get('/score', (req: Request, res: Response) => {
    let promise = ScoreService.scoreAllPlayers();
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