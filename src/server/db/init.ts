import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Topic } from './forum/models/topic';

const dbName = 'dungeonCrawler',
    username = undefined,
    password = undefined,
    host = 'localhost',
    port = 5432

export const createSequelize = (): Sequelize => {
    const sequelizeOptions: SequelizeOptions = {
        host,
        port,
        username,
        password,
        database: dbName,
        dialect: 'postgres'
    };
    
    const db = new Sequelize(sequelizeOptions);
    db.addModels([Topic])
    
    return db
}
