import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import TestPage from '../pages/test/test-page';


const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/test': new TestPage(),
};

export default routes;
