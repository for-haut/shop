<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- scope.row 获取当前行的信息 -->
            <el-row
              v-for="(item, index) in scope.row.children"
              :key="item.id"
              :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="rightDel(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']"
                  v-for="subItem in item.children"
                  :key="subItem.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="rightDel(scope.row, subItem.id)"
                      >{{ subItem.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级标签 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="childItem in subItem.children"
                      :key="childItem.id"
                      closable
                      @close="rightDel(scope.row, childItem.id)"
                      >{{ childItem.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
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
                @click="roleEdit(scope.row.id)"
                >编辑</el-button
              >
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
                @click="roleDel(scope.row.id)"
                >删除</el-button
              >
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
                @click="rightShow(scope.row)"
                >分配权限</el-button
              >
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 所有权限列表 -->
    <el-dialog title="分配权限" :visible.sync="showRight" width="50%">
      <el-tree
        :data="rightList"
        :props="rightTree"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKey"
        ref="rightRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRight = false">取 消</el-button>
        <el-button type="primary" @click="allotRight()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRole"
      width="50%"
      @close="closeAdd"
    >
      <el-form
        :model="roleForm"
        :rules="roleRules"
        ref="roleRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRole = false">取 消</el-button>
        <el-button type="primary" @click="roleAdd">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog title="提示" :visible.sync="editRole" width="50%">
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRole = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除角色 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      showRight: false,
      rightList: [],
      rightTree: {
        label: 'authName',
        children: 'children'
      },
      defKey: [],
      roleId: '',
      addRole: false,
      roleForm: {
        roleName: '',
        roleDesc: ''
      },
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ]
      },
      editRole: false,
      editForm: '',
      editRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRole()
  },
  methods: {
    // 获取角色列表
    async getRole() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
    },
    // 添加角色
    async roleAdd() {
      const { data: res } = await this.$http.post('roles', this.roleForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败！')
      }
      this.addRole = false
      this.getRole()
      this.$message.success('添加角色成功！')
    },
    // 清空弹出框数据
    closeAdd() {
      this.$refs.roleRef.resetFields()
    },
    // 根据id查询当前行元素
    async roleEdit(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑角色失败！')
      }
      this.editForm = res.data
      this.editRole = true
    },
    // 编辑用户预校验 后端判断用户信息是否合法
    async editRoleInfo() {
      const { data: res } = await this.$http.put(
        'roles/' + this.editForm.roleId,
        { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('编辑角色失败！')
      }
      this.editRole = false
      this.getRole()
      this.$message.success('编辑角色成功！')
    },
    // 删除角色
    async roleDel(id) {
      // 弹框 是否确认删除
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.getRole()
      this.$message.success('删除角色成功！')
    },
    // 删除角色权限
    async rightDel(role, rightId) {
      const ret = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      console.log(ret)
      if (ret !== 'confirm') {
        return this.$message.info('取消删除！')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      role.children = res.data
      this.$message.success('删除权限成功！')
    },
    // 展示角色权限
    async rightShow(role) {
      this.roleId = role.id
      // 弹出前获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.rightList = res.data
      this.getKey(role, this.defKey)
      this.showRight = true
    },
    // 递归获取已有权限数组
    getKey(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getKey(item, arr)
      })
    },
    // 分配角色权限
    async allotRight(role) {
      const key = [
        ...this.$refs.rightRef.getCheckedKeys(),
        ...this.$refs.rightRef.getHalfCheckedKeys()
      ]
      const idStr = key.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('用户权限分配失败！')
      }
      this.showRight = false
      this.getRole()
      this.$message.success('用户分配权限成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
