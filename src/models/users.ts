interface User {
  firstName: string;
  lastName: string;
  username: string;
  position: string;
  password: string;
  dateCreated: number;
  dateUpdated: number;
}

let users: User[] = [
  // list of employees
  {
    firstName: "J.C. James",
    lastName: "Arcilla",
    username: "jla@noaya.no",
    position: "Software Developer",
    password: "123456",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    firstName: "Vince",
    lastName: "Elizaga",
    username: "vne@noaya.no",
    position: "Software & System Engineer",
    password: "123456",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    firstName: "Kenji Mille",
    lastName: "Grava",
    username: "kmg@noaya.no",
    position: "Software Developer",
    password: "123456",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
];

export default { users };
