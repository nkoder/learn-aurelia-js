import {RouterConfiguration, Router} from 'aurelia-router';

export class App {
  router : Router;

  configureRouter(config : RouterConfiguration, router : Router) {
    config.title = 'Learn Aurelia';
    config.map([{
      route: ['', 'welcome'],
      name: 'welcome',
      moduleId: './welcome',
      nav: true,
      title: 'Welcome'
    }]);

    this.router = router;
  }
}