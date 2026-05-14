const bcrypt = require("bcryptjs");

async function hashPassword() {
  const password = "dev8293"; // your desired password
  const hash = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hash);
}

hashPassword();
