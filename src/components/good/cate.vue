<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
        <!-- 表格 -->
        <tree-table
          :data="cateList"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index
          index-text=""
          border
          :show-row-hover="false"
        >
          <!-- 有效 -->
          <template slot="ok" slot-scope="scope">
            <i
              class="el-icon-error"
              style="color: red"
              v-if="scope.row.cat_delete === false"
            ></i>
            <i class="el-icon-success" style="color: lightgreen" v-else></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag
              type="success"
              size="mini"
              v-else-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" class="el-icon-edit">编辑</el-button>
            <el-button
              type="danger"
              class="el-icon-delete"
              @click="cateDel(scope.row.cat_id)"
              >删除</el-button
            >
          </template>
        </tree-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 8, 10]"
          :page-size="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
      <!-- 添加分类 -->
      <el-dialog
        title="添加分类"
        :visible.sync="showAdd"
        width="50%"
        @close="closeCate"
      >
        <el-form
          :model="cateForm"
          :rules="cateRules"
          ref="cateRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="cateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectKey"
              :options="parCateList"
              :props="cateProps"
              @change="cateChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showAdd = false">取 消</el-button>
          <el-button type="primary" @click="cateAdd">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      total: 0,
      queryInfo: {
        type: [],
        pagenum: 1,
        pagesize: 5
      },
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'ok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      showAdd: false,
      cateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      cateRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      selectKey: [],
      parCateList: [],
      cateProps: {
        checkStrictly: 'true',
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        chilren: 'children'
      }
    }
  },
  created() {
    this.getCate()
  },
  methods: {
    // 获取分类数据
    async getCate() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 当前显示几条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCate()
    },
    // 当前页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCate()
    },
    // 显示添加分类
    addCate() {
      this.getParentList()
      this.showAdd = true
    },
    // 获取父级分类列表
    async getParentList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表失败！')
      }
      this.parCateList = res.data
    },
    // 当下拉框改变时 获取选择项的id
    cateChange(selectKey) {
      if (this.selectKey.length > 0) {
        this.cateForm.cat_pid = this.selectKey[this.selectKey.length - 1]
        this.cateForm.cat_level = this.selectKey.length
      } else {
        this.cateForm.cat_pid = 0
        this.cateForm.cat_level = 0
      }
    },
    // 预验证 请求添加分类数据
    cateAdd() {
      this.$refs.cateRef.validate(async val => {
        if (!val) return console.log(val)
        const { data: res } = await this.$http.post('categories', this.cateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCate()
        this.showAdd = false
      })
    },
    // 清空 from表单
    closeCate() {
      this.$refs.cateRef.resetFields()
      this.selectKey = []
    },
    // 删除分类
    async cateDel(id) {
      const delRet = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (delRet !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      this.getCate()
    }
  }
}
</script>

<style lang="less" scoped>
.el-col {
  margin-bottom: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
