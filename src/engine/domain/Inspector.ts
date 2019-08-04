import {DriverPool} from "@/engine/domain/Driver";

export interface Inspector {
    inspect(): void;
}

export class DriverInspector implements Inspector{
  inspect(): void {

  }
}

export interface InspectionResult {

}
