/*
 *  Primary file for the API
 *
 */

// Dependencies
var http = require("http");
//var https = require("https");
var url = require("url");
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP server
// The server should respond to all requests with a string
var httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res);
}); // var server = http.createServer(callbackfunction)


//  Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, function(){
	console.log("The server is running on port "+config.httpPort); //+" in "+config.envName+" mode.");
});

// Instantiate the HTTPS server
//var httpsServerOptions = {
//	'key': fs.readFileSync('./https/key.pem'),
//	'cert':  fs.readFileSync('./https/cert.pem')
//}
//var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
//	unifiedServer(req, res);
//}); // var server = http.createServer(callbackfunction)

// Start the HTTPS server
//httpsServer.listen(config.httpsPort, function(){
//	console.log("The server is running on port "+config.httpsPort); //+" in "+config.envName+" mode.");
//});

// All the server logic for both the http and the https server
var unifiedServer = function(req, res) {

	//console.log("req = ", req);

	// Get the URL and parse it
	var parsedUrl = url.parse(req.url, true);
	// the true value populates parsedUrl.query with
	// the query string object in one step

	//console.log("req.url = " + req.url);
	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,"");

	// Get the query string as an object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP method (GET, POST, etc)
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = "";

	req.on('data', function(data){
		buffer += decoder.write(data);
	});
	
	req.on('end', function(){
		buffer += decoder.end();

		//Choose the handler this request should go to.
		// If one is not found, nuse the notFound handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload){
			// Use the status code called back by the handler or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			
			// Use the payload called back by the handler or default to an empty object
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to a string
			var payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('content-type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the request path
			console.log('\nReturning this response: ', statusCode, payloadString);
			//console.log("\n Request is received on path: " + 
			//trimmedPath + " \n with this method: " + method +
			//" \n with these query string string parameters: ",
			//queryStringObject , "\n with these headers: ", 
			//headers, "\n and with this payload: ", buffer);

		}); // chosenHandler()

	}); // req.on()

}

// Define the handlers OBJECT
var handlers = {};

// Sample handler
// handlers.sample = function(data, callback) {
// 	// Callback an http status code and a payload object
// 	callback(406, {'name' : 'sample handler'});
// };

// Not Found handler
handlers.notFound = function(data, callback) {
	callback(404);
};

var anyoldobject = {
	here: "tadaaaaaaaa!",
	is: "That's RIGHT!",
	some: "The ONE, the ONLY!",
	json: "can I even DO that?",
	explanation: "<br/><br/>So.  This can be ANY javascript object.<br/>" + 
	"assuming I have a handler set up for the /hello route,<br/>" + 
	"ANY OBJECT that I pass to that handler will be returned<br/>" + 
	"in json format.<br/>" + 
	"<br/>" + // note: neither \n nore <br/> really work, here.
	"Hello, world."
};

// Creating a /hello handler is a simple, two-step process. 
// First create the handler function as a method of the 'handlers' object;
// Second, add the hello route handler to the router object

// Hello Handler
handlers.hello = function(data, callback) {
	callback(200, anyoldobject);
}

// Ping Handler
handlers.ping = function(data, callback) {
	callback(200);
}

// Define a request router
var router = {
	//'sample' : handlers.sample
	'ping' : handlers.ping,
	'hello' : handlers.hello        // new route handler, here!
};



