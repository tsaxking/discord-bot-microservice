import { client } from './bot';
import { setLogErrors } from 'ts-utils/check';
setLogErrors(true);
client.once('ready', () => console.log('hi!'));
