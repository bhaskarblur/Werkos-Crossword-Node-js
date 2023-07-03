const express = require('express');
const app = express();
const PORT = 3000;
console.log('hello world');
app.listen(PORT, function (err) {
    if (err)
        console.log("Error in server setup");
    console.log("Server listening on Port", PORT);
});
export {};
//# sourceMappingURL=index.js.map