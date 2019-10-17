<template>
  <el-dialog title="司机考核" :append-to-body='true' :visible.sync="dialogVisible" width="480px">
    <el-form label-width="80px" size="mini">
      <el-form-item label="630菜框">
        <!--<el-col :span="2"><svg-icon name="depart"/></el-col>-->
        <el-col :span="11"><el-input></el-input></el-col>
        <el-col :span="2" style="text-align: center; font-size: 20px; color: #4AB7BD;"><div><svg-icon name="exchange"/></div></el-col>
        <el-col :span="11"><el-input></el-input></el-col>
      </el-form-item>
      <el-form-item label="标准菜框">
        <el-col :span="11"><el-input></el-input></el-col>
        <el-col :span="2"  style="text-align: center; font-size: 20px; color: #4AB7BD;"><div><svg-icon name="exchange"/></div></el-col>
        <el-col :span="11"><el-input></el-input></el-col>
      </el-form-item>
      <el-form-item label="红色肉框">
        <el-col :span="11"><el-input></el-input></el-col>
        <el-col :span="2"  style="text-align: center; font-size: 20px; color: #4AB7BD;"><div><svg-icon name="exchange"/></div></el-col>
        <el-col :span="11"><el-input></el-input></el-col>
      </el-form-item>
    </el-form>
    <el-form :model="driver.punishment" label-width="80px" size="mini">
      <el-form-item label="考核理由">
        <el-checkbox-group v-model="driver.punishment.reasons" style="display: flex; justify-content: space-between;">
          <el-checkbox style="font-weight: normal" label="送货迟到"></el-checkbox>
          <el-checkbox style="font-weight: normal" label="货物损坏"></el-checkbox>
          <el-checkbox style="font-weight: normal" label="货品遗漏"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="罚款数额">
        <el-input v-model="driver.punishment.penaltyFee" type="number"></el-input>
      </el-form-item>
    </el-form>

  </el-dialog>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {Driver} from "../../engine/domain/Driver"

  @Component({
    name: 'DriverPenaltyDialog'
  })
  export default class extends Vue {
    @Prop() private driver: Driver;
    private dialogVisible: boolean = false;

    showDialog() {
      this.dialogVisible = true;
    }
  }
</script>

<style lang="scss" scoped>

</style>
