<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
            <el-form-item label="菜单名称" prop="menuName">
                <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="菜单状态">
                    <el-option label="正常" value="0" />
                    <el-option label="禁用" value="1" />
                </el-select>
            </el-form-item>
            <el-form-item label="菜单类型" prop="menuType">
                <el-select v-model="queryParams.menuType" placeholder="菜单类型">
                    <el-option label="目录" value="0" />
                    <el-option label="菜单" value="1" />
                    <el-option label="按钮" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="default" plain icon="el-icon-filter" size="mini" @click="toggleSearch">
                    {{ showSearch ? '隐藏搜索' : '显示搜索' }}
                </el-button>
            </el-col>
        </el-row>

        <el-table v-if="refreshTable" v-loading="loading" :data="menuList" row-key="menuId"
            :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column prop="menuName" label="菜单名称" width="240"></el-table-column>
            <el-table-column label="菜单类型" width="100">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.menuType === '0'" type="info">目录</el-tag>
                    <el-tag v-if="scope.row.menuType === '1'" type="success">菜单</el-tag>
                    <el-tag v-if="scope.row.menuType === '2'" type="primary">按钮</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="icon" label="图标" align="center" width="200">
                <template slot-scope="scope">
                    <i v-if="scope.row.icon" :class="`el-icon-${scope.row.icon}`" />
                </template>
            </el-table-column>
            <el-table-column prop="perms" label="权限标识" width="200" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template slot-scope="scope">
                    <span v-if="scope.row.status === '0'" class="el-tag el-tag-success">正常</span>
                    <span v-else class="el-tag el-tag-danger">禁用</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="200" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit"
                        @click="handleUpdate(scope.row)">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)"
                        v-if="scope.row.menuType !== '2'">新增</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete"
                        @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="上级菜单" prop="parentId">
                            <treeselect v-model="form.parentId" :options="menuOptions" :normalizer="normalizer"
                                :show-count="true" placeholder="选择上级菜单" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="菜单名称" prop="menuName">
                            <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="菜单类型" prop="menuType">
                            <el-select v-model="form.menuType" placeholder="请选择菜单类型">
                                <el-option label="目录" value="0" />
                                <el-option label="菜单" value="1" />
                                <el-option label="按钮" value="2" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="菜单图标" prop="icon" v-if="form.menuType !== '2'">
                            <el-popover placement="bottom-start" width="500" trigger="click"
                                v-model="iconPopoverVisible">
                                <div class="icon-selector">
                                    <el-input v-model="iconSearch" placeholder="搜索图标" prefix-icon="el-icon-search"
                                        size="small" class="mb-2" />
                                    <div class="icon-list">
                                        <!-- 图标在上、名称在下 -->
                                        <div v-for="icon in filteredIcons" :key="icon" class="icon-item"
                                            @click="selectIcon(icon)">
                                            <i :class="icon" />
                                            <span>{{ icon.replace('el-icon-', '') }}</span>
                                        </div>
                                    </div>
                                </div>
                                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                                    <i v-if="form.icon" :class="`el-icon-${form.icon}`" slot="prefix" />
                                    <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                                </el-input>
                            </el-popover>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="权限标识" prop="perms">
                            <el-input v-model="form.perms" placeholder="请输入权限标识（如：system:menu:list）" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="菜单状态" prop="status">
                            <span slot="label">
                                <el-tooltip content="选择停用则菜单将不可用" placement="top">
                                    <i class="el-icon-question"></i>
                                </el-tooltip>
                                菜单状态
                            </span>
                            <el-radio-group v-model="form.status">
                                <el-radio label="0">正常</el-radio>
                                <el-radio label="1">禁用</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="备注" prop="remark">
                            <el-input v-model="form.remark" placeholder="请输入备注信息" type="textarea" rows="3" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { elementIcons } from "@/utils/element-icons";

export default {
    name: "Menu",
    components: { Treeselect },
    data() {
        return {
            loading: true,
            showSearch: true,
            menuList: [],
            menuOptions: [],
            title: "",
            open: false,
            iconPopoverVisible: false,
            iconSearch: '',
            elementIcons: elementIcons,
            isExpandAll: false,
            refreshTable: true,
            queryParams: {
                menuName: undefined,
                status: undefined,
                menuType: undefined
            },
            form: {
                menuId: undefined,
                parentId: 0,
                menuName: undefined,
                menuType: undefined,
                icon: undefined,
                perms: undefined,
                status: "0",
                remark: undefined
            },
            rules: {
                menuName: [
                    { required: true, message: "菜单名称不能为空", trigger: "blur" }
                ],
                menuType: [
                    { required: true, message: "请选择菜单类型", trigger: "change" }
                ]
            }
        };
    },
    computed: {
        filteredIcons() {
            if (!this.iconSearch) {
                return this.elementIcons;
            }
            return this.elementIcons.filter(icon =>
                icon.includes(this.iconSearch)
            );
        }
    },
    watch: {
        'form.menuType'(val) {
            if (val === '2') {
                this.form.icon = '';
            }
        }
    },
    created() {
        this.getList();
    },
    methods: {
        selectIcon(icon) {
            const shortName = icon.replace(/^el-icon-/, '');
            this.form.icon = shortName;
            this.iconPopoverVisible = false;
        },

        handleTree(data, id = 'menuId', parentId = 'parentId') {
            if (!Array.isArray(data)) {
                console.error('[handleTree] 接收的数据不是数组：', data);
                return [];
            }
            const result = [];
            const nodeMap = new Map();
            data.forEach(item => nodeMap.set(item[id], item));
            data.forEach(item => {
                const parentNode = nodeMap.get(item[parentId]);
                if (parentNode) {
                    parentNode.children = parentNode.children || [];
                    parentNode.children.push(item);
                } else {
                    result.push(item);
                }
            });
            return result;
        },

        getList() {
            this.loading = true;
            this.$axios.get('/menu/directory', { params: this.queryParams })
                .then(res => {
                    this.menuList = this.handleTree(res.data, 'menuId');
                })
                .catch(error => {
                    console.error('获取菜单列表失败：', error);
                    this.$message.error('获取菜单列表失败');
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.menuId,
                label: node.menuName,
                children: node.children
            };
        },
        getTreeselect(menuId) {
            this.$axios.get('/menu/menuList')
                .then(res => {
                    // 递归禁用与当前菜单同名的节点
                    const disableSameName = (list = []) => {
                        return list.map(item => ({
                            ...item,
                            isDisabled: item.menuId === menuId,
                            children: item.children ? disableSameName(item.children) : []
                        }));
                    };

                    // 构造树
                    const treeData = disableSameName(res.data);
                    this.menuOptions = [
                        { menuId: 0, menuName: '顶级菜单', children: treeData }
                    ];
                })
                .catch(error => {
                    console.error('获取菜单树失败：', error);
                    this.$message.error('获取菜单树失败');
                });
        },
        cancel() {
            this.open = false;
            this.reset();
        },

        reset() {
            this.form = {
                menuId: undefined,
                parentId: 0,
                menuName: undefined,
                menuType: undefined,
                icon: undefined,
                perms: undefined,
                status: "0",
                remark: undefined
            };
            if (this.$refs.form) {
                this.$refs.form.resetFields();
            }
        },

        handleQuery() {
            this.getList();
        },

        resetQuery() {
            if (this.$refs.queryForm) {
                this.$refs.queryForm.resetFields();
            }
            this.handleQuery();
        },

        handleAdd(row) {
            this.reset();
            this.getTreeselect();
            if (row && row.menuId) {
                this.form.parentId = row.menuId;
            }
            this.open = true;
            this.title = "添加菜单";
        },

        toggleExpandAll() {
            this.refreshTable = false;
            this.isExpandAll = !this.isExpandAll;
            this.$nextTick(() => {
                this.refreshTable = true;
            });
        },

        handleUpdate(row) {
            this.reset();
            this.getTreeselect(row.menuId);
            this.$axios.get(`/menu/${row.menuId}`)
                .then(res => {
                    this.form = res.data;
                    this.open = true;
                    this.title = "修改菜单";
                })
                .catch(error => {
                    console.error('获取菜单详情失败：', error);
                    this.$message.error('获取菜单详情失败');
                });
        },

        submitForm() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    const request = this.form.menuId
                        ? { method: 'put', url: '/menu', data: this.form }
                        : { method: 'post', url: '/menu', data: this.form };

                    this.$axios(request)
                        .then(res => {
                            if (res.code === 200) {
                                this.$message.success(res.msg || '操作成功');
                                this.open = false;
                                this.getList();
                            } else {
                                this.$message.error(res.msg || '操作失败');
                            }
                        })
                        .catch(error => {
                            console.error('菜单提交失败：', error);
                            this.$message.error('网络请求异常，请稍后重试');
                        });
                }
            });
        },

        handleDelete(row) {
            this.$confirm(`是否确认删除名称为"${row.menuName}"的菜单？`)
                .then(() => {
                    this.$axios.delete(`/menu/${row.menuId}`)
                        .then(res => {
                            if (res.code === 200) {
                                this.$message.success(res.msg || '删除成功');
                                this.getList();
                            } else {
                                this.$message.error(res.msg || '删除失败');
                            }
                        })
                        .catch(error => {
                            console.error('菜单删除失败：', error);
                            this.$message.error('网络请求异常，请稍后重试');
                        });
                })
                .catch(() => {
                    this.$message.info('已取消删除');
                });
        },

        toggleSearch() {
            this.showSearch = !this.showSearch;
            if (!this.showSearch) {
                this.resetQuery();
            }
        }
    }
};
</script>

<style scoped>
.icon-selector {
    padding: 10px;
}

.icon-list {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

/* 图标在上、名称在下 */
.icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 70px;
    padding: 5px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.icon-item:hover {
    background-color: #f5f7fa;
    border-color: #dcdfe6;
}

.icon-item i {
    font-size: 24px;
    margin-bottom: 8px;
}

.icon-item span {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: center;
}
</style>