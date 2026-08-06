const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  // Проксіуємо лише API-підшляхи /game, а не базовий /game.
  // Це дозволяє historyApiFallback обслуговувати /game для SPA-перезавантажень.
  app.use(
    '/game',
    createProxyMiddleware(
      (pathname) => pathname !== '/game' && pathname !== '/game/',
      {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    )
  );
};
