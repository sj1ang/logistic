export interface Punishment {
  reasons: Array<string>;
  penaltyFee: number;
}

export class PunishmentImpl{
  reasons: Array<string>;
  penaltyFee: number = 0;

  constructor(){
    this.reasons = new Array<string>();
  }
}
