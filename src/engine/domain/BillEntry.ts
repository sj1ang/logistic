export interface BillEntry{
  billNo: string,
  prodCode: string,
  prodName: string,
  unit: string,
  qty: number,
  price: number,
  amount: number,
  remark: string
}

export class BillEntryImpl implements BillEntry{
  amount: number;
  billNo: string;
  price: number;
  prodCode: string;
  prodName: string;
  qty: number;
  remark: string;
  unit: string;

  constructor(billNo: string,
              prodCode: string,
              prodName: string,
              unit: string,
              qty: number,
              price: number,
              amount: number,
              remark: string){
    this.billNo = billNo;
    this.prodCode = prodCode;
    this.prodName = prodName;
    this.unit = unit;
    this.qty = qty;
    this.price = price;
    this.amount = amount;
    this.remark = remark;
  }

}
