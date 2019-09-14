import {Constants} from "@/engine/Constant/Constants";

export function genUID(): string {
  var uuid = require('node-uuid');
  return uuid.v1();
}

let workStartTime = Constants.WORK_START_TIME;

export function convertMin2Time(min: number) {
  let a = Math.floor(min / 60);
  let b = min % 60;

  let h = workStartTime.split(":")[0];
  let m = workStartTime.split(":")[1];

  let newH = parseInt(h) + a;
  let newM = parseInt(m) + b;

  newH += Math.floor(newM / 60);
  let newHStr = prefixInteger(newH % 24, 2);
  let newMStr = prefixInteger(newM % 60, 2);

  let time = newHStr + ":" + newMStr;

  return time;
}

export function convertTime2Min(time: string) {
  let h = time.split(":")[0];
  let m = time.split(":")[1];

  let sh = parseInt(workStartTime.split(":")[0]);
  let sm = parseInt(workStartTime.split(":")[1]);

  let hNum = parseInt(h);
  let mNum = parseInt(m);

  if (hNum < sh) {
    return 0;
  }

  return (hNum - sh) * 60 + (mNum - sm);
}

export function prefixInteger(num: number, length: number) {
  return (Array(length).join("0") + num).slice(-length);
}

