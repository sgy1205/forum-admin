<template>
    <div class="user-manage pub-box">
        <div class="query-form">
            <el-form :model="queryForm" ref="queryFormRef" inline>
                <el-form-item prop="userId">
                    <el-input v-model="queryForm.userId" placeholder="用户ID"></el-input>
                </el-form-item>
                <el-form-item prop="userName">
                    <el-input v-model="queryForm.userName" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item prop="nickName">
                    <el-input v-model="queryForm.nickName" placeholder="昵称"></el-input>
                </el-form-item>
                <el-form-item prop="userType">
                    <el-select v-model="queryForm.userType" placeholder="用户类型">
                        <el-option label="管理员" value="0"></el-option>
                        <el-option label="用户" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery(queryForm)"> <i class="el-icon-search"></i>
                        查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleReset"> <i class="el-icon-refresh"></i>
                        重置</el-button>
                </el-form-item>
            </el-form>

        </div>
        <el-divider></el-divider>
        <div class="user-table">
            <el-table :data="userList" style="width: 100%" border>
                <el-table-column prop="userId" label="编号" width="100"></el-table-column>
                <el-table-column prop="userType" label="类型">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.userType == 0">管理员</el-tag>
                        <el-tag v-else>用户</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="avatar" label="头像">
                    <template slot-scope="scope">
                        <img :src="getAvatarUrl(scope.row.avatar)" alt="头像" class="avatar" />
                    </template>
                </el-table-column>
                <el-table-column prop="nickName" label="昵称"></el-table-column>
                <el-table-column prop="email" label="邮箱" show-overflow-tooltip></el-table-column>
                <el-table-column prop="points" label="积分"></el-table-column>
                <el-table-column prop="silenceStatus" label="是否禁言">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.silenceStatus == 0 || scope.row.silenceStatus == null"
                            type="primary">未禁言</el-tag>
                        <el-tag v-else type="danger">已禁言</el-tag>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="createTime" label="注册时间">
                    <template slot-scope="scope">
                        {{ scope.row.createTime }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>

                        <el-button v-if="scope.row.silenceStatus == 0 || scope.row.silenceStatus == null" type="primary"
                            size="small" @click="handleMute(scope.row)">禁言</el-button>
                        <el-button v-else type="primary" size="small" @click="handleMute(scope.row)">调整禁言</el-button>
                    </template>
                </el-table-column>

            </el-table>
            <el-pagination background layout="total, prev, pager, next, sizes, jumper" :total="pagination.total"
                :page-size="pagination.pageSize" :current-page.sync='pagination.pageNum' @current-change="getUserPageList()"
                @size-change="handleSizeChange($event)" style="text-align: end;padding: 10px 0;">
            </el-pagination>
            <!-- 弹窗 -->
            <el-dialog :visible.sync="dialog.visible" :title="dialog.title" width="30%" :close-on-click-modal="false">
                <el-form :model="dialog.user" ref="dialogFormRef" :rules="rules">
                    <el-form-item label="类型" prop="userType">
                        <el-select v-model="dialog.user.userType" style="width: 100%">
                            <el-option label="管理员" :value="'0'"></el-option>
                            <el-option label="用户" :value="'1'"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="账号(用户名)" prop="userName">
                        <el-input v-model="dialog.user.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="头像" prop="avatar">
                        <el-upload class="avatar-uploader" action="" :auto-upload="false" :show-file-list="false"
                            :on-change="handleAvatarChange">
                            <img v-if="dialog.user.avatar" :src="dialog.user.avatar" class="avatar" />
                            <el-button v-else icon="el-icon-plus">上传头像</el-button>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="昵称" prop="nickName">
                        <el-input v-model="dialog.user.nickName"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="dialog.user.email"></el-input>
                    </el-form-item>
                    <el-form-item label="性别" prop="sex">
                        <el-select v-model="dialog.user.sex" style="width: 100%">
                            <el-option label="男" :value="'0'"></el-option>
                            <el-option label="女" :value="'1'"></el-option>
                            <el-option label="未知" :value="'2'"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="签名" prop="signature">
                        <el-input v-model="dialog.user.signature"></el-input>
                    </el-form-item>
                    <el-form-item label="角色" prop="roleIds">
                        <el-select v-model="dialog.user.roleIds" multiple placeholder="请选择角色" style="width: 100%">
                            <el-option v-for="role in roles" :key="role.value" :label="role.label"
                                :value="role.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="handleCancel('dialog')">取 消</el-button>
                    <el-button type="primary" @click="handleSave">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 禁言弹窗 -->
            <el-dialog :visible.sync="muteDialog.visible" :title="muteDialog.title" width="30%"
                :close-on-click-modal="false">
                <el-form :model="muteDialog.form" ref="muteDialogFormRef" :rules="rules">
                    <el-form-item label="禁言原因" prop="signatureReason">
                        <el-input v-model="muteDialog.form.signatureReason"></el-input>
                    </el-form-item>
                    <el-form-item label="禁言类型" prop="silenceType">
                        <!-- 清空时间 -->
                        <el-select v-model="muteDialog.form.silenceType" style="width: 100%"
                            @change="handleSilenceTypeChange">
                            <el-option label="暂时禁言" :value="'0'"></el-option>
                            <el-option label="永久禁言" :value="'1'"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 选永久禁言就不能写时间 -->
                    <el-form-item label="禁言时长(天)" prop="signatureTime">
                        <el-input v-model="muteDialog.form.signatureTime"
                            :disabled="muteDialog.form.silenceType == 1"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="handleCancel('muteDialog')">取 消</el-button>
                    <el-button type="primary" @click="mute">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 调整禁言弹窗 -->
            <el-dialog :visible.sync="muteStatusDialog.visible" :title="muteStatusDialog.title" width="30%"
                :close-on-click-modal="false">
                <el-form :model="muteStatusDialog.form" ref="muteStatusDialogFormRef" :rules="rules">
                    <el-form-item label="当前禁言状态" prop="curStatus">
                        <el-input v-model="muteStatusDialog.form.curStatus" disabled></el-input>
                    </el-form-item>
                    <!-- 选永久禁言就不能写时间 -->
                    <el-form-item label="禁言时长(天,从现在开始计算)" prop="silenceTime">
                        <el-input v-model="muteStatusDialog.form.silenceTime"
                            :disabled="muteStatusDialog.form.silenceStatus == 0 || muteStatusDialog.form.silenceStatus == 2"></el-input>
                    </el-form-item>
                    <el-form-item label="调整禁言状态" prop="silenceStatus">
                        <!-- 清空时间 -->
                        <el-select v-model="muteStatusDialog.form.silenceStatus" style="width: 100%"
                            @change="handleSilenceTypeChange">
                            <el-option label="解除禁言" :value="'0'"></el-option>
                            <el-option label="修改暂时禁言时间" :value="'1'"></el-option>
                            <el-option label="永久禁言" :value="'2'"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="handleCancel('muteStatusDialog')">取 消</el-button>
                    <el-button type="primary" @click="changeMuteStatus">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import avatar from '@/assets/images/默认头像.jpg';
import _default from '@/assets/images/默认头像.jpg';
import { query } from '@/utils/query';
export default {
    name: 'userManage',
    data() {
        const validateLinkUrl = (rule, value, callback) => {
            if (!value) {
                callback()
            }
            const test = /^((http|https):\/\/)?(www\.)?[^\s]+\.[^\s]+$/;
            if (!test.test(value)) {
                return callback(new Error('请输入正确的链接格式'));
            }
            callback();
        };
        return {
            avatar,
            _default,
            userList: [
            ],
            queryForm: {
                userId: '',
                userName: '',
                nickName: '',
                userType: '',
            },
            roles: [

            ],
            // 分页
            pagination: {
                pageNum: 1,
                pageSize: 10,
                total: 0,
            },
            // 弹窗
            dialog: {
                visible: false,
                title: '编辑',
                fileList: [], // 存储临时文件
                user: {
                    userId: '',
                    userType: '',
                    userName: '',
                    avatar: '',
                    nickName: '',
                    email: '',
                    sex: '',
                    homepageUrl: '',
                    signature: '',
                    roleIds: [],

                }
            },
            // 禁言弹窗
            muteDialog: {
                visible: false,
                title: '禁言用户',
                form: {
                    userId: '',
                    signatureReason: '',
                    signatureTime: undefined,
                    silenceType: ''
                }
            },
            // 调整禁言弹窗
            muteStatusDialog: {
                visible: false,
                title: '调整禁言',
                form: {
                    userId: '',
                    curStatus: '',
                    silenceStatus: '',
                    signatureTime: undefined,
                }
            },
            rules: {
                userType: [
                    { required: true, message: '请选择用户类型', trigger: 'change' }
                ],
                userName: [
                    { required: true, message: '请输入账号', trigger: 'change' },
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'change' }
                ],
                homepageUrl: [
                    { validator: validateLinkUrl, trigger: 'change' }
                ],
                signatureReason: [
                    { required: true, message: '请输入禁言原因', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'change' }
                ],
                silenceType: [
                    { required: true, message: '请选择禁言类型', trigger: 'blur' }
                ],
                silenceStatus: [
                    { required: true, message: '请选择禁言状态', trigger: 'blur' }
                ],
            }
        };
    },
    created() {
        this.getUserPageList();
    },
    methods: {
        // 获取用户信息分页列表
        getUserPageList(){
            const params = {
                pageNum: this.pagination.pageNum,
                pageSize: this.pagination.pageSize,
                ...this.queryForm
            };
            this.$axios({
                method:'get',
                url:'/userManager/getUserPageList',
                params
            }).then(res=>{
                this.userList = res.rows;
                this.pagination.total = res.total;
            }).catch(err => {
                console.error(err);
                this.$message.error('获取用户列表失败');
            });
        },
        // pageSize变化
        handleSizeChange(size) {
            this.pagination.pageSize = size
            this.getUserPageList()
        },
        //查询
        handleQuery() {
            const hasInput = query(this.queryForm)

            if (!hasInput) return this.$message.warning('请至少输入一项！')

            this.pageNum = 1;
            this.getUserPageList(this.queryForm);
        },
        // 重置查询条件
        handleReset() {
            this.resetForm('queryForm');
            this.pagination.pageNum = 1;
            this.getUserPageList();
        },
        // 重置表单
        resetForm(val) {
            this.$refs[`${val}Ref`].resetFields(),
                this.dialog.user = {
                    userId: '',
                    userType: '',
                    userName: '',
                    avatar: '',
                    nickName: '',
                    email: '',
                    sex: '',
                    homepageUrl: '',
                    signature: '',
                    roleIds: [],
                };
            this.muteDialog.form = {
                userId: '',
                signatureReason: '',
                signatureTime: undefined,
                silenceType: ''
            };
        },
        // pageSize变化
        handleSizeChange(size) {
            this.pagination.pageSize = size
            this.getUserPageList()
        },
        // 永久禁言或解禁把时间清空
        handleSilenceTypeChange() {
            if (this.muteDialog.form.silenceType == 1) {
                this.muteDialog.form.signatureTime = '';
            }
            if (this.muteStatusDialog.form.silenceStatus == 2 || this.muteStatusDialog.form.silenceStatus == 0) {
                this.muteStatusDialog.form.silenceTime = '';
            }
        },
        getAvatarUrl(avatar) {

            if (!avatar) return require('@/assets/images/默认头像.jpg');
            if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
                return avatar;
            }
            return process.env.VUE_APP_PROXY_TARGET + avatar;
        },
        // 编辑用户
        handleEdit(row) {
            this.dialog.visible = true
            this.dialog.title = '编辑用户'
            const userId=row.userId;
            this.$axios({
                method:'get',
                url:`/userManager/detail/${userId}`
            }).then(res => {
                this.dialog.user = {
                    ...res.data.userManagerDetail,
                    avatar: this.getAvatarUrl(res.data.userManagerDetail.avatar) || this._default
                };
                this.$set(this.dialog.user, 'roleIds', res.data.userManagerDetail.roleIds || [])
                this.$set(this, 'roles', res.data.roleNameList.map(role => ({
                    label: role.roleName,
                    value: role.roleId
                })));

            });
        },
        handleCancel(dialogName) {
            this[dialogName].visible = false;
            this[dialogName].fileList = [];
            this.resetForm(dialogName + 'Form');
        },
        // 禁言或调整禁言弹窗
        handleMute(row) {
            const action = row.silenceStatus == 0 || row.silenceStatus == null ? '禁言' : '调整禁言';

            if (action === '禁言') {
                this.muteDialog.visible = true
                this.muteDialog.form.userId = row.userId;
            }
            else {
                // 调整禁言
                this.muteStatusDialog.visible = true;
                this.muteStatusDialog.form.userId = row.userId;
                if (row.silenceStatus == 0 || row.silenceStatus == null) {
                    this.muteStatusDialog.form.curStatus = '未禁言';
                } else if (row.silenceStatus == 1) {
                    this.muteStatusDialog.form.curStatus = '暂时禁言';
                } else {
                    this.muteStatusDialog.form.curStatus = '永久禁言';
                }

            }
        },
        // 保存用户
        handleSave() {

            this.$refs.dialogFormRef.validate(async (valid) => {
                if (!valid) {
                    this.$message.error('请填写完整信息');
                    return;
                }
                // 有传头像
                if (this.dialog.fileList.length > 0) {
                    const file = this.dialog.fileList[0].raw;
                    const formData = new FormData();
                    formData.append('file', file);
                    this.$axios.post(
                            '/uploadfile', formData
                        ).then(res => {
                        // 覆盖掉预览的链接
                        this.dialog.user.avatar = res.data;
                        this.$axios({
                            method:'put',
                            url:`/userManager/update`,
                            data: this.dialog.user
                        }).then(res => {
                            this.$store.commit('SET_AVATAR', process.env.VUE_APP_PROXY_TARGET + this.dialog.user.avatar);
                            this.getUserPageList();
                            this.resetForm('dialogForm');

                            this.$message.success('用户信息已更新');
                        }).catch(error => {
                        });

                        return
                    }).catch(error => {
                    });
                } else {
                    // 没传头像
                    this.$axios({
                        method:'put',
                        url:`/userManager/update`,
                        data: this.dialog.user
                    }).then(res => {
                        this.getUserPageList();
                        this.resetForm('dialogForm');
                        this.$message.success('用户信息已更新');
                    }).catch(error => {
                    });
                }
                this.dialog.visible = false
            });
        },
        // 处理头像上传
        handleAvatarChange(file) {
            const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name);
            if (!isImage) {
                this.$message.error('请上传JPG、PNG、GIF或BMP格式的图片');
                return;
            }
            const reader = new FileReader();
            reader.onload = (item) => {
                this.dialog.user.avatar = item.target.result;
            };
            reader.readAsDataURL(file.raw);
            this.dialog.fileList = [file];
        },
        // 确定禁言
        mute() {
            this.$refs.muteDialogFormRef.validate(valid => {
                if (!valid) {
                    return;
                }
                this.muteDialog.form.signatureTime = Number(this.muteDialog.form.signatureTime);
                this.$axios({
                        method:'post',
                        url:`/silence/setSilence`,
                        data: this.muteDialog.form
                    }).then(res => {
                    if (res.code == 200) {
                        this.$message.success(res.msg || '禁言成功');
                    } else {
                        this.$message.error(res.msg || '禁言失败');
                    }
                    this.getUserPageList();
                    this.handleReset();
                    this.muteDialog.visible = false;
                }).catch(error => {
                });
            });
        },
        // 确定调整禁言
        changeMuteStatus() {
            this.$refs.muteStatusDialogFormRef.validate(valid => {
                if (!valid) {
                    this.$message.error('请填写完整禁言信息');
                    return;
                }
                this.muteStatusDialog.form.silenceTime = Number(this.muteStatusDialog.form.silenceTime);
                this.$axios({
                        method:'post',
                        url:`/silence/updateSilence`,
                        data: this.muteStatusDialog.form
                    }).then(res => {
                    if (res.code == 200) {
                        this.$message.success(res.msg || '调整禁言成功');
                    } else {
                        this.$message.error(res.msg || '调整禁言失败');
                    }
                    this.getUserPageList();
                    this.handleReset();
                    this.muteStatusDialog.visible = false;
                }).catch(error => {
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
    .user-manage {
        background-color: #1e1e1e;
        color: #ffffff;

        .query-form {
            background-color: #2c2c2c;
            color: #ffffff;
        }

        .el-divider--horizontal {
            background-color: #6e6e6e;
        }

        .user-table {
            background-color: #2c2c2c;
            color: #ffffff;

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
        }

        ::v-deep .btn-prev,
        ::v-deep .btn-next {
            background-color: #3C3C3C !important;
            color: #ffffff !important;
        }

        ::v-deep .el-dialog {
            background-color: #2c2c2c !important;
            color: #ffffff !important;

            .el-select-dropdown__item .selected {
                background-color: #3C3C3C !important;
                color: #ffffff !important;

            }

            .el-select-dropdown.is-multiple .el-select-dropdown__item .selected.hover {
                background-color: #3C3C3C !important;
                color: #ffffff !important;

            }

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

.user-manage {

    ::v-deep .el-table th {
        background: #F2F3F5 !important;
    }

    ::v-deep .el-divider--horizontal {
        margin: 0 !important;

    }

    .user-table {
        background-color: #FFFFFF;
        padding: 10px;
        height: 100%;

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
    }


}
</style>