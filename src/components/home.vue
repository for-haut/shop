<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 清空 token
      window.sessionStorage.clear()
      // 跳回登陆页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less"></style>
