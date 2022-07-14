# Server Module

The server module replaces guard functionality that existed in the SiteGenesis JavaScript Controllers (SGJC) reference application. The server module also provides a different approach to extensibility that is new to Storefront Reference Architecture (SFRA).

The server module uses a modern JavaScript approach and borrows heavily from NodeJS's [Express](http://expressjs.com/). It also provides features specific to SFRA.

The server module registers routes that create a mapping between a URL and the code the server runs in response. For example:

```js
var server = require('server');

server.get('Show', function(req, res, next) {
    res.json({ value: 'Hello World'});
    next();
});

module.exports = server.exports();
```

If you save this code to a file named `Page.js`, you register a new route for the URL matching this pattern:

`http://sandbox-host-name/on/demandware.store/site-name/en_US/Page-Show.`

Whenever that URL is requested, the function you passed to `server.get` is executed and renders a page whose body is `{ value: 'Hello World '}` and whose content-type is `Content-Type: application/json`.

The first parameter of the `server.get` and `server.post` functions is always the name of the route (the URL endpoint). The last parameter is always the main function for the endpoint. In between these parameters, you can add as many parameters as you need.

For example, you could add the `server.middleware.https` parameter after the `Show` paramenter to limit the route only to HTTPS requests.

Each parameter that you add specifies a corresponding function. The functions are executed in left-to-right order. Each function can either execute the next function (by calling `next()`) or reject the URL request (by calling `next(new Error())`).

The code executed between the first and last parameter is referred to as **middleware** and the whole process is called **chaining**.

You can create your own middleware functions. You can create functions to limit route access, to add information to the `pdict` variable, or for any other reason. One limitation of this approach is that you always have to call the `next()` function at the end of every step in the chain; otherwise, the next function in the chain is not executed.

## Middleware

Every step of the middleware chain is a function that takes three arguments. `req`, `res` and `next`.

### `req`

`req` stands for Request and contains information about the user request. For example, if you are looking for information about the user's input, accepted content-types, or login and locale, you can access this information by using the `req` object. The `req` argument automatically pre-parses query string parameters and assigns them to `req.querystring` object.

### `res`

`res` stands for Response and contains functionality for outputting data back to the client. For example:

* `res.cacheExpiration(24);` which sets cache expiration to 24 hours from now. `res.render(templateName, data)` outputs an ISML template back to the client and assigns `data` to `pdict`.
* `res.json(data)` prints out a JSON object back to the screen. It's helpful in creating AJAX service endpoints that you want to execute from the client-side scripts.
* `res.setViewData(data)` does not render anything, but sets the output object. This can be helpful if you want to add multiple objects to the `pdict` of the template, which contains all of in the information for rendering that is passed to the template. `setViewData` merges all of the data that you passed in into a single object, so you can call it at every step of the middleware chain. For example, you might want to have a separate middleware function that retrieves information about user's locale to render a language switch on the page. Actual output of the ISML template or JSON happens after every step of the middleware chain is complete.

### `next`

Executing the `next` function notifies the server that you are done with this middleware step, and the server can execute next step in the chain.

## Extending Routes

The power of this approach is that by chaining multiple middleware functions, you can compartmentalize your code better and extend existing or modify routes without having to rewrite them.

### Changing Wording in a Template
For example, you might have a controller `Page` with the following route:

```js
var server = require('server');

server.get('Show', function(req, res, next) {
    res.render('someTemplate', { value: 'Hello World' });
    next();
});

module.exports = server.exports();
```

Let's say that you are a client who is fine with the look and feel of the Page-Show template, but you want to change the wording. Instead of creating your own controller and route or modifying SFRA code, you can extend this route with the following code:

```js
var page = require('app_storefront_base/cartridge/controller/Page');
var server = require('server');

server.extend(page);

server.append('Show', function(req, res, next) {
    res.setViewData({ value: 'Hello Commerce Cloud' });
    next();
});

module.exports = server.exports();
```

Once the user loads this page, the text on the page now says "Hello Commerce Cloud", since the data passed to the template was overwritten.

### Changing Template Styles
It is simple to change the template style if you are fine with the data but don't like the look and feel of the template. Instead of setting ViewData, you can call the `render` function and pass it a new template like this:

```js
var page = require('app_storefront_base/cartridge/controller/Page');
var server = require('server');

server.extend(page);

server.append('Show', function(req, res, next) {
    res.render('myNewTemplate');
    next();
});

module.exports = server.exports();
```

Your new template still has the `pdict.value` variable with a value of `Hello World`, but you can render it using your own template without modifying any of the SFRA code.

We recommend that you never modify anything in app\_storefront_base, but instead to create your own cartridge and overlay it in the Business Manager cartridge path. This enables you to upgrade to a newer version of SFRA without having to manually cherry-pick changes and perform manual merges. This doesn't mean that every new version of SFRA will not modify your client's site, but upgrade and feature adoption process is much quicker and less painful.

### Replacing a Route
Sometimes you might want to reuse the route's name, but do not want any of the existing functionality. In those cases, you can use `replace` command to completely remove and re-add a new route.

```js
var page = require('app_storefront_base/cartridge/controller/Page');
var server = require('server);

server.extend(page);

server.replace('Show', server.middleware.get, function(req, res, next){
    res.render('myNewTemplate');
    next();
});

module.exports = server.exports();
```
## Overriding Routes with module.superModule
A typical storefront can have several layers of SFRA cartridges that overlay one another. Each cartridge can import from the previous cartridge and overlay it. To make this easy, Commerce Cloud provides a chaining mechanism that lets you access modules that you intend to override.

The `module.superModule` global property provides access to the most recent module on the cartridge path module with the same path and name as the current module.

For more information, see [SFRA Modules](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/SFRA/SFRAModules.html)

## Middleware Chain Events

The server module emits events at every step of execution, and you can subscribe to events and unsubscribe from events for a given route. Here's the list of currently supported events:

* `route:Start` - emitted as a first thing before middleware chain execution.
* `route:Redirect` - emitted right before `res.redirect` execution.
* `route:Step` - emitted before execution of every step in the middleware chain.
* `route:Complete` - emitted after every step in the chain finishes execution. Currently subscribed to by the server to render ISML or JSON back to the client.

All of the events provide both the `req` and `res` objects as parameters to all handlers.

