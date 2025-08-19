<template>
    <div class="banned-word pub-box">
        <div class="query-form">
            <el-form :model="queryForm" ref="queryFormRef" inline>
                <el-form-item prop="type">
                    <el-select v-model="queryForm.type" placeholder="类型">
                        <el-option label="词组" :value="0"></el-option>
                        <el-option label="正则" :value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="forbiddenWord">
                    <el-input v-model="queryForm.forbiddenWord" placeholder="违禁词"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery"> <i class="el-icon-search"></i>
                        查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleReset"> <i class="el-icon-refresh"></i>
                        重置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addforbiddenWord">
                        <i class="el-icon-plus"></i>
                        新增</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-divider></el-divider>
        <div class="banned-word-table">
            <el-table :data="forbiddenWords" style="width: 100%" border>
                <el-table-column prop="forbiddenWordsId" label="编号"></el-table-column>
                <el-table-column prop="type" label="类型">
                    <template #default="{ row }">
                        {{ row.type === 0 ? '词组' : '正则' }}
                    </template>
                </el-table-column>
                <el-table-column prop="forbiddenWord" label="违禁词"></el-table-column>
                <el-table-column prop="remark" label="备注"></el-table-column>
                <el-table-column prop="createTime" label="创建时间"></el-table-column>
                <el-table-column label="操作">
                    <template #default="{ row }">
                        <el-button @click="editforbiddenWord(row)" size="mini">编辑</el-button>
                        <el-button @click="deleteforbiddenWord(row.forbiddenWordsId)" type="danger"
                            size="mini">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="total, prev, pager, next, sizes, jumper" :total="pagination.total"
                :page-size="pagination.pageSize" :current-page.sync='pagination.pageNum'
                @current-change="getForbiddenWordList()" @size-change="handleSizeChange($event)"
                style="text-align: end;padding: 10px 0;">
            </el-pagination>
            <el-dialog :visible.sync="dialog.visible" :title="dialog.mode === 'add' ? '新增' : '编辑'" width="30%"
                :close-on-click-modal="false">
                <el-form :model="dialog.forbiddenWords" ref="dialogforbiddenWordsRef" :rules="rules">
                    <el-form-item label="类型" prop="type">
                        <el-select v-model="dialog.forbiddenWords.type" placeholder="类型" style="width: 100%;">
                            <el-option label="词组" :value="0"></el-option>
                            <el-option label="正则" :value="1"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="违禁词" prop="forbiddenWord">
                        <el-input v-model="dialog.forbiddenWords.forbiddenWord" placeholder="请输入违禁词"></el-input>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="dialog.forbiddenWords.remark" placeholder="请输入备注"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="handleCancel">取消</el-button>
                        <el-button type="primary" @click="handleSave">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import { query } from '@/utils/query.js';
export default {
    name: 'forbiddenWord',
    data() {
        return {
            forbiddenWords: [
            ],
            queryForm: {
                type: undefined,
                forbiddenWord: '',
            },
            // 分页
            pagination: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
            },
            // 弹窗
            dialog: {
                visible: false,
                mode: "add",
                forbiddenWords: {
                    forbiddenWordsId: '',
                    type: undefined,
                    forbiddenWord: '',
                    remark: '',

                },
            },
            rules: {
                forbiddenWord: [
                    { required: true, message: '请输入违禁词', trigger: 'change' },
                    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'change' }
                ],
            }
        };
    },
    created() {
        this.getForbiddenWordList();

    },
    computed: {
    },
    methods: {

        getForbiddenWordList(query) {
            const params = {
                ...this.queryForm,
                pageNum: this.pagination.pageNum,
                pageSize: this.pagination.pageSize,
                ...query
            };
            this.$axios({
                method: 'get',
                url: '/forbiddenWord/list',
                params
            }).then(res => {
                this.forbiddenWords = res.rows;
                this.pagination.total = res.total || 0;
            }).catch(err => {
                console.error(err);
                this.$message.error('获取违禁词列表失败');
            });
        },
        // pageSize变化
        handleSizeChange(size) {
            this.pagination.pageSize = size
            this.pagination.pageNum = 1;
            this.getForbiddenWordList();
        },
        handleQuery() {
            const hasInput = query(this.queryForm)

            if (!hasInput) return this.$message.warning('请至少输入一项！')
            this.pagination.pageNum = 1;
            this.getForbiddenWordList(this.queryForm)
        },
        handleReset() {
            this.resetForm('queryForm');
            this.pagination.pageNum = 1;
            this.getForbiddenWordList();
        },
        resetForm(val) {
            this.$refs[`${val}Ref`].resetFields();
            this.dialog.forbiddenWords = {
                id: '',
                type: '',
                forbiddenWord: '',
                remark: '',
            };
        },
        addforbiddenWord() {
            console.log('新增违禁词');
            this.dialog.visible = true;
            this.dialog.mode = 'add';
        },
        editforbiddenWord(row) {
            console.log('编辑违禁词:', row);
            this.dialog.visible = true;
            this.dialog.mode = 'edit';
            this.dialog.forbiddenWords = {
                ...row,
                type: typeof row.type === 'string' && (row.type === '词组' || row.type === '正则')
                    ? (row.type === '词组' ? 0 : 1)
                    : row.type
            };
        },
        deleteforbiddenWord(id) {
            console.log('删除违禁词:', id);
            this.$confirm('确定删除违禁词?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios({
                    method: 'delete',
                    url: `/forbiddenWord/${id}`
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success(res.msg || '删除成功');
                    }else {
                        this.$message.error(res.msg || '删除失败');
                    }
                    this.getForbiddenWordList();
                }).catch(() => {
                    this.$message.error('删除失败！');
                });
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        handleCancel() {
            this.dialog.visible = false;
            this.resetForm('dialogforbiddenWords');
        },

        handleSave() {
            this.$refs.dialogforbiddenWordsRef.validate(valid => {
                if (!valid) {
                    this.$message.error('请填写完整的违禁词信息！');
                    return;
                }
                this.$axios({
                    method: this.dialog.mode === 'add' ? 'post' : 'put',
                    url: `/forbiddenWord`,
                    data: this.dialog.forbiddenWords
                }).then(res => {
                    if(res.code==200){
                        this.$message.success(this.dialog.mode === 'add' ? '添加成功！' : '编辑成功！');
                    }else {
                        this.$message.error(this.dialog.mode === 'add' ? '添加失败！' : '编辑失败！');
                    }
                    this.dialog.visible = false;
                    this.resetForm('dialogforbiddenWords');
                    this.getForbiddenWordList();
                }).catch(() => {
                    this.$message.error(this.dialog.mode === 'add' ? '添加失败！' : '编辑失败！');
                });
            });
        },
    },
    mounted() {
    }
};
</script>
<style lang="scss" scoped>
body.dark {
    .query-form {
        background-color: #2c2c2c;
    }

    .banned-word-table {
        background-color: #1e1e1e;

        .el-table {
            background-color: #232324 !important;
            color: #ffffff;


        }

        ::v-deep .el-table th {
            background: #232324 !important;
            color: #ffffff !important;

        }

        ::v-deep .el-table td {
            background: #232324 !important;
            color: #ffffff !important;

        }

        ::v-deep .el-dialog {
            background-color: #2c2c2c !important;
            color: #ffffff !important;

            .el-dialog__header {
                background-color: #3C3C3C !important;

                .el-dialog__title {
                    color: #ffffff !important;
                }
            }

            .el-dialog__body {
                background-color: #2c2c2c !important;
                color: #ffffff !important;
            }

            .el-dialog__footer {
                background-color: #3C3C3C !important;
                color: #ffffff !important;
            }
        }
    }

    .banned-word {
        background-color: #141414 !important;

        ::v-deep .btn-prev,
        ::v-deep .btn-next {
            background-color: #3C3C3C !important;
            color: #ffffff !important;
        }
    }
}

::v-deep .el-table th {
    background: #F2F3F5 !important;
}

::v-deep .el-divider--horizontal {
    margin: 0 !important;

}

.banned-word-table {
    padding: 10px;
    background-color: #ffffff;
}
</style>