<template>
  <div :class="type != 'depotTourActivity' ? 'activity-wrapper' : 'activity-wrapper depot-activity-wrapper'"
       @click="showDialog">
    <div class="left-wrapper">
      <div :class="['left-upper-wrapper']">
        <span class= "depot-left-upper-wrapper" v-if="type == 'depotTourActivity'"><svg-icon name="pickup"/></span>
        <span class= "shipment-left-upper-wrapper" v-if="type == 'shipmentTourActivity' && !activity.hasFish"><svg-icon name="pickup"/></span>
        <span class= "additional-left-upper-wrapper" v-if="type == 'additionalShipmentTourActivity' && !activity.hasFish"><svg-icon name="pickup"/></span>
        <span class= "fish-left-upper-wrapper" v-if="activity.hasFish"><svg-icon name="pickup"/></span>
        {{activity.name}} ({{activity.load.size[0]}})
        <!--<span style="font-size: 10px; color: #409EFF" v-if="activity.hasFish"><svg-icon name="fish" v-if="type != 'depotTourActivity'"/></span>-->
      </div>
      <div class="left-bottom-wrapper" v-if="activity.routeUid">
        <!--<span v-if="type == 'depotTourActivity'"> {{loadTime}} </span> -->
        {{activity.arriveTimeStr}}
        <span v-if="type != 'depotTourActivity'"> {{activity.startTimeStr}} </span> {{activity.endTimeStr}}
      </div>
      <div class="left-bottom-wrapper" v-else>
        {{twStartStr}}-{{twEndStr}}
      </div>
    </div>
    <div class="right-wrapper" v-if="type != 'depotTourActivity'">
      <!--<div style="height: 28px;line-height: 28px; font-size: 10px; text-align: center; color: #409EFF">-->
        <!--<svg-icon name="fish"/>-->
      <!--</div>-->
      <div :class="['triangle-wrapper', {'triangle-wrapper-caution': activity.noticeManager.noticeLevel == 3}, {'triangle-wrapper-error': activity.noticeManager.noticeLevel == 5}]"></div>
      <!--{{activity.noticeManager.noticeLevel}}-->
    </div>
    <shipment-activity-dialog :activity="activity" :type="'modification'" ref="dialog"></shipment-activity-dialog>

    <!--<el-dialog title="配送信息" :visible.sync="dialogVisible" :append-to-body='true' width="50%" :close-on-click-modal="false">-->
      <!--<el-form v-model="wrapper" size="mini" label-width="80px">-->
        <!--<el-form-item label="时间窗口">-->
          <!--<el-col :span="11">-->
          <!--<el-time-select-->
            <!--placeholder="起始时间"-->
            <!--v-model="wrapper.twStartStr"-->
            <!--:picker-options="{-->
          <!--start: '08:30',-->
          <!--step: '00:15',-->
          <!--end: '18:30'-->
        <!--}"-->
            <!--:editable="false"-->
            <!--style="width: 100%;"-->
          <!--&gt;-->
          <!--</el-time-select>-->
          <!--</el-col>-->
          <!--<el-col :span="2" style="text-align: center">-</el-col>-->
          <!--<el-col :span="11">-->
          <!--<el-time-select-->
            <!--placeholder="结束时间"-->
            <!--v-model="wrapper.twEndStr"-->
            <!--:picker-options="{-->
          <!--start: '08:30',-->
          <!--step: '00:15',-->
          <!--end: '18:30',-->
          <!--minTime: wrapper.twStartStr-->
        <!--}"-->
            <!--:editable="false"-->
            <!--style="width: 100%;"-->
          <!--&gt;-->
          <!--</el-time-select>-->
          <!--</el-col>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="服务时间">-->
          <!--<el-col>-->
          <!--<el-input type="number" v-model="wrapper.operationTime"></el-input>-->
          <!--</el-col>-->
        <!--</el-form-item>-->
        <!--<el-form-item style="text-align: right">-->
          <!--<el-button @click="cancel">取消</el-button>-->
          <!--<el-button type="primary" @click="confirm">确定</el-button>-->
        <!--</el-form-item>-->
      <!--</el-form>-->
    <!--</el-dialog>-->

  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {
    DepotTourActivity,
    ShipmentTourActivity,
    TourActivityWrapper,
    TourActivity, AdditionalShipmentTourActivity
  } from '../../engine/domain/Activity'
  import {convertMin2Time, convertTime2Min} from "../../utils/common"
  import {Route, RoutePool} from "../../engine/domain/Route"
  import ShipmentActivityDialog from "../ShipmentActivityDialog/index"
  import {Constants} from "../../engine/Constant/Constants"

  @Component({
    name: 'ShipmentActivity',
    components: {ShipmentActivityDialog}
  })
  export default class extends Vue {
    @Prop() private activity: TourActivity;
    private type: string;
    private dialogVisible: boolean = false;
    // private wrapper: TourActivityWrapper;

    get loadTime(){
      if(this.activity instanceof DepotTourActivity) {

        let theoraticalTime = (<DepotTourActivity>this.activity).isOrigin ? this.activity.endTime - 30 : this.activity.arriveTime;

        if(theoraticalTime > 0)
          return convertMin2Time(theoraticalTime);
        else
          return Constants.WORK_START_TIME;
      }
    }

    constructor() {
      super();
      if (this.activity instanceof DepotTourActivity) {
        this.type = "depotTourActivity";
      } else if (this.activity instanceof ShipmentTourActivity) {
        this.type = "shipmentTourActivity";
        if(this.activity instanceof AdditionalShipmentTourActivity){
          this.type = "additionalShipmentTourActivity"
        }
      }

      // this.wrapper = new TourActivityWrapper(this.activity);
    }

    get twStartStr(){
      return convertMin2Time(this.activity.twStart);
    }

    get twEndStr(){
      return convertMin2Time(this.activity.twEnd);
    }

    showDialog() {
      console.log(this.activity.startTime);
      console.log(this.activity.endTime);
      // this.dialogVisible = true;
      this.$refs.dialog.showDialog();
    }

    // cancel(){
    //   this.wrapper = new TourActivityWrapper(this.activity);
    //   this.dialogVisible = false;
    // }
    //
    // confirm(){
    //   this.activity.twStart = convertTime2Min(this.wrapper.twStartStr);
    //   this.activity.twEnd = convertTime2Min(this.wrapper.twEndStr);
    //   this.activity.operationTime = Number.parseInt(<string>this.wrapper.operationTime);
    //
    //   let route: Route = RoutePool.getInstance().routes.find(x=>{
    //     return x.uid == this.activity.routeUid;
    //   })
    //
    //   if(route){
    //     route.updateRoute();
    //   }
    //
    //   this.dialogVisible = false;
    // }
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
    width: 96px;
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

  .depot-left-upper-wrapper{
    color: #4AB7BD;
  }

  .shipment-left-upper-wrapper{
    color: #E6A23C;
  }

  .additional-left-upper-wrapper{
    color: #E65D6E;
  }

  .fish-left-upper-wrapper{
    color: #409EFF;
  }

  .left-bottom-wrapper {
    flex: 0 0 12px;
    line-height: 12px;
    font-size: 12px;
    color: #909399;
  }

  .right-wrapper {
    position: relative;
    flex: 0 0 28px;
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
    border-top: 8px solid  #F56C6C;
    border-left: 8px solid #f8f8f8;
  }

</style>
