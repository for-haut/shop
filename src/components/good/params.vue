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
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="showAdd = true"
            >添加参数</el-button
          >
          <!-- 动态参数 -->
          <el-table :data="manyData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="tagDel(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editParams(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="paramsDel(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="showAdd = true"
            >添加属性</el-button
          >
          <!-- 静态属性 -->
          <el-table :data="onlyData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="tagDel(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editParams(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="paramsDel(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="showAdd"
      width="50%"
      @close="closeAdd"
    >
      <el-form
        :model="paramsForm"
        :rules="paramsRules"
        ref="paramsRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="paramsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAdd = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="showEdit"
      width="50%"
      @close="closeEdit"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEdit = false">取 消</el-button>
        <el-button type="primary" @click="paramsEdit">确 定</el-button>
      </span>
    </el-dialog>
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
      onlyData: [],
      showAdd: false,
      paramsForm: {
        attr_name: ''
      },
      paramsRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      showEdit: false,
      editForm: {
        attr_name: ''
      },
      editRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      inputVisible: false,
      inputValue: ''
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
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
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
    // 下拉框改变 刷新数据
    cateChange() {
      this.getParams()
    },
    // 切换动态参数 与 静态属性
    cateClick() {
      this.getParams()
    },
    // 获取动态参数及静态属性
    async getParams() {
      if (this.selectKey.length !== 3) {
        this.selectKey = []
        // 下拉框清空时 -- 参数也清空
        this.manyData = []
        this.onlyData = []
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
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      //  参数-many 及 属性-only
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    // 清空添加的from表单
    closeAdd() {
      this.$refs.paramsRef.resetFields()
    },
    // 提交添加数据
    addParams() {
      this.$refs.paramsRef.validate(async val => {
        if (!val) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.paramsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.showAdd = false
        this.getParams()
      })
    },
    // 修改参数
    async editParams(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/` + attrId
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editForm = res.data
      this.showEdit = true
    },
    // 清空编辑表单
    closeEdit() {
      this.$refs.editRef.resetFields()
    },
    // 编辑参数
    paramsEdit() {
      this.$refs.editRef.validate(async val => {
        if (!val) return
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.showEdit = false
        this.$message.success('修改参数成功！')
        this.getParams()
      })
    },
    // 删除参数
    async paramsDel(attrId) {
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
        return this.$message.info('已取消操作！')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/` + attrId
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParams()
    },
    // 显示输入框
    showInput(row) {
      row.inputVisible = true
      // 文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加tag参数
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue)
        row.inputValue = ''
        row.inputVisible = false
        this.setVals(row)
      }
    },
    // 删除tag参数
    tagDel(index, row) {
      row.attr_vals.splice(index)
      this.setVals(row)
    },
    // 将tag参数存储到数据库
    async setVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/` + row.attr_id,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改Tag参数失败！')
      }
      this.$message.success('修改Tag参数成功！')
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

.el-tag {
  margin-right: 15px;
}

.input-new-tag {
  width: 120px;
}
</style>
