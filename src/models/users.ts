import { ObjectId } from "mongodb";
export default class User {
  constructor(
    public firstName: string,
    public lastName: string,
    public username: string,
    public position: string,
    public password: string,
    public dateCreated: number,
    public dateUpdated: number,
    public id?: ObjectId
  ) {}
}
