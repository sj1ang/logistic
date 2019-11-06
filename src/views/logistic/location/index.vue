<template>
  <div>
    <el-table :data="locations" border style="width: 100%" size="mini">
      <el-table-column prop="id" label="编号" width="56px"> </el-table-column>
      <el-table-column prop="name" label="名称"> </el-table-column>
      <el-table-column prop="alias" label="简称" width="120px">
      </el-table-column>
      <el-table-column label="纬度" width="120px">
        <template slot-scope="scope">
          {{ locations[scope.$index].latitude.toFixed(6) }}
        </template>
      </el-table-column>
      <el-table-column label="经度" width="120px">
        <template slot-scope="scope">
          {{ locations[scope.$index].longitude.toFixed(6) }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址"> </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="tryRemoveLocation(locations[scope.$index])"
            >删除</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="editLocation(locations[scope.$index])"
            >编辑</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 4px 16px; float: right">
      <el-button size="mini" type="primary" @click="addLocation"
        >新增客户地址</el-button
      >
      <el-button size="mini" type="warning" @click="updateTransportCostMatrix">更新地理信息</el-button>
    </div>

    <el-dialog
      title="地址信息"
      :visible.sync="dialogVisible"
      width="50%"
      v-if="dialogVisible"
    >
      <el-form :model="currentLocation" label-width="80px" size="mini">
        <el-form-item label="编号">
          <el-input v-model="currentLocation.id" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="currentLocation.name"></el-input>
        </el-form-item>
        <el-form-item label="简称">
          <el-input v-model="currentLocation.alias"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="currentLocation.latitude" type="number"></el-input>
        </el-form-item>
        <el-form-item label="经度">
          <el-input
            v-model="currentLocation.longitude"
            type="number"
          ></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="currentLocation.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdateLocation" size="mini"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import {
  MyLocation,
  MyLocationImpl,
  MyLocationPool
} from "../../../engine/domain/MyLocation";
import {delLocation, postLocation, postTransportCosts} from "../../../api";

@Component({
  name: "Location"
})
export default class extends Vue {
  private locations: Array<MyLocation>;
  private currentLocation: MyLocationWrapper;
  private dialogVisible: boolean = false;

  constructor() {
    super();
    this.locations = new Array<MyLocation>();
    this.currentLocation = {
      id: "",
      name: "",
      alias: "",
      address: "",
      longitude: "",
      latitude: ""
    };
  }

  mounted() {
    MyLocationPool.fetchLocationArray().then(res => {
      this.locations.splice(0, this.locations.length);
      res.forEach(value => {
        this.locations.push(value);
      });
    });
  }

  saveOrUpdateLocation(): void {
    this.dialogVisible = false;
    let tmpLocation: MyLocation = new MyLocationImpl(
      parseInt(this.currentLocation.id),
      this.currentLocation.name,
      this.currentLocation.address,
      this.currentLocation.alias,
      parseFloat(this.currentLocation.latitude),
      parseFloat(this.currentLocation.longitude)
    );
    postLocation(tmpLocation).then(res => {
      MyLocationPool.fetchLocationArray().then(res => {
        this.locations.splice(0, this.locations.length);
        res.forEach(value => {
          this.locations.push(value);
        });
      });
    });
  }

  setCurrentLocation(location: MyLocation) {
    this.currentLocation.id = String(location.id);
    this.currentLocation.name = String(location.name);
    this.currentLocation.alias = location.alias;
    this.currentLocation.address = location.address;
    this.currentLocation.longitude = String(location.longitude);
    this.currentLocation.latitude = String(location.latitude);
  }

  editLocation(location: MyLocation) {
    this.setCurrentLocation(location);
    this.dialogVisible = true;
  }

  addLocation() {
    this.currentLocation.id = "-1";
    this.currentLocation.name = "";
    this.currentLocation.alias = "";
    this.currentLocation.address = "";
    this.currentLocation.longitude = "";
    this.currentLocation.latitude = "";
    this.dialogVisible = true;
  }

  removeLocation(location: MyLocation) {
    let params = {params: {id: location.id}}
    delLocation(params).then(res => {
      MyLocationPool.fetchLocationArray().then(res => {
        this.locations.splice(0, this.locations.length);
        res.forEach(value => {
          this.locations.push(value);
        });
      });
    });
  }

  tryRemoveLocation(location: MyLocation){
    this.$confirm('是否删除该地址', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.removeLocation(location);
      this.$message({
        type: 'success',
        message: '删除成功!'
      });
    }).catch(() => {

    });
  }

  updateTransportCostMatrix(){
    let params = {}
    postTransportCosts(params).then(res=>{
      console.log('xxxx');
      console.log(res);
    });
  }
}

interface MyLocationWrapper {
  id: string;
  name: string;
  alias: string;
  address: string;
  longitude: string;
  latitude: string;
}
</script>

<style lang="scss" scoped></style>
