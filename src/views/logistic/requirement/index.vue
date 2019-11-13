<template>
  <div>
    <el-table :data="requirements" border style="width: 100%" size="mini">
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="alias" label="单位"></el-table-column>
      <el-table-column prop="startTime" label="开始时间"></el-table-column>
      <el-table-column prop="endTime" label="结束时间"></el-table-column>
      <el-table-column prop="serviceTime" label="服务时间"></el-table-column>

      <el-table-column label="相关账户" width="120px">
        <template slot-scope="scope">
          <div v-for="item in requirements[scope.$index].accounts">
            {{ item }}
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="editRequirement(scope.$index)"
            >编辑</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="服务信息"
      :visible.sync="dialogVisible"
      width="50%"
      v-if="dialogVisible"
    >
      <el-form :model="currentRequirement" size="mini" label-width="80px">
        <el-form-item label="单位名称">
          <el-input
            v-model="currentRequirement.alias"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="时间窗口">
          <el-col :span="11">
            <el-time-select
              v-model="currentRequirement.startTime"
              :picker-options="{
                start: '08:30',
                step: '00:05',
                end: '18:30'
              }"
              placeholder="选择时间"
              style="width: 100%"
            >
            </el-time-select>
          </el-col>
          <el-col :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-time-select
              v-model="currentRequirement.endTime"
              :picker-options="{
                start: '08:30',
                step: '00:05',
                end: '18:30'
              }"
              placeholder="选择时间"
              style="width: 100%"
            >
            </el-time-select>
          </el-col>
        </el-form-item>
        <el-form-item label="服务时间">
          <el-input
            v-model="currentRequirement.serviceTime"
            type="number"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveRequirement" size="mini"
        >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { getRequirements } from "../../../api";

@Component({
  name: "Requirement"
})
export default class extends Vue {
  requirements: Array<Requirement>;
  currentRequirement: Requirement;
  private dialogVisible: boolean = false;

  constructor() {
    super();
    this.requirements = new Array<Requirement>();
    let tmp = new Array<string>();
    this.currentRequirement = {
      id: 0,
      locationId: 0,
      serviceTime: "",
      startTime: "",
      endTime: "",
      alias: "",
      accounts: tmp
    };
  }

  getRequirementList() {
    let params = {};
    getRequirements(params).then(res => {
      for (let i in res) {
        let requirement: Requirement = res[i];
        this.requirements.push(requirement);
      }
      console.log(this.requirements);
    });
  }

  mounted() {
    this.getRequirementList();
  }

  editRequirement(index) {
    let tempRequirement = this.requirements[index];
    this.currentRequirement.id = tempRequirement.id;
    this.currentRequirement.locationId = tempRequirement.locationId;
    this.currentRequirement.serviceTime = tempRequirement.serviceTime;
    this.currentRequirement.startTime = tempRequirement.startTime;
    this.currentRequirement.endTime = tempRequirement.endTime;
    this.currentRequirement.alias = tempRequirement.alias;
    let accounts = new Array<string>();
    for (let i in tempRequirement.accounts) {
      accounts.push(tempRequirement.accounts[i]);
    }
    this.currentRequirement.accounts = accounts;
    this.dialogVisible = true;
  }

  saveRequirement(){
    console.log("save requirement...")
  }
}

interface Requirement {
  id: number;
  locationId: number;
  serviceTime: string;
  startTime: string;
  endTime: string;
  alias: string;
  accounts: Array<string>;
}
</script>

<style lang="scss" scoped></style>
