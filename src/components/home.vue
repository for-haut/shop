<template>
  <div>
    <!-- 主体 -->
    <el-container class="home-container">
      <!-- 头部 -->
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- main -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isColl == true ? '64px' : '200px'">
          <div class="toggle" @click="toggleColl">|||</div>
          <el-menu
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#409eff"
            unique-opened
            :collapse="isColl"
            :collapse-transition="false"
            :router="true"
            :default-active="activePath"
          >
            <!-- 一级菜单 -->
            <el-submenu
              :index="item.id + ''"
              v-for="item in menuList"
              :key="item.id"
            >
              <template slot="title">
                <i :class="iconList[item.id]"></i>
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/' + subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
                @click="nameState('/' + subItem.path)"
              >
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- content -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      activePath: '',
      isColl: false,
      iconList: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      }
    }
  },
  created() {
    this.getList()
  },
  beforeUpdate() {
    // 设置二级菜单路径
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 清空 token
      window.sessionStorage.clear()
      // 跳回登陆页面
      this.$router.push('/login')
    },
    // 侧边栏切换 isColl状态
    toggleColl() {
      this.isColl = !this.isColl
    },
    // 获取菜单数据
    async getList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(this.menuList)
    },
    // 保存链接状态
    nameState(activePath) {
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  padding-left: 0;
  background: #373d41;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  height: 600px;
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}

.el-main {
  height: 600px;
  background-color: #eaedf1;
}

.toggle {
  color: #fff;
  background-color: #4a5064;
  font-size: 10px;
  text-align: center;
  line-height: 24px;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.iconfont {
  margin-right: 10px;
}
</style>
