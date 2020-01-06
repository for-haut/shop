<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectKey"
            :options="cateList"
            :props="cateProps"
            @change="cateChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签 -->
      <el-tabs v-model="activeName" @tab-click="cateClick(activeName)">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtn"
            >添加参数</el-button
          >
          <!-- 动态参数 -->
          <el-table :data="manyData" style="width: 100%" border stripe>
            <el-table-column type="expand"> </el-table-column>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                >修改</el-button
              >
              <el-button type="danger" size="mini" icon="el-icon-delete"
                >删除</el-button
              >
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtn"
            >添加属性</el-button
          >
          <!-- 静态属性 -->
          <el-table :data="onlyData" style="width: 100%" border stripe>
            <el-table-column type="expand"> </el-table-column>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <el-button type="primary" size="mini" icon="el-icon-edit"
                >修改</el-button
              >
              <el-button type="danger" size="mini" icon="el-icon-delete"
                >删除</el-button
              >
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectKey: [],
      activeName: 'many',
      manyData: [],
      onlyData: []
    }
  },
  created() {
    this.getCate()
  },
  computed: {
    isBtn() {
      // 禁用-true  启用-false
      if (this.selectKey.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectKey.length === 3) {
        return this.selectKey[2]
      }
      return null
    }
  },
  methods: {
    // 获取分类数据
    async getCate() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败！')
      }
      this.cateList = res.data
    },
    cateChange() {
      this.getParams()
    },
    cateClick() {
      this.getParams()
    },
    async getParams() {
      if (this.selectKey.length !== 3) {
        this.selectKey = []
        return this.$message.error('选择的不是三级分类')
      }
      // 根据id 和 面板 获取参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数失败！')
      }
      //  参数 及 属性  数据
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-table {
    margin-top: 15px;
}
</style>
