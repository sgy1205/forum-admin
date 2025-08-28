<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="角色状态"
          style="width: 240px"
        >
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="备注" prop="remark" width="150" />
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改角色对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：system:role:list" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll">全选/全不选</el-checkbox>
          <el-tree
            class="tree-border mt-2"
            :data="menuOptions"
            show-checkbox
            ref="menuTree"
            node-key="id"
            :check-strictly="form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Role",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 菜单树相关
      menuOptions: [],
      menuExpand: false,
      menuNodeAll: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表单参数
      form: {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: "0",
        menuIds: [],
        menuCheckStrictly: false, // 父子联动开启
        remark: undefined
      },
      // 树结构配置
      defaultProps: {
        children: "children",
        label: "menuName" // 菜单名称字段
      },
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" }
        ],
        roleKey: [
          { required: true, message: "权限字符不能为空", trigger: "blur" }
        ],
        roleSort: [
          { required: true, message: "角色顺序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      this.$axios.get('/role/pageList', { params: this.queryParams })
        .then(res => {
          this.roleList = res.rows;
          this.total = res.total;
          this.loading = false;
        })
        .catch(err => {
          console.error('获取角色列表失败：', err);
          this.loading = false;
          this.$message.error('获取角色列表失败');
        });
    },

    /** 获取菜单权限树（改用/menu/menuList接口） */
    getMenuTree() {
      this.$axios.get('/menu/menuList')
        .then(res => {
          // 转换菜单数据格式适配el-tree（menuId→id，menuName→label）
          this.menuOptions = this.transformMenuTree(res.data);
        })
        .catch(err => {
          console.error('获取菜单树失败：', err);
          this.$message.error('获取菜单权限失败');
        });
    },

    /** 转换菜单树结构 */
    transformMenuTree(menuList) {
      return menuList.map(menu => ({
        id: menu.menuId, // 适配el-tree的node-key
        menuName: menu.menuName, // 菜单名称
        children: menu.children ? this.transformMenuTree(menu.children) : [] // 递归处理子菜单
      }));
    },

    /** 角色状态修改 */
    handleStatusChange(row) {
      const text = row.status === "0" ? "启用" : "停用";
      this.$confirm(`确认要${text}"${row.roleName}"角色吗？`)
        .then(() => {
          this.$axios.post('/role/updateStatus/' + row.roleId)
            .then(res => {
              if (res.code === 200) {
                this.$message.success(`${text}成功`);
              } else {
                this.$message.error(`${text}失败：${res.msg}`);
                row.status = row.status === "0" ? "1" : "0"; // 回滚状态
              }
            })
            .catch(err => {
              console.error('修改角色状态失败：', err);
              this.$message.error(`${text}失败`);
              row.status = row.status === "0" ? "1" : "0"; // 回滚状态
            });
        })
        .catch(() => {
          row.status = row.status === "0" ? "1" : "0"; // 取消操作回滚状态
        });
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.resetForm();
    },

    // 表单重置
    resetForm() {
      if (this.$refs.menuTree) {
        this.$refs.menuTree.setCheckedKeys([]);
      }
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: "0",
        menuIds: [],
        menuCheckStrictly: false,
        remark: undefined
      };
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    // 菜单树展开/折叠
    handleCheckedTreeExpand(value) {
      this.menuOptions.forEach(menu => {
        this.$refs.menuTree.store.nodesMap[menu.id].expanded = value;
      });
    },

    // 菜单树全选/全不选
    handleCheckedTreeNodeAll(value) {
      this.$refs.menuTree.setCheckedNodes(value ? this.menuOptions : []);
    },

    /** 新增角色 */
    handleAdd() {
      this.resetForm();
      this.getMenuTree(); // 加载菜单树
      this.open = true;
      this.title = "添加角色";
    },

    /** 修改角色 */
    handleUpdate(row) {
      this.resetForm();
      const roleId = row ? row.roleId : this.ids[0];
      
      // 1. 获取角色详情
      this.$axios.get(`/role/${roleId}`)
        .then(res => {
          this.form = res.data;
          // 2. 加载菜单树并回显选中状态
          this.getMenuTree();
          this.open = true;
          this.title = "修改角色";
          
          // 3. 菜单树加载完成后回显权限
          this.$nextTick(() => {
            if (this.form.menuIds && this.form.menuIds.length) {
              this.$refs.menuTree.setCheckedKeys(this.form.menuIds);
            }
          });
        })
        .catch(err => {
          console.error('获取角色详情失败：', err);
          this.$message.error('获取角色信息失败');
        });
    },

    /** 提交表单（新增/修改） */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 收集选中的菜单ID
          this.form.menuIds = this.$refs.menuTree.getCheckedKeys();
          
          const request = this.form.roleId 
            ? { method: 'put', url: '/role', data: this.form }
            : { method: 'post', url: '/role', data: this.form };

          this.$axios(request)
            .then(res => {
              if (res.code === 200) {
                this.$message.success(this.form.roleId ? "修改成功" : "新增成功");
                this.open = false;
                this.getList();
              } else {
                this.$message.error(res.msg || (this.form.roleId ? "修改失败" : "新增失败"));
              }
            })
            .catch(err => {
              console.error('提交角色失败：', err);
              this.$message.error('操作失败，请稍后重试');
            });
        }
      });
    },

    /** 删除角色 */
    handleDelete(row) {
      const roleIds = row ? [row.roleId] : this.ids;
      if (!roleIds.length) {
        this.$message.warning('请选择要删除的角色');
        return;
      }

      this.$confirm(`是否确认删除选中角色？`)
        .then(() => {
          this.$axios.delete('/role', { data: { roleIds } })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('删除成功');
                this.getList();
              } else {
                this.$message.error(res.msg || '删除失败');
              }
            })
            .catch(err => {
              console.error('删除角色失败：', err);
              this.$message.error('删除失败');
            });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.tree-border {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}
.fixed-width {
  width: 180px;
}
</style>