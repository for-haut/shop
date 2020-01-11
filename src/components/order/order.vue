<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-input placeholder="请输入内容" style="width: 350px">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <!-- 订单数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80">
        </el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="80">
          <template slot-scope="scope">
            <el-tag type="danger">{{
              scope.row.order_pay === '1' ? '已付款' : '未付款'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editAddress"
          ></el-button>
          <el-button
            type="success"
            icon="el-icon-location"
            size="mini"
            @click="progressBox"
          ></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址 -->
    <el-dialog
      title="修改地址"
      :visible.sync="showAddress"
      width="50%"
      @close="closeAddress"
    >
      <el-form
        :model="AddressForm"
        :rules="AddressRules"
        ref="AddressRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="addr1">
          <el-cascader
            :options="cityData"
            v-model="AddressForm.attr1"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addr2">
          <el-input v-model="AddressForm.addr2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddress = false">取 消</el-button>
        <el-button type="primary" @click="showAddress = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度 -->
    <el-dialog title="物流进度" :visible.sync="showProgress" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagesize: 5,
        pagenum: 1
      },
      orderList: [],
      total: 0,
      showAddress: false,
      AddressForm: {
        addr1: [],
        addr2: ''
      },
      AddressRules: {
        addr1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        addr2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      cityData,
      showProgress: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrder()
  },
  methods: {
    // 获取订单数据
    async getOrder() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败！')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrder()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrder()
    },
    // 显示修改地址对话框
    editAddress() {
      this.showAddress = true
    },
    // 表单关闭时 清空表单
    closeAddress() {
      this.$refs.AddressRef.resetFields()
    },
    // 物流进度
    async progressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.progressInfo = res.data
      this.showProgress = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}

.el-cascader {
  width: 100%;
}
</style>
