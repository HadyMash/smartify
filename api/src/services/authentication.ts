import { randomBytes, pbkdf2Sync } from 'crypto';
import { Collection, Db, MongoClient } from 'mongodb';
import { UserType, userSchema } from '../schemas/users';
const uri =
  'mongodb+srv://mm2148:OXSKYvCHwRNcnAER@smartify.lxtc0.mongodb.net/?retryWrites=true&w=majority&appName=Smartify';
const client = new MongoClient(uri);
const db: Db = client.db('Smartify');
const usersCollection: Collection<UserType> = db.collection('users');
const verifyPassword = (password: string, salt: string, hash: string) => {
  const hashCompare = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString(
    'hex',
  );
  return hash === hashCompare;
};
const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex'); // Generate a random salt
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'); // Hash the password with the salt
  return { salt, hash };
};
const createUser = async (userData: Partial<UserType>) => {
  // Validate user data
  const parsedData = userSchema.parse({ body: userData }); // Check if email already exists
  const existingUser = await usersCollection.findOne({
    email: parsedData.body.email,
  });
  if (existingUser) {
    throw new Error('Email already in use');
  }
  // Hash the password with a salt using crypto
  const { salt, hash } = hashPassword(parsedData.body.password); // Prepare the user document to be inserted
  const userDocument = { ...parsedData.body, password: hash, salt: salt }; // Replace plain password with hashed one salt, Include the salt in the user document
  const result = await usersCollection.insertOne(userDocument);
  const { password, salt: _, ...userWithoutPassword } = userDocument;
  return userWithoutPassword;
}; // Exclude the password and salt from the returned data

const loginUser = async (userData: UserType) => {
  const { email, password } = userData;
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  const parsedData = userSchema.parse({ body: userData });
  const existingUser = await usersCollection.findOne({
    email: parsedData.body.email,
  });
  if (!user || !verifyPassword) {
    throw new Error('Invalid email or password');
  }
  return user;
};
// export async function getUserByEmail(email: string){
//   const user = await usersCollection.findOne({email});
// }

// const changePassword = async (user: UserType, salt:string, oldPassword: string, newPassword: string) => {
//   const { password: storedPassword, salt: storedSalt } = user;
//   if (!verifyPassword(oldPassword, storedSalt, storedPassword)) {
//     throw new Error('Old password does not match'); } // Ensure the new password is different
//     if (oldPassword === newPassword) { throw new Error('New password must be different from the old password'); }
//     // Hash the new password
//     const { salt: newSalt, hash: newHashedPassword } = hashPassword(newPassword); // Update the user's password in the database await usersCollection.updateOne( { _id: new ObjectId(userId) }, { $set: { password: newHashedPassword, salt: newSalt } } ); };
//   }
const findByEmail = async (userData: Partial<UserType>) => {
  const { email } = userData;
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
const findById = async (userData: Partial<UserType>) => {
  const { id } = userData;
  const user = await usersCollection.findOne({ _id: new Object(id) });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export { createUser, verifyPassword, loginUser, findByEmail, findById };
