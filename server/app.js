const express = require('express');
const app = express();
const port = 8000;

app.get('/', (req, res) => {
    res.send("Hello World!");
}); // get 요청만 받겠다


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
