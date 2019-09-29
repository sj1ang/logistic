<template>
  <div class="bottom-bar-container" @click="tryFunc">
    <div v-if="!isHidden">{{fileName}}（{{statusStr}}）</div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {FileManager, FileManagerFactory} from '../../engine/domain/FileManager'
  import {Constants} from "../../engine/Constant/Constants"
  import {MyFile, ScenarioFile, TemplateFile} from '../../engine/domain/Scenario'
  import {ScenarioFileStatus} from '../../engine/domain/FileStatus'
  import {ScenarioHandler} from "../../engine/domain/ScenarioHandler"
  import {SaveManager} from '../../engine/domain/SaveManager'

  @Component({
    name: 'BottomBar'
  })
  export default class extends Vue {
    @Prop() private step: number;
    @Prop() private type: number;
    fileManager: FileManager;
    fileName: string = '';
    statusStr: string = '';
    fileStatus: ScenarioFileStatus;
    isHidden: boolean;
    file: MyFile | undefined;


    @Watch('fileManager', {deep: true})
    onFileManagerChanged(){
      if(this.step == 0) {
        this.assignStatusFromFileManager();
      }
    }

    @Watch('file', {deep: true})
    onFileChanged() {
      if (this.step > 0){
        console.log('file changed...')
        this.assignStatusFromFile()
      }
    }

    @Watch('step')
    onStepChanged(){
      if(this.step > 0) {
        this.file = ScenarioHandler.getInstance().saveManager.getFile();
        this.isHidden = false;
      }
    }

    constructor(){
      super();
      if(this.step == 0) {
        this.fileManager = FileManagerFactory.getInstance();
        this.isHidden = true;
        this.fileStatus = new ScenarioFileStatus(Constants.NOT_CHECKED, undefined);
        if (ScenarioHandler.getInstance().selectedType == Constants.FETCH_MOCK_TASKS) {
          this.file = new TemplateFile(undefined, "新建模板", new Date(), new Date(), undefined, "", "", "");
        } else {
          this.file = new ScenarioFile(undefined, "新建模板", 1, new Date(), new Date(), new Date(), undefined, 1, "", "", "");
        }
      }
    }

    created(){
      this.assignStatusFromFileManager();
    }

    tryFunc(){
      console.log(this.fileManager.currentFileStatus)
      console.log("STEP:" + this.step)
      console.log(ScenarioHandler.getInstance().saveManager.getFile());
      console.log(this.file);
    }

    assignStatusFromFileManager(){
      this.isHidden = this.fileManager.currentFileName == '' || this.fileManager.currentFileStatus < 0;
      this.fileName = this.fileManager.currentFileName;
      this.fileStatus = this.fileManager.currentFileStatus;

      if(this.fileManager.currentFileStatus.status == Constants.NOT_CHECKED){
        this.statusStr = '无信息'
      }else if(this.fileManager.currentFileStatus.status == Constants.IS_CHECKING){
        this.statusStr = '链接服务器查询中...'
      }else if(this.fileManager.currentFileStatus.status == Constants.SCENARIO_EXISTING){
        this.statusStr = '已存在'
        // @ts-ignore
        this.statusStr = this.fileStatus.file.lastModificationTime.Format('最后修改时间：yyyy-MM-dd hh:mm:ss');
      }else if(this.fileManager.currentFileStatus.status == Constants.SCENARIO_NOT_EXISTING){
        this.statusStr = '待生成'
      }
    }

    assignStatusFromFile(){
      this.fileName = this.file.name;
      if(this.file.id){
        console.log(this.file);
        // @ts-ignore
        this.statusStr = this.file.lastModificationTime.Format('最后修改时间：yyyy-MM-dd hh:mm:ss');
      }else{
        this.statusStr = '待生成'
      }
    }
  }
</script>

<style lang="scss" scoped>
  .bottom-bar-container{
    height: 24px;
    background: #d8d8d8;
    width: 100%;
    display: flex;
    line-height: 24px;
    font-size: 10px;
    padding: 0 4px;
    color: #606266;
  }
</style>
