<template>
    <div class="post pub-box">
        <div class="query-form">
            <el-form :model="queryForm" ref="queryFormRef" inline>
                <el-form-item prop="postId">
                    <el-input v-model="queryForm.postId" placeholder="ID"></el-input>
                </el-form-item>
                <el-form-item prop="userId">
                    <el-input v-model="queryForm.userId" placeholder="用户ID"></el-input>
                </el-form-item>

                <el-form-item prop="delFlag">
                    <el-select v-model="queryForm.delFlag" placeholder="状态">
                        <el-option label="正常" :value="0"></el-option>
                        <el-option label="已删除" :value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="recommend">
                    <el-select v-model="queryForm.recommend" placeholder="是否推荐">
                        <el-option label="是" :value="'1'"></el-option>
                        <el-option label="否" :value="'0'"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="title">
                    <el-input v-model="queryForm.title" placeholder="标题"></el-input>
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

        <div class="post-list">
            <el-empty v-if="postList.length == 0" description="暂无话题"></el-empty>
            <div v-else>
                <PostItem v-for="post in postList" :key="post.id" :item="post" @recommend="handleRecommend"
                    @delete="handleDelete" />
            </div>
            <el-pagination background layout="total, prev, pager, next, sizes, jumper" :total="pagination.total"
                :page-size="pagination.pageSize" :current-page.sync='pagination.pageNum' @current-change="getPostList()"
                @size-change="handleSizeChange($event)" style="text-align: end;padding: 10px 0;">
            </el-pagination>
        </div>

    </div>

</template>
<script>
import { query } from '@/utils/query';
export default {
    name: 'PostManager',
    components: {
        PostItem: () => import('@/components/PostItem.vue')
    },
    data() {
        return {
            postList: [
            ],
            queryForm: {
                postId: '',
                userId: '',
                delFlag: '',
                recommend: '',
                title: ''
            },
            // 分页
            pagination: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
            },
        };
    },
    created() {
        this.getPostList();
    },
    methods: {
        getPostList() {
            const params = {
                pageNum: this.pagination.pageNum,
                pageSize: this.pagination.pageSize,
                ...this.queryForm
            };
            this.$axios({
                method:'get',
                url:'/postManager/pageList',
                params
            }).then(res => {
                this.postList = res.rows;
                this.pagination.total = res.total;
            }).catch(err => {
                console.error(err);
                this.$message.error('获取帖子列表失败');
            });
        },
        handleQuery() {
            const hasInput = query(this.queryForm)

            if (!hasInput) return this.$message.warning('请至少输入一项！')
            this.pagination.pageNum = 1;
            this.getPostList(this.queryForm)
        },
        resetForm(val) {
            this.$refs[`${val}Ref`].resetFields();

        },
        handleReset() {
            this.resetForm('queryForm');
            this.pagination.pageNum = 1;
            this.getPostList();
        },
        // pageSize变化
        handleSizeChange(size) {
            this.pagination.pageSize = size
            this.pagination.pageNum = 1;
            this.getPostList()
        },
        handleRecommend(post) {
            if (post.recommend == 0) {
                this.$axios({
                method:'post',
                url:`/postManager/recommend/${post.postId}`
            }).then(res => {
                    if(res.code==200){
                      this.$message.success(res.msg);
                    }else{
                      this.$message.error(res.msg);
                    }
                    this.getPostList();
                }).catch(err => {
                });
            } else {
                this.$axios({
                  method:'post',
                  url:`/postManager/recommend/${post.postId}`
                }).then(res => {
                    if(res.code==200){
                      this.$message.success(res.msg || '取消推荐成功');
                    }else{
                      this.$message.error(res.msg || '取消推荐失败');
                    }
                    this.getPostList();
                }).catch(err => {
                });
            }
        },
        handleDelete(post) {
            if (post.delFlag == 2) {
                this.$axios({
                  method:'delete',
                  url:`/postManager/deletePost/${post.postId}`
                }).then(() => {
                    this.$message.success('取消删除成功');
                    this.getPostList()
                }).catch(err => {
                    console.error(err);
                    this.$message.error('取消删除失败');
                });
            } else {
                this.$axios({
                  method:'delete',
                  url:`/postManager/deletePost/${post.postId}`
                }).then(res => {
                    if(res.code==200){
                      this.$message.success(res.msg || '删除成功');
                    }else{
                      this.$message.error(res.msg || '删除失败');
                    }
                    this.getPostList()
                }).catch(err => {
                    console.error(err);
                    this.$message.error('删除失败');
                });
            }
        },
    },
    mounted() {
    }
};
</script>
<style lang="scss" scoped>
body.dark {
    .post {
        background-color: #1f1f1f;
        color: #ffffff;

        .query-form {
            background-color: #2c2c2c;
            color: #ffffff;
        }

        .el-divider--horizontal {
            background-color: #6e6e6e !important;
        }

        ::v-deep .btn-prev,
        ::v-deep .btn-next {
            background-color: #3C3C3C !important;
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

}


.post-list {
    padding: 10px;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>
