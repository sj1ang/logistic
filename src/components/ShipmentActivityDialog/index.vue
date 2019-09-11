<template>
  <div>
    <el-dialog title="配送信息" :visible.sync="dialogVisible" :append-to-body='true' :before-close="handleClose" width="50%"
               :close-on-click-modal="false">
      <div v-if="!isSplitPanel">
      <el-form v-model="wrapper" ref="activityForm" size="mini" label-width="80px">
        <el-form-item label="配送名称">
          <el-col>
            <el-input v-model="wrapper.name"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="时间窗口">
          <el-col :span="11">
            <el-time-select
              placeholder="起始时间"
              v-model="wrapper.twStartStr"
              :picker-options="{
          start: '05:00',
          step: '00:05',
          end: '08:30',
          maxTime: wrapper.twEndStr
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
            <el-input type="number" min=0 v-model="wrapper.operationTime"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item v-for="(value, index) in wrapper.load.size" :label="loadTitle[index]">
          <div v-if="index == 0 && isShipmentTourActivity">
            <el-col :span="18">
              <el-input type="number" min=0 v-model="wrapper.load.size[index]"></el-input>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="4">
              <el-checkbox v-model="hasFish">含有水产</el-checkbox>
            </el-col>
          </div>
          <el-col v-else>
            <el-input type="number" min=0 v-model="wrapper.load.size[index]"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="配送任务">
          <el-select v-model="wrapper.task" value-key="uid" style="width: 100%" :disabled="type == 'modification'" @change="changeTask">
            <el-option
              v-for="task in tasks"
              :key="task.uid"
              :label="task.name"
              :value="task"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补货费用" v-if="isAdditionalShipmentTourActivity">
          <el-col>
            <el-input type="number" min=0 v-model="additionalFee"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="补货原因" v-if="isAdditionalShipmentTourActivity">
          <el-col>
            <el-radio v-for="(item, index) in additionalDeliveryReasons" :label="index" v-model="reason">{{item}}</el-radio>
          </el-col>
        </el-form-item>
        <el-form-item>
          <div style="display: flex; justify-content: space-between">
            <el-popover
              placement="right"
              width="160"
              v-model="popoverVisible">
              <p>从配送池中删除？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="popoverVisible = false">取消</el-button>
                <el-button type="primary" size="mini" @click="deleteActivity(activity)">确定</el-button>
              </div>
              <el-button type="danger" slot="reference" v-if="type == 'modification'">删除</el-button>
            </el-popover>
            <div>
              <el-button @click="cancel">取消</el-button>
              <el-button @click="trySplit" type="primary" v-if="type == 'modification' && isShipmentTourActivity && !isAdditionalShipmentTourActivity">拆分</el-button>
              <el-button type="primary" @click="confirm" v-if="type == 'modification'">修改</el-button>
              <el-button type="primary" @click="insert" v-if="type == 'insertion'">新增</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      </div>
      <!-- #################### for splitting shipments #################### -->
      <div v-else>
        <el-form size="mini" label-width="88px">
          <el-form-item v-for="(value, index) in totalLoad.size" :label="loadTitle[index] + ' (' + value +')'">
            <el-col :span="11">
              <el-input type="number" v-model="load1.size[index]" min=0 :max="value"></el-input>
            </el-col>
            <el-col :span="2" style="text-align: center">-</el-col>
            <el-col :span="11">
              <el-input type="number" v-model="load2.size[index]" min=0 :max="value"></el-input>
            </el-col>
          </el-form-item>
          <el-form-item>
            <div style="text-align: right">
              <el-button @click="back">返回</el-button>
              <el-button type="primary" @click="split">确定</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {
    TourActivityWrapper,
    TourActivity, ShipmentTourActivity, DepotTourActivity, AdditionalShipmentTourActivity
  } from '../../engine/domain/Activity'
  import {convertMin2Time, convertTime2Min} from "../../utils/common"
  import {Route, RoutePool} from "../../engine/domain/Route"
  import {ShipmentPool} from "../../engine/domain/ShipmentPool"
  import {Constants} from "../../engine/Constant/Constants"
  import {Task, TaskPool} from "../../engine/domain/Task"
  import {Load, LoadImpl} from "../../engine/domain/Load"

  @Component({
    name: 'ShipmentActivityDialog'
  })
  export default class extends Vue {
    @Prop() private activity: TourActivity;
    @Prop() private type: string;
    private dialogVisible: boolean = false;
    private popoverVisible: boolean = false;
    private wrapper: TourActivityWrapper;
    private loadTitle: Array<string>;
    private taskPool: TaskPool;
    private tasks: Array<Task>;
    private isSplitPanel: boolean = false;
    private totalLoad: Load;
    private load1: Load;
    private load2: Load;
    private isTied: boolean = true;
    private isShipmentTourActivity: boolean;
    private isAdditionalShipmentTourActivity: boolean;
    private additionalFee: number = 0;
    private additionalDeliveryReasons: Array<string>;
    private reason: number = 0;
    private hasFish: boolean = false;


    constructor() {
      super();
      this.taskPool = TaskPool.getInstance();
      this.wrapper = new TourActivityWrapper(this.activity);
      this.loadTitle = Constants.LOAD_TITLE;
      this.tasks = this.taskPool.tasks;

      this.totalLoad = new LoadImpl([0]);
      this.load1 = new LoadImpl([0]);
      this.load2 = new LoadImpl([0]);

      this.isShipmentTourActivity = this.activity instanceof ShipmentTourActivity;
      this.isAdditionalShipmentTourActivity = this.activity instanceof AdditionalShipmentTourActivity;

      this.additionalDeliveryReasons = Constants.ADDITIONAL_DELIVERY_REASONS;

      if(this.isShipmentTourActivity){
        this.hasFish = (<ShipmentTourActivity>this.activity).hasFish;
      }

      if(this.isAdditionalShipmentTourActivity) {
        this.reason = (<AdditionalShipmentTourActivity>this.activity).reason;
        this.additionalFee = (<AdditionalShipmentTourActivity>this.activity).additionalFee;
      }
    }

    @Watch('activity', {deep: true})
    onActivityChanged() {
      this.wrapper = new TourActivityWrapper(this.activity);
      this.additionalFee = 0;
      this.reason = 0;
      this.hasFish = false;
    }

    @Watch('load1', {deep: true})
    onLoad1Changed(){
      if(this.isTied){
        let tmpLoad = this.totalLoad.minus(this.load1);
        this.load2.copy(tmpLoad);
      }
    }

    @Watch('load2', {deep: true})
    onLoad2Changed(){
      if (this.isTied){
        let tmpLoad = this.totalLoad.minus(this.load2);
        this.load1.copy(tmpLoad);
      }
    }

    // caution: don't forget to update additional properties
    showDialog() {
      this.wrapper = new TourActivityWrapper(this.activity);
      if(this.activity instanceof ShipmentTourActivity){
        this.hasFish = (<ShipmentTourActivity>this.activity).hasFish;
        if(this.activity instanceof AdditionalShipmentTourActivity) {
          this.additionalFee = (<AdditionalShipmentTourActivity>this.activity).additionalFee;
          this.reason = (<AdditionalShipmentTourActivity>this.activity).reason;
        }
      }
      this.dialogVisible = true;
    }

    cancel() {
      this.wrapper = new TourActivityWrapper(this.activity);
      this.additionalFee = 0;
      this.reason = 0;
      this.hasFish = false;
      this.dialogVisible = false;
    }

    confirmModification(){
      this.activity.twStart = convertTime2Min(this.wrapper.twStartStr);
      this.activity.twEnd = convertTime2Min(this.wrapper.twEndStr);
      this.activity.operationTime = Number.parseInt(<string>this.wrapper.operationTime);

      if (this.activity instanceof ShipmentTourActivity) {
        this.activity.load = this.wrapper.load.cloneAndReverse();
        (<ShipmentTourActivity>this.activity).hasFish = this.hasFish;
        if(this.activity instanceof AdditionalShipmentTourActivity) {
          (<AdditionalShipmentTourActivity>this.activity).additionalFee = Number.parseFloat(<string>this.additionalFee);
          (<AdditionalShipmentTourActivity>this.activity).reason = Number.parseInt(<string>this.reason);

          console.log(this.activity);
        }
      } else if (this.activity instanceof DepotTourActivity) {
        this.activity.load = this.wrapper.load.clone();
      }

      this.activity.name = this.wrapper.name;

      let route: Route = RoutePool.getInstance().routes.find(x => {
        return x.uid == this.activity.routeUid;
      })

      if (route) {
        route.updateRoute();
      }
    }

    confirm() {
      // this.$refs['activityForm'].validate((valid) =>{
      //   console.log(valid)
      //   if(valid){
          this.confirmModification();
          this.dialogVisible = false;
        // }else{
        //
        // }
      // })
    }

    insert() {
      this.activity.twStart = convertTime2Min(this.wrapper.twStartStr);
      this.activity.twEnd = convertTime2Min(this.wrapper.twEndStr);
      this.activity.operationTime = Number.parseInt(<string>this.wrapper.operationTime);

      if(this.activity instanceof ShipmentTourActivity && this.wrapper.task){
        let task = this.wrapper.task;
        let sta = (<ShipmentTourActivity>this.activity);

        sta.task = task;
        sta.locationId = task.location.id;
        sta.location = task.location;
      }

      if (this.activity instanceof ShipmentTourActivity) {
        this.activity.load = this.wrapper.load.cloneAndReverse();
        (<ShipmentTourActivity>this.activity).hasFish = this.hasFish;
        if(this.activity instanceof AdditionalShipmentTourActivity) {
          (<AdditionalShipmentTourActivity>this.activity).additionalFee = Number.parseFloat(<string>this.additionalFee);
          (<AdditionalShipmentTourActivity>this.activity).reason = Number.parseInt(<string>this.reason);
        }
      } else if (this.activity instanceof DepotTourActivity) {
        this.activity.load = this.wrapper.load.clone();
      }

      this.activity.name = this.wrapper.name;

      ShipmentPool.getInstance().shipments.push(this.activity);

      this.dialogVisible = false;
    }

    trySplit(){
      // this.confirmModification();
      this.isSplitPanel = true;

      this.totalLoad.copy(this.wrapper.load);
      this.load1.copy(this.wrapper.load);
      this.load2.copy(new LoadImpl([0]));
    }

    copyLoad(target: Load, source: Load){
      for(let i = 0; i < source.size.length; i++){
        Vue.set(target.size, i, source.size[i])
      }
    }

    back(){
      this.isSplitPanel = false;
    }

    split(){
      if(this.activity instanceof ShipmentTourActivity){
        (<ShipmentTourActivity>this.activity).split(this.load1.cloneAndReverse(), this.load2.cloneAndReverse());
        this.handleClose();
      }
    }

    handleClose(){
      this.dialogVisible = false;
      this.isSplitPanel = false;

    }

    deleteActivity(activity: TourActivity){
      let routeUid = activity.routeUid;

      if(routeUid){
        let route = RoutePool.getInstance().getRouteByUid(routeUid);
        route.deleteTourActivity(activity);
      }else {
        let shipmentPool = ShipmentPool.getInstance();
        shipmentPool.shipments = shipmentPool.shipments.filter(x => {
          if (x.uid == activity.uid) return false;
          return true;
        })
      }


    }

    changeTask(e){
      let task = e;
      this.wrapper.load = new LoadImpl([0]);
      this.wrapper.name = task.name + '-补货';
      this.wrapper.operationTime = task.serviceTime;
      // this.wrapper.twStartStr = convertMin2Time(task.startTime);
      // this.wrapper.twEndStr = convertMin2Time(task.endTime);
    }

    private validateTWEndStr = (rule: any, value: string, callback: Function) => {
      console.log('checking...');
      console.log(value);
      console.log(convertTime2Min(this.wrapper.twEndStr))
      console.log(convertTime2Min(this.wrapper.twStartStr))
      if (convertTime2Min(this.wrapper.twEndStr) < convertTime2Min(this.wrapper.twStartStr)) {
        callback(new Error('时间窗输入有误'))
      } else {
        callback()
      }
    }

    private validateTask = (rule: any, value: string, callback: Function) => {
      console.log(value);
      if (!value) {
        callback(new Error('null value'));
      } else {
        callback()
      }
    }

    private rules = {
      twEndStr: [{validator: this.validateTWEndStr, trigger: 'blur'}],
      task: [{validator: this.validateTask, trigger: 'change'}]
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

  .triangle-wrapper {
    position: absolute;
    top: -2px;
    right: -2px;
    height: 0px;
    width: 0px;
    border-top: 8px solid #4AB7BD;
    border-left: 8px solid #f8f8f8;
  }

  .triangle-wrapper-caution {
    border-top: 8px solid #FFBA00;
    border-left: 8px solid #f8f8f8;
  }

  .triangle-wrapper-error {
    border-top: 8px solid #F56C6C;
    border-left: 8px solid #f8f8f8;
  }

  .el-checkbox{
    font-weight: 400;
  }

  .el-radio{
    font-weight: 400;
  }
</style>
