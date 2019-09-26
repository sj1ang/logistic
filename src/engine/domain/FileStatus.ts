export class FileStatus{
  file: File;
  status: number;

  constructor(file: File, status: number){
    this.file = file;
    this.status = status;
  }
}
