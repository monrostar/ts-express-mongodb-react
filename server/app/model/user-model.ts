import IUserModel = require("./interfaces/i-user-model");

class UserModel {

  private _userModel : IUserModel;

  constructor(userModel : IUserModel) {
    this._userModel = userModel;
  }

  get name() : string {
    return this._userModel.name;
  }

  get email() : string {
    return this._userModel.email;
  }

  get achievements() : string {
    return this._userModel.achievements;
  }


}
Object.seal(UserModel);
export =  UserModel;