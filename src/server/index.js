import http from 'http';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import renderApplication from './universal';
import { login, fetchUser, authenticate } from './api/auth';
import fetchPage from './api/page';
import fetchNavigation from './api/navigation';

const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = http.createServer(app);

app.get(/[/|.*\.html]$/, renderApplication);
app.post('/admin/login.html', authenticate);
app.get('/api/user.json', fetchUser);
app.get('/api/page/:slug.json', fetchPage);
app.get('/api/navigation.json', fetchNavigation);

app.use(express.static('public/assets'));
server.listen(process.env.PORT || 5000);
