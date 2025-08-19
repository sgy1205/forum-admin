<template v-loading="Loading">
    <div class="audit pub-box">
        <div class="query-form">
            <el-form :model="queryForm" ref="queryFormRef" inline>
                <el-form-item prop="type">
                    <el-select v-model="type" placeholder="类型" @change="handleTypeChange">
                        <el-option label="全部" :value="2"></el-option>
                        <el-option label="帖子" :value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="title">
                    <el-input v-model="queryForm.title" placeholder="标题"></el-input>
                </el-form-item>

                <el-form-item prop="auditStatus">
                    <el-select v-model="queryForm.auditStatus" placeholder="状态">
                        <el-option label="未审核" :value="0"></el-option>
                        <el-option label="审核通过" :value="1"></el-option>
                        <el-option label="审核不通过" :value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery"> <i class="el-icon-search"></i>
                        查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleReset"> <i class="el-icon-refresh"></i>
                        重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-divider></el-divider>
        <div class="audit-list">
            <!-- 只保留帖子列表展示 -->
            <el-empty v-if="currentList !== null && !currentList.length" description="暂无数据"></el-empty>
            <PostItem v-for="(item, index) in currentList" :key="index" :item="item" 
                @pass="handlePass" @reject="handleReject" @recheck="handleRecheck" />
            <el-pagination background layout="total, prev, pager, next, sizes, jumper" 
                :total="pagination.total" :page-size="pagination.pageSize" 
                :current-page.sync='pagination.pageNum' @current-change="get()"
                @size-change="handleSizeChange" style="text-align: end;padding: 10px 0;">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import { query } from '@/utils/query';
// 只引入帖子组件
import PostItem from '@/components/PostItem.vue';

export default {
    name: 'audit',
    components: {
        PostItem // 只注册帖子组件
    },
    data() {
        return {
            Loading: false,
            type: 2, // 0: 文章(已移除), 1: 帖子, 2: 全部(仅帖子)
            queryForm: {
                title: '',
                auditStatus: '', // 0：未审核 1：审核通过 2：审核不通过
            },
            // 分页
            pagination: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
            },
            postList: [],
            currentList: null,
        };
    },
    beforeMount() {
        this.getMixedList();
    },
    methods: {
        getMixedList() {
            this.Loading = true;
            const params = {
                ...this.queryForm,
                pageNum: this.pagination.pageNum,
                pageSize: this.pagination.pageSize
            };
            this.$axios({
                method:'get',
                url:'/postManager/pageList',
                params
            }).then(res => {
                this.currentList = res.rows || [];
                this.pagination.total = res.total || 0;
                this.Loading = false;
            }).catch(error => {
                this.Loading = false;
                console.error('获取帖子列表失败:', error);
            });
        },
        // pageSize变化
        handleSizeChange(size) {
            this.pagination.pageSize = size;
            this.getMixedList();
        },
        get() {
            this.getMixedList();
        },
        handleTypeChange() {
            this.pagination.pageNum = 1;
            this.get();
        },
        handleReset() {
            this.resetForm('queryForm');
            this.type = 2;
            this.pagination.pageNum = 1;
            this.getMixedList();
        },
        handleQuery() {
            const hasInput = query(this.queryForm);
            if (!hasInput) return this.$message.warning('请至少输入一项！');

            this.pagination.pageNum = 1;
            this.getMixedList();
        },
        resetForm(val) {
            this.$refs[`${val}Ref`].resetFields();
        },
        handleAudit(item, status) {
            this.$axios({
                method:'post',
                url:'/postManager/audit',
                data: {
                    postId: item.postId,
                    auditStatus: status
                }
            }).then(res => {
                if(res.code == 200){
                    this.$message.success(res.msg);
                }else{
                    this.$message.error(res.msg || '操作失败');
                }
                this.getMixedList();
            }).catch(error => {
                console.error('审核失败:', error);
            });
        },
        handlePass(item) {
            this.handleAudit(item, 1);
        },
        handleReject(item) {
            this.handleAudit(item, 2);
        },
        handleRecheck(item) {
            this.handleAudit(item, 0);
        }
    },
    mounted() {
    }
};
</script>

<style lang="scss" scoped>
body.dark {
    .audit {
        background-color: #141414;
    }

    .audit-list {
        background-color: #1e1e1e;

        ::v-deep .btn-prev,
        ::v-deep .btn-next {
            background-color: #3C3C3C !important;
            color: #ffffff !important;
        }
    }

    .query-form {
        background-color: #2c2c2c;
    }
}

::v-deep .el-table th {
    background: #F2F3F5 !important;
}

::v-deep .el-divider--horizontal {
    margin: 0 !important;
}

.audit-list {
    padding: 10px;
    background-color: white;
}
</style>