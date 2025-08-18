<template>
    <div class="post-item">
        <div class="post-header">
            <div class="post-left">
                <div class="post-avatar">
                    <img :src="changeAvatar(item.avatar)" alt="Avatar" class="avatar">
                </div>
                <div class="post-info">
                    <div class="post-author" style="display: flex; align-items: center;">{{ item.nickName ||
                        '未知' }}
                        <el-tag v-if="this.$route.path === '/Audit'" style="margin-left: 20px;">帖子</el-tag>
                    </div>
                    <div class="post-meta">
                        <div>ID: {{ item.postId || '未知' }}</div>
                        <div>时间: {{ item.createTime }}</div>
                        <div>查看: {{ item.browseNumber }}</div>
                        <div>点赞: {{ item.likeNumber }}</div>
                        <div>收藏: {{ item.collectionNumber }}</div>
                    </div>
                </div>

            </div>
            <div class="status">
                <el-tag v-if="item.auditStatus == 0" type="warning">未审核</el-tag>
                <el-tag v-if="item.auditStatus == 1" type="primary">审核通过</el-tag>
                <el-tag v-if="item.auditStatus == 2" type="danger">审核不通过</el-tag>
                <el-tag v-if="item.recommend == 1" type="primary">已推荐</el-tag>
                <el-tag v-if="item.delFlag == 2" type="danger">已删除</el-tag>

            </div>
        </div>

        <div class="post-content-wrapper">
            <div class="post-content tran" :class="{ collapsed: !showAll }" v-html="formatRichText(item.content)"></div>
            <div v-if="isOverflow" class="expand-btn" @click="toggleShow">
                {{ showAll ? '收起🔺' : '展开🔻' }}
            </div>
        </div>
        <div class="node-row">
            <el-tag type="info" label="标签" class="node">{{ item.node || '默认节点' }}</el-tag>
            <div class="btn">
                <el-popconfirm v-if="this.$route.path !== '/Audit' && item.delFlag != 2"
                    :title="item.recommend == 0 ? '是否推荐？' : '是否取消推荐？'" placement="top" confirm-button-text="确定"
                    cancel-button-text="取消" icon="el-icon-info" icon-color="#409EFF"
                    @confirm="$emit('recommend', item)">
                    <el-button type="primary" slot="reference" v-if="item.recommend == 0">推荐</el-button>
                    <el-button type="primary" slot="reference" v-else>取消推荐</el-button>

                </el-popconfirm>
                <el-popconfirm v-if="this.$route.path !== '/Audit'" :title="item.delFlag != 2 ? '是否确定删除？' : '是否取消删除？'"
                    placement="top" confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info"
                    icon-color="#409EFF" @confirm="$emit('delete', item)">
                    <el-button v-if="item.delFlag != 2" type="danger" slot="reference">删除</el-button>
                    <el-button v-else type="danger" slot="reference">取消删除</el-button>
                </el-popconfirm>
                <div v-if="this.$route.path === '/Audit' && item.auditStatus == 0" class="audit-btns">
                    <el-popconfirm title="是否确定审核通过？" placement="top" confirm-button-text="确定" cancel-button-text="取消"
                        icon="el-icon-info" icon-color="#409EFF" @confirm="$emit('pass', item)">
                        <el-button type="primary" slot="reference">通过</el-button>
                    </el-popconfirm>
                    <el-popconfirm title="是否确定审核不通过？" placement="top" confirm-button-text="确定" cancel-button-text="取消"
                        icon="el-icon-info" icon-color="#409EFF" @confirm="$emit('reject', item)">
                        <el-button type="danger" slot="reference">不通过</el-button>
                    </el-popconfirm>
                </div>
                <div v-if="this.$route.path === '/Audit' && item.auditStatus != 0" class="audit-btns">
                    <el-popconfirm title="是否确定重新审核？" placement="top" confirm-button-text="确定" cancel-button-text="取消"
                        icon="el-icon-info" icon-color="#409EFF" @confirm="$emit('recheck', item)">
                        <el-button type="warning" slot="reference">重新审核</el-button>
                    </el-popconfirm>
                </div>
            </div>
        </div>
        <el-divider></el-divider>
    </div>
</template>
<script>

export default {
    name: 'post-item',
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            showAll: false,
            isOverflow: false,
        };
    },
    watch: {
        'item.content': {
            handler() {
                this.checkOverflow();
            },
            immediate: true
        }
    },
    mounted() {
        this.showAll = false;
        this.checkOverflow();
    },
    methods: {
        checkOverflow() {
            this.$nextTick(() => {
                const el = this.$el.querySelector('.post-content');
                if (el) {
                    // 默认都加
                    el.classList.add('collapsed');
                    // 判断溢出
                    this.isOverflow = el.scrollHeight > el.clientHeight + 2;

                    if (this.showAll) {
                        el.classList.remove('collapsed');
                    }
                }
            });
        },
        changeAvatar(avatar) {
            if (!avatar) return require('@/assets/images/默认头像.jpg');
            return avatar.startsWith('http') ? avatar : process.env.VUE_APP_PROXY_TARGET + avatar;
        },
        // 处理富文本
        formatRichText(content) {
            if (!content) return '';
            const imgTest = /<img[\s\S]*?>/g;
            const imgTags = content.match(imgTest);
            if (imgTags && imgTags.length > 0) {
                imgTags.forEach(imgTag => {
                    const newImgTag = imgTag.replace('<img', '<img style="max-width:100%;width:200px;height:auto;"');
                    // 替换回原始内容
                    content = content.replace(imgTag, newImgTag);
                });
            }
            return content;
        },
        toggleShow() {
            this.showAll = !this.showAll;

        }
    }

};
</script>
<style lang="scss">
body.dark {
    .post-list {
        background-color: #1E1E1E;

        .post-item {
            background-color: #1E1E1E;


        }
    }

    .post-content {
        color: #808080;
    }

    .el-divider--horizontal {
        background-color: #6e6e6e !important;
    }



}

.post-item {
    margin: 10px 20px;

    .post-header {
        display: flex;
        justify-content: space-between;

        .post-left {
            display: flex;
            gap: 10px;

            .post-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            .post-info {
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                .post-meta {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    font-size: 14px;
                    color: #666;
                }
            }
        }

        .status {
            display: flex;
            gap: 10px;
        }
    }

    .post-content-wrapper {
        position: relative;
    }

    .post-content {
        font-size: 14px;
        color: #333;
        line-height: 20px;
        max-height: none;
        overflow: visible;
        transition: max-height 0.2s;
        word-break: break-all;
    }

    .post-content.collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        max-height: 4em;
    }

    .expand-btn {
        color: #CF4B67;
        cursor: pointer;
        font-size: 13px;
        margin-bottom: 5px;
        user-select: none;
    }

    .node-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .node {
            margin-bottom: 10px;
        }

        .btn {
            margin-bottom: 10px;
            display: flex;
            gap: 15px;

            .audit-btns {
                display: flex;
                gap: 10px;
            }
        }
    }


}
</style>