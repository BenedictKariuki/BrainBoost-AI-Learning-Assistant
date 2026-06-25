import mongoose from "mongoose";

const connectDB = async () => {
  // mongodb://user:pass@127.0.0.1:port/mydb
  const user = encodeURIComponent(process.env.DB_USERNAME);
  const pass = encodeURIComponent(process.env.DB_PASSWORD);
  const uri = `mongodb://${user}:${pass}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

// need to create a user and a password:
/* db.createUser({
   user: "benedict",
   pwd: passwordPrompt(),
   roles: [{ role: "userAdmin", db: "ailearning" }],
   });
*/

// renaming the user
/* db.system.users.updateOne(
  { user: "benedict" },
  { $set: { user: "new_username" } })
*/
