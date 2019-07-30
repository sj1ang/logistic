<template>
  <div :class="type != 'depotTourActivity' ? 'activity-wrapper' : 'activity-wrapper depot-activity-wrapper'"
       @click="showDialog">
    <div class="left-wrapper">
      <div class="left-upper-wrapper">
        {{activity.name}} ({{activity.load.size[0]}})
      </div>
      <div class="left-bottom-wrapper" v-if="activity.routeUid">
        {{activity.arriveTimeStr}} <span v-if="type != 'depotTourActivity'">{{activity.startTimeStr}} {{activity.endTimeStr}}</span>
      </div>
      <div class="left-bottom-wrapper" v-else>
        {{wrapper.twStartStr}}-{{wrapper.twEndStr}}
      </div>
    </div>
    <div class="right-wrapper" v-if="type != 'depotTourActivity'">
      <div :class="['triangle-wrapper', {'triangle-wrapper-caution': activity.noticeManager.noticeLevel == 3}, {'triangle-wrapper-error': activity.noticeManager.noticeLevel == 5}]"></div>
      <!--{{activity.noticeManager.noticeLevel}}-->
    </div>
    <el-dialog title="配送信息" :visible.sync="dialogVisible" :append-to-body='true' width="50%" :close-on-click-modal="false">
      <el-form v-model="wrapper" size="mini" label-width="80px">
        <el-form-item label="时间窗口">
          <el-col :span="11">
          <el-time-select
            placeholder="起始时间"
            v-model="wrapper.twStartStr"
            :picker-options="{
          start: '08:30',
          step: '00:15',
          end: '18:30'
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
          start: '08:30',
          step: '00:15',
          end: '18:30',
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
        <el-form-item style="text-align: right">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="confirm">确定</el-button>
        </el-form-item>
      </el-form>
      <!--<span slot="footer" class="dialog-footer">-->
      <!--<el-button size="mini" >取 消</el-button>-->
      <!--<el-button size="mini" type="primary">确 定</el-button>-->
      <!--</span>-->
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import {
    DepotTourActivity,
    ShipmentTourActivity,
    TourActivityWrapper,
    TourActivity
  } from '../../engine/domain/Activity'
  import {convertTime2Min} from "../../utils/common"
  import {Route, RoutePool} from "../../engine/domain/Route"

  @Component({
    name: 'ShipmentActivity'
  })
  export default class extends Vue {
    @Prop() private activity: TourActivity;
    private type: string;
    private dialogVisible: boolean = false;
    private wrapper: TourActivityWrapper;

    constructor() {
      super();
      if (this.activity instanceof DepotTourActivity) {
        this.type = "depotTourActivity";
      } else if (this.activity instanceof ShipmentTourActivity) {
        this.type = "shipmentTourActivity";
      }

      this.wrapper = new TourActivityWrapper(this.activity);
    }

    showDialog() {
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

      let route: Route = RoutePool.getInstance().routes.find(x=>{
        return x.uid == this.activity.routeUid;
      })

      if(route){
        route.updateRoute();
      }

      this.dialogVisible = false;
    }
  }
</script>

<style lang="scss" scoped>
  .activity-wrapper {
    height: 32px;
    width: 152px;
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
