import { objectState } from "../../../Redux/Levels/Tilemap/tilemapReducer";
import Data from "../Data/Data";
import Game from "../Game";
import { aStar, canvasCoordsToTileCoords, Coordinates, node, selectRandomLocation } from "../Utils/Algorithms";
import Character from "./Character";
import EntityTemplate from "./EntityTemplate";

class Enemy extends EntityTemplate
{
    // states
    private static THINK_STATE = 0;
    private static ROAMING_STATE = 1
    private static ATTACK_STATE = 2;

    // directions
    private static UP_DIRECTION = 0;
    private static DOWN_DIRECTION = 1;
    private static LEFT_DIRECTION = 2;
    private static RIGHT_DIRECTION = 3;

    state: number;
    range: number;
    roamingRange: number;

    target: Character | Coordinates | undefined;

    currentPath: node[] | undefined;
    direction: number | undefined;
    walked: number = 0;

    timeout: number = 0;
    lastTime: number = 0;

    static thinkTime: number = 8000;
    static speed: number = 0.8;

    vision: Game["checkSurroundings"];

    public constructor(object: objectState, vision: Game["checkSurroundings"])
    {
        super(object);

        this.state = Enemy.THINK_STATE;
        this.range = 4;
        this.roamingRange = 4;

        this.vision = vision;

    }

    public update(): void
    {
        switch(this.state)
        {
        case Enemy.THINK_STATE:
            if (this.timeout > 0)
            {
                let now = window.performance.now();
                this.timeout -= (now-this.lastTime);
                break;
            }
            this.timeout = 0;

            this.target = this.checkForTarget();

            if (!this.target)
            {
                this.target = selectRandomLocation(this.roamingRange, this.x, this.y);
                if (this.target)
                {
                    this.currentPath = aStar(this.x, this.y, this.target.x, this.target.y);
                    this.state = Enemy.ROAMING_STATE;
                }
            } else {
                this.state = Enemy.ATTACK_STATE;
            }
            break;
        case Enemy.ROAMING_STATE:
            this.target = this.checkForTarget();

            if (!this.target && (this.currentPath && this.currentPath.length > 0)) // and roam location hasn't been reached
            {
                this.moveAlongPath();
            }
            else if (this.target)
            {
                this.state = Enemy.ATTACK_STATE;
            }
            else
            {
                this.state = Enemy.THINK_STATE;
                this.lastTime = window.performance.now();
                this.timeout = Enemy.thinkTime;

            }
            break;
        case Enemy.ATTACK_STATE:
            if (!this.target)
            {
                this.state = Enemy.THINK_STATE;
                this.lastTime = window.performance.now();
                this.timeout = Enemy.thinkTime;
                break;
            }

            let targetX = this.target.x;
            let targetY = this.target.y;

            // Update path
            // Continue moving
            break;
        }
    }
    
    private moveAlongPath()
    {
        // Convert our coordinates
        let coords = canvasCoordsToTileCoords(this.x, this.y);

        if (!this.direction && coords && this.currentPath)
        {
            let nextNode = this.currentPath[0];
            if (nextNode.x > coords.x)
            {
                this.direction = Enemy.RIGHT_DIRECTION;
            }
            else if (nextNode.x < coords.x)
            {
                this.direction = Enemy.LEFT_DIRECTION;
            }
            else if (nextNode.y > coords.y)
            {
                this.direction = Enemy.DOWN_DIRECTION;
            }
            else if (nextNode.y < coords.y)
            {
                this.direction = Enemy.UP_DIRECTION;
            }
        }

        // Move our enemy
        switch(this.direction)
        {
        case Enemy.UP_DIRECTION:
            this.y -= Enemy.speed;
            break;
        case Enemy.DOWN_DIRECTION:
            this.y += Enemy.speed;
            break;
        case Enemy.LEFT_DIRECTION:
            this.x -= Enemy.speed;
            break;
        case Enemy.RIGHT_DIRECTION:
            this.x += Enemy.speed;
            break;
        }
        this.walked += Enemy.speed;

        // Grab current map
        let data = Data.getInstance();
        let gameData = data.getGameData();
        let config = data.getConfig();
        if (!gameData || !config)
            return undefined;

        // Grab tilesize
        let {tileWidth, tileHeight} = gameData[config.currentLevelId][config.currentSceneId].tileset;

        if (this.walked > tileWidth && this.currentPath)
        {
            this.currentPath.splice(0, 1);
            this.walked = 0;
            this.direction = undefined;
        }
    }

    private checkForTarget(): Character | undefined
    {
        let entities = this.vision(this.range, this.x, this.y);
        for (const entity of entities)
        {
            if (entity instanceof Character)
            {
                return entity;
            }
        }
        return undefined;
    }
}

export default Enemy;