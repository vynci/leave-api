import bcrypt from "bcrypt";

// comparing string password to saved hash password
function comparePassword(inputPassword: string, userPassword: string) {
  return bcrypt.compareSync(inputPassword, userPassword);
}

export default { comparePassword };
