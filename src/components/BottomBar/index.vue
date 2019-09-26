<template>
  <div class="bottom-bar-container">

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'

  @Component({
    name: 'BottomBar'
  })
  export default class extends Vue {

  }
</script>

<style lang="scss" scoped>
  .bottom-bar-container{
    height: 24px;
    background: #d8d8d8;
    width: 100%;
  }
</style>
