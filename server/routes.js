const {predict, getAllPredictions, deleteAllPredictions} = require("./handler");

const routes = [
    {
        method: "GET",
        path: "/",
        handler: (request, h) => {
            return "Server is running...";
        }
    },
    {
        method: "POST",
        path: '/prediction',
        handler: predict
    },
    {
        method: "GET",
        path: '/prediction',
        handler: getAllPredictions
    },
    {
        method: "DELETE",
        path: '/prediction',
        handler: deleteAllPredictions
    }
]

module.exports = routes;