<template>
  <div class="bottom-bar-container" @click="tryFunc">
    <div v-if="!isHidden">{{fileName}}（{{statusStr}}）</div>
    <div>
      <div class="right-wrapper" v-if="step == 2">
        <div class="dash-index-wrapper">配送客户：{{dashIndexManager.taskNo}}</div>
        <div class="dash-index-wrapper">配送任务：{{dashIndexManager.shipmentNo}}</div>
        <div class="dash-index-wrapper">加单任务：{{dashIndexManager.additionalShipmentNo}}</div>
        <div class="dash-index-wrapper">配送费用：{{dashIndexManager.totalFee}}</div>
        <div class="dash-index-wrapper">加单费用：{{dashIndexManager.totalAdditionalFee}}</div>
        <div class="dash-index-wrapper">线路条数：{{dashIndexManager.routeNo}}</div>
        <!--<div style="width: 24px; background: #4AB7BD"></div>-->
      </div>
    </div>
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
  import {Task, TaskPool} from '../../engine/domain/Task'
  import {DashIndexManager} from '../../engine/domain/DashIndexManager'

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

    tasks: Array<Task>;
    taskNo: number;

    taskShipmentMap: Map<string, Array<string>>;
    taskAdditionalShipmentMap: Map<string, Array<string>>;

    dashIndexManager: DashIndexManager = DashIndexManager.getInstance();

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

      if(this.step == 2){
        this.taskNo = TaskPool.getInstance().tasks.length;
        this.taskShipmentMap = TaskPool.getInstance().taskShipmentMap;
        this.taskAdditionalShipmentMap = TaskPool.getInstance().taskAdditionalShipmentMap;
      }
      console.log(this.taskShipmentMap)
    }

    @Watch('tasks', {deep: true})
    onTasksChanged(){
      console.log(this.tasks.length);
    }

    @Watch('taskShipmentMap', {deep: true})
    onTaskShipmentMapChanged(){
      console.log('size...')
      console.log(this.taskShipmentMap)
    }

    constructor(){
      super();
      if(this.step == 0) {
        this.fileManager = FileManagerFactory.getInstance();
        this.tasks = TaskPool.getInstance().tasks;
        this.isHidden = true;
        this.fileStatus = new ScenarioFileStatus(Constants.NOT_CHECKED, undefined);
        if (ScenarioHandler.getInstance().selectedType == Constants.FETCH_MOCK_TASKS) {
          this.file = new TemplateFile(undefined, "新建模板", new Date(), new Date(), undefined, "", "", "");
        } else {
          this.file = new ScenarioFile(undefined, "新建模板", 1, new Date(), new Date(), new Date(), undefined, 1, "", "", "");
        }

        this.taskShipmentMap = new Map();
        this.taskAdditionalShipmentMap = new Map();
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
      console.log(TaskPool.getInstance().taskShipmentMap);
      console.log(TaskPool.getInstance().taskAdditionalShipmentMap);
      console.log(this.taskShipmentMap);
      console.log(this.taskAdditionalShipmentMap);
      this.dashIndexManager.update();
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
    justify-content: space-between;
    line-height: 24px;
    font-size: 10px;
    padding: 0 4px 0 4px;
    color: #606266;
    z-index: 1000;
  }
  .right-wrapper{
    display: flex;
    z-index: 1000;
  }
  .dash-index-wrapper{
    padding: 0 4px 0 0;
    z-index: 2000;
  }
  .dash-index-wrapper:last-child{
    padding: 0 0 0 0;
  }
</style>
