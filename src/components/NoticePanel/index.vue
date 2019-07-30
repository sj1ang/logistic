<template>
  <div>
    <div v-for="(notice, index) in route.noticeManager.notices">
      <!--<div class="notice-level-index"></div>-->
      <div :class="['notice-row-wrapper', {'notice-caution': notice.noticeLevel == 3}, {'notice-error': notice.noticeLevel == 5}]">
        {{notice.hint}}
      </div>
    </div>
    <div v-for="(activity, index) in route.activities">
      <div v-for="(notice, index) in activity.noticeManager.notices">
        <div :class="['notice-row-wrapper', {'notice-caution': notice.noticeLevel == 3}, {'notice-error': notice.noticeLevel == 5}]">
          {{activity.name}} {{notice.hint}}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator'
  import {Route} from '../../engine/domain/Route'

  @Component({
    name: 'NoticePanel'
  })
  export default class extends Vue {
    @Prop() private route: Route;
  }
</script>

<style lang="scss" scoped>
  .notice-row-wrapper{
    margin-top: 4px;
    padding-left: 4px;
    height: 24px;
    line-height: 24px;
    flex: 1;
  }

  .notice-caution{
    color: #E7AD5F;
    background: #FCF5EC;
  }

  .notice-error{
    background: #FEF0F0;
    color: #F47B7D;
  }



</style>
