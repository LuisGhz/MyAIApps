
export namespace AuthActions {
  const type = '[Auth]';

  export class Login {
    static readonly type = `${type} Login`;
    constructor(public payload: { token: string }) {}
  }

  export class UploadToken {
    static readonly type = `${type} Upload Token`;
    constructor(public payload: { token: string }) {}
  }

  export class Logout {
    static readonly type = `${type} Logout`;
  }

}
