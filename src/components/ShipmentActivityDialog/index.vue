<template>
  <div>
    <el-dialog title="配送信息" :visible.sync="dialogVisible" :append-to-body='true' width="50%" :close-on-click-modal="false">
      <el-form v-model="wrapper" size="mini" label-width="80px">
        <el-form-item label="时间窗口">
          <el-col :span="11">
            <el-time-select
              placeholder="起始时间"
              v-model="wrapper.twStartStr"
              :picker-options="{
          start: '05:00',
          step: '00:05',
          end: '08:30'
        }"
              :editable="false"
              style="width: 100%;"
            >
            </el-time-select>
          </el-col>
          <el-col :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-time-select
              placeholder="结束时间"
              v-model="wrapper.twEndStr"
              :picker-options="{
          start: '05:00',
          step: '00:05',
          end: '08:30',
          minTime: wrapper.twStartStr
        }"
              :editable="false"
              style="width: 100%;"
            >
            </el-time-select>
          </el-col>
        </el-form-item>
        <el-form-item label="服务时间">
          <el-col>
            <el-input type="number" v-model="wrapper.operationTime"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item v-for="(value, index) in wrapper.load.size" :label="loadTitle[index]">
          <el-col>
            <el-input type="number" v-model="wrapper.load.size[index]"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="confirm" v-if="type == 'modification'">修改</el-button>
          <el-button type="primary" @click="insert" v-if="type == 'insertion'">新增</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {
    TourActivityWrapper,
    TourActivity, ShipmentTourActivity, DepotTourActivity
  } from '../../engine/domain/Activity'
  import {convertTime2Min} from "../../utils/common"
  import {Route, RoutePool} from "../../engine/domain/Route"
  import {ShipmentPool} from "../../engine/domain/ShipmentPool"
  import {MyLocationFactory} from "../../engine/domain/MyLocation"
  import {Constants} from "../../engine/Constant/Constants"

  @Component({
    name: 'ShipmentActivityDialog'
  })
  export default class extends Vue {
    @Prop() private activity: TourActivity;
    @Prop() private type: string;
    private dialogVisible: boolean = false;
    private wrapper: TourActivityWrapper;
    private loadTitle: Array<string>;

    constructor() {
      super();
      this.wrapper = new TourActivityWrapper(this.activity);
      this.loadTitle = Constants.LOAD_TITLE;
    }

    @Watch('activity', {deep: true})
    onActivityChanged(){
      this.wrapper = new TourActivityWrapper(this.activity);
    }

    showDialog() {
      this.wrapper = new TourActivityWrapper(this.activity);
      this.dialogVisible = true;
    }

    cancel(){
      this.wrapper = new TourActivityWrapper(this.activity);
      this.dialogVisible = false;
    }

    confirm(){
      this.activity.twStart = convertTime2Min(this.wrapper.twStartStr);
      this.activity.twEnd = convertTime2Min(this.wrapper.twEndStr);
      this.activity.operationTime = Number.parseInt(<string>this.wrapper.operationTime);

      if(this.activity instanceof ShipmentTourActivity) {
        this.activity.load = this.wrapper.load.cloneAndReverse();
      }else if(this.activity instanceof DepotTourActivity){
        this.activity.load = this.wrapper.load.clone();
      }

      let route: Route = RoutePool.getInstance().routes.find(x=>{
        return x.uid == this.activity.routeUid;
      })

      if(route){
        route.updateRoute();
      }

      this.dialogVisible = false;
    }

    insert(){
      this.activity.twStart = convertTime2Min(this.wrapper.twStartStr);
      this.activity.twEnd = convertTime2Min(this.wrapper.twEndStr);
      this.activity.operationTime = Number.parseInt(<string>this.wrapper.operationTime);

      ShipmentPool.getInstance().shipments.push(this.activity);

      this.dialogVisible = false;
    }
  }
</script>

<style lang="scss" scoped>
  .activity-wrapper {
    height: 32px;
    /*width: 152px;*/
    width: 160px;
    padding: 2px;
    background: #d8d8d8;
    margin-right: 4px;
    margin-bottom: 4px;
    overflow: hidden;
    line-height: 24px;
    display: flex;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .depot-activity-wrapper {
    width: 80px;
  }

  .left-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .left-upper-wrapper {
    flex: 1;
    line-height: 16px;
    font-size: 12px;
  }

  .left-bottom-wrapper {
    flex: 0 0 12px;
    line-height: 12px;
    font-size: 12px;
    color: #909399;
  }

  .right-wrapper {
    position: relative;
    flex: 0 0 40px;
  }

  .triangle-wrapper{
    position: absolute;
    top: -2px;
    right: -2px;
    height: 0px;
    width: 0px;
    border-top: 8px solid  #4AB7BD;
    border-left: 8px solid #f8f8f8;
  }

  .triangle-wrapper-caution{
    border-top: 8px solid  #FFBA00;
    border-left: 8px solid #f8f8f8;
  }

  .triangle-wrapper-error{
    border-top: 8px solid  #C03639;
    border-left: 8px solid #f8f8f8;
  }
</style>
