<template>
  <el-dialog
    title="账单清单"
    :fullscreen="true"
    :append-to-body="true"
    :visible.sync="dialogVisible"
  >
    <el-table :data="bill" size="mini" show-summary>
      <el-table-column label="司机" prop="driver.name" width="80px" align="center"></el-table-column>
      <el-table-column label="常规费用" prop="fee" width="80px" align="center"></el-table-column>
      <el-table-column label="补货费用" prop="additionalFee" width="80px" align="center"></el-table-column>
      <el-table-column label="考核处罚" prop="penaltyFee" width="80px" align="center"></el-table-column>
      <el-table-column label="费用总计" prop="totalFee" width="80px" align="center"></el-table-column>
      <el-table-column label="处罚事由" prop="reasonsStr" width="192px"></el-table-column>
      <el-table-column label="线路详情" prop="routeStr"></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ConfigurationTaskPanel from "../ConfigurationTaskPanel/index";
import ConfigurationVehiclePanel from "../ConfigurationVehiclePanel/index";
import ConfigurationDriverPanel from "../ConfigurationDriverPanel/index";
import { DriverPaymentRow } from "../../engine/domain/DriverPaymentRow";
import { RoutePool } from "../../engine/domain/Route";
import { ShipmentTourActivity } from "../../engine/domain/Activity";

@Component({
  name: "LogisticBillDialog",
  components: {
    ConfigurationDriverPanel,
    ConfigurationVehiclePanel,
    ConfigurationTaskPanel
  }
})
export default class extends Vue {
  private dialogVisible: boolean = false;
  private bill: Array<DriverPaymentRow> = new Array<DriverPaymentRow>();
  private totalFee: number = 0;
  private totalAdditionalFee: number = 0;
  private totalPenaltyFee: number = 0;

  constructor() {
    super();
  }

  @Watch("dialogVisible")
  onDialogShowed() {
    if (this.dialogVisible) {
      this.bill = new Array<DriverPaymentRow>();

      let routes = RoutePool.getInstance().routes;

      for (let i in routes) {
        let driver = routes[i].driver;

        if (driver) {
          let fee = routes[i].fee;
          let additionalFee = routes[i].additionalFee;

          let row = new DriverPaymentRow(driver);

          row.fee = fee;
          row.additionalFee = additionalFee;
          row.totalFee =
            Number.parseInt(String(row.fee)) +
            Number.parseInt(String(row.additionalFee)) -
            Number.parseInt(String(driver.punishment.penaltyFee));
          row.penaltyFee = -Number.parseInt(
            String(driver.punishment.penaltyFee)
          );

          for (let j in driver.punishment.reasons) {
            if(row.reasonsStr == "无")
              row.reasonsStr = "";
            row.reasonsStr += driver.punishment.reasons[j] + " ";
          }

          for (let k in routes[i].activities) {
            if (routes[i].activities[k] instanceof ShipmentTourActivity) {
              if(row.routeStr == "无")
                row.routeStr = "";
              row.routeStr += routes[i].activities[k].name + " ";
            }
          }

          this.bill.push(row);
        }
      }
    }
  }

  showDialog() {
    this.dialogVisible = true;
  }
}
</script>

<style lang="scss" scoped>
.fee-cell {
  flex: 1;
}
</style>
