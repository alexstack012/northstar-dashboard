const bcrypt = require('bcrypt');

async function run() {
  const passwordHash = await bcrypt.hash("Password123", 10);
  const answerHash = await bcrypt.hash("Toyota", 10);

  console.log(passwordHash);
  //$2b$10$o9/e3RS2uSWzvsUiBzUvnudAK7Q61uwtx06QvcLStFAptks6Pslhq
  console.log(answerHash);
  //$2b$10$aB5swg1MdaQ1wfrjun8.5uZz8ury1zv5Va7Gze75DFjH8tN09kjMy
}

run();