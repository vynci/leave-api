import { ObjectId } from "mongodb";
export default class Leaves {
  constructor(public token: string, public id?: ObjectId) {}
}
