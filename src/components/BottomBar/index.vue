<template>
  <div class="bottom-bar-container" @click="tryFunc">
    <div v-if="!isHidden">{{fileName}}: {{status}}</div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {FileManager, FileManagerFactory} from '../../engine/domain/FileManager'
  import {Constants} from "../../engine/Constant/Constants"

  @Component({
    name: 'BottomBar'
  })
  export default class extends Vue {
    fileManager: FileManager;
    fileName: string = '';
    status: string = '';
    isHidden: boolean;

    @Watch('fileManager', {deep: true})
    onFileCheckerChanged(){
      console.log('changed...')
      this.assignStatus();

    }

    constructor(){
      super();
      this.fileManager = FileManagerFactory.getInstance();
      console.log(FileManagerFactory.getInstance())
      this.isHidden = true;
    }

    created(){
      this.assignStatus();
    }

    tryFunc(){
      console.log(this.fileManager.currentFileName)
    }

    assignStatus(){
      this.isHidden = this.fileManager.currentFileName == '' || this.fileManager.currentFileStatus == -1;

      this.fileName = this.fileManager.currentFileName == '' ? '暂无数据' : this.fileManager.currentFileName;

      if(this.fileManager.currentFileStatus == Constants.NOT_CHECKED){
        this.status = '未查询到相关信息'
      }else if(this.fileManager.currentFileStatus == Constants.IS_CHECKING){
        this.status = '链接服务器查询中...'
      }else if(this.fileManager.currentFileStatus == Constants.SCENARIO_EXISTING){
        this.status = '注意！已存在相应的数据，再次生成会覆盖数据!'
      }else if(this.fileManager.currentFileStatus == Constants.SCENARIO_NOT_EXISTING){
        this.status = '待生成'
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
  }
</style>
