<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUser"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUser = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="queryInfo.userList" style="width: 100%" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑"
              placement="top"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="userEdit(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除"
              placement="top"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="userDel(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="设置"
              placement="top"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUser"
      width="50%"
      @close="colseAdd"
    >
      <el-form
        :model="userForm"
        :rules="userRules"
        ref="userRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="userForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUser = false">取 消</el-button>
        <el-button type="primary" @click="userAdd">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUser"
      width="50%"
      @close="colseEdit"
    >
      <el-form
        :model="editFrom"
        :rules="editRules"
        ref="editRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUser = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色 -->
    <el-dialog
      title="分配角色"
      :visible.sync="showRole"
      width="50%"
      @close="closeRole"
    >
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectRole" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRole = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //   验证邮箱
    var checkEmail = (rule, val, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(val)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱！'))
    }
    // 验证手机号
    var checkMobile = (rule, val, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(val)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号！'))
    }
    return {
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 1,
      addUser: false,
      editUser: false,
      userForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFrom: {},
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      showRole: false,
      userInfo: {},
      roleList: [],
      selectRole: ''
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    // 获取用户数据
    async getUser() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.queryInfo.userList = res.data.users
      this.total = res.data.total
    },
    // 每页显示几条
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUser()
    },
    // 监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUser()
    },
    // 修改用户状态
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新状态成功!')
    },
    // 关闭添加表单 并清空
    colseAdd() {
      this.$refs.userRef.resetFields()
    },
    // 关闭添加表单 并清空
    colseEdit() {
      this.$refs.editRef.resetFields()
    },
    // 添加用户
    userAdd() {
      this.$refs.userRef.validate(async val => {
        if (!val) return
        const { data: res } = await this.$http.post('users', this.userForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败!')
        this.$message.success('添加用户成功!')
        // 关闭对话框
        this.addUser = false
        // 重新获取用户数据
        this.getUser()
      })
    },
    // 编辑用户
    async userEdit(id) {
      // 根据id 查询当前行元素的数据
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询数据失败！')
      }
      console.log(res.data)
      this.editFrom = res.data
      this.editUser = true
    },
    // 编辑用户预校验 后端判断用户信息首发合法
    editUserInfo() {
      this.$refs.editRef.validate(async val => {
        // 预验证通过 发起数据请求 终止程序
        if (!val) return
        const { data: res } = await this.$http.put(
          'users/' + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败！')
        }
        // 关闭对话框
        this.editUser = false
        // 刷新数据
        this.getUser()
        // 提示更新成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 删除用户
    async userDel(id) {
      // 确认用户是否删除 返回值是promise对象
      const ret = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (ret !== 'confirm') {
        return this.$message.info('已取消删除操作！')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      this.getUser()
    },
    // 弹出分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在弹出对话框之前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
      this.showRole = true
    },
    async allotRole() {
      if (!this.selectRole) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRole
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('分配用户角色成功！')
      this.getUser()
      this.showRole = false
    },
    // 清空下拉菜单
    closeRole() {
      this.selectRole = ''
      this.userInfo = ''
    }
  }
}
</script>

<style lang="less" scoped></style>
