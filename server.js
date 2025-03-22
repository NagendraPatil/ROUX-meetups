const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const httpError = require('http-errors');
const bodyParser = require('body-parser');

const routes = require('./routes');
const FeedbackService = require('./services/FeedbackService');
const Speakersservice = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new Speakersservice('./data/speakers.json');

const app = express();
exports.app = app;
const port = 3000;

app.set('trust proxy', 1); //used to pass cookies in reverse proxy like nginx
app.use(
  cookieSession({
    name: 'session',
    keys: ['smkkhkhk', 'jhihu'],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.locals.siteName = 'ROUX Meetups';

app.use(express.static(path.join(__dirname, './static')));
app.use(async (req, res, next) => {
  try {
    const names = await speakersService.getNames();
    res.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use('/', routes({ feedbackService, speakersService }));

app.use((req, res, next) => {
  return next(httpError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  console.error(err);
  const status = err.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render('error');
});

app.listen(port, () => {
  console.log(`server running in port ${3000}`);
});
