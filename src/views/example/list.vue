<template>
  <div class="app-container">

    <el-table :data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%"
              @row-click="rowClick">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column align="center" prop="title" label="title" width="180" sortable></el-table-column>
      <el-table-column align="center" prop="tags" label="tags" width="180" sortable>
        <template slot-scope="scope">
          <span>{{scope.row.tags.slice(2,scope.row.tags.length-2)}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="categories" label="categories" width="180" sortable>
        <template slot-scope="scope">
          <span>{{scope.row.categories.slice(2,scope.row.categories.length-2)}}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" prop="date" align="center" label="date" :sortable="true">
        <template slot-scope="scope">
          <span>{{scope.row.date}}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="content">
        <template slot-scope="scope">
          <span style="white-space: nowrap">{{scope.row.content.substr(0,100)}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link :to="'/example/edit/'+scope.row.filename.slice(0,scope.row.filename.length-3)">
            <el-button type="primary" size="small" icon="el-icon-edit">Edit</el-button>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column align="center" label="del" width="120">
        <template>
          <el-button type="primary" icon="el-icon-delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import { fetchList } from './articleService'

export default {
  name: 'articleList',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    rowClick(e) {
      console.log(e)
    },
    async getList() {
      this.listLoading = true
      try {
        const res = await fetchList(this.listQuery)
        this.listLoading = false
        if (res) {
          this.list = res.data.articleList
          this.total = res.data.articleList.length
        }
      } catch (err) {
        this.listLoading = false
        this.$message({
          message: '网络错误',
          type: 'error'
        })
      }
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
