<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧导航 -->
      <el-form
        :model="goodsForm"
        :rules="goodsRules"
        ref="goodsRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="tabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="goodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="goodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="goodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="goodsForm.goods_cat"
                :options="cateList"
                :props="goodsProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox
                  :label="subItem"
                  v-for="(subItem, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="reqHeader"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="goodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="showPic" width="50%">
      <img :src="prePath" alt="" class="preImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      goodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        attrs: [],
        goods_introduce: ''
      },
      goodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      goodsProps: {
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover'
      },
      manyData: [],
      onlyData: [],
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      reqHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      prePath: '',
      showPic: false
    }
  },
  created() {
    this.getCate()
  },
  computed: {
    cateId() {
      if (this.goodsForm.goods_cat.length === 3) {
        return this.goodsForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 获取商品分类列表
    async getCate() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    // 必须选择三级分类
    handleChange() {
      if (this.goodsForm.goods_cat.length !== 3) {
        this.goodsForm.goods_cat = []
      }
    },
    // tab切换条件
    tabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.goodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类！')
        // 阻止标签页切换
        return false
      }
    },
    // 标签页被点击时触发
    async tabClick() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败！')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败！')
        }
        this.onlyData = res.data
      }
    },
    // 图片预览
    handlePreview(file) {
      this.prePath = file.response.data.url
      console.log(this.prePath)
      this.showPic = true
    },
    // 删除图片
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.goodsForm.pics.findIndex(x => {
        x.pic = filePath
      })
      this.goodsForm.pics.splice(i, 1)
    },
    // 上传到添加商品表单中
    uploadSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.goodsForm.pics.push(picInfo)
    },
    // 添加商品
    addGoods() {
      // 表单预校验
      this.$refs.goodsRef.validate(async val => {
        if (!val) {
          return this.$message.error('请填写表单必要项！')
        }
        // lodash 深拷贝goodsForm数据
        const form = _.cloneDeep(this.goodsForm)
        // 将goods_cat改成string
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            atter_value: item.attr_vals.join(' ')
          }
          this.goodsForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            atter_value: item.attr_vals
          }
          this.goodsForm.attrs.push(newInfo)
        })
        form.attrs = this.goodsForm.attrs
        // 发送添加请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.preImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>
