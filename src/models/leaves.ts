import { ObjectId } from "mongodb";
export default class Leaves {
  constructor(
    public date: number,
    public type: string,
    public notes: string,
    public dateCreated: number,
    public dateUpdated: number,
    public id?: ObjectId
  ) {}
}
