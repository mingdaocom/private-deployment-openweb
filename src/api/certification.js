export default {
  /**
  * 获取当前用户已有认证信息
  * @param {Object} args 请求参数
  * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
  * @param {boolean} args.isUpgrade 是否升级
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCertInfoList: function (args, options = {}) {
     
     return mdyAPI('Certification', 'GetCertInfoList', args, options);
   },
  /**
  * 查看认证信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 认证实体Id  组织对应projectID
  * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
  * @param {integer} args.authType 认证 的 类型 1个人 2企业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCertInfo: function (args, options = {}) {
     
     return mdyAPI('Certification', 'GetCertInfo', args, options);
   },
  /**
  * 检查当前人员/组织是否被认证过
  * @param {Object} args 请求参数
  * @param {string} args.projectId 认证实体Id  组织对应projectID
  * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
  * @param {integer} args.authType 认证 的 类型 1个人 2企业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkIsCert: function (args, options = {}) {
     
     return mdyAPI('Certification', 'CheckIsCert', args, options);
   },
  /**
  * 检查当前身份证号或者营业执照是否被认证过
  * @param {Object} args 请求参数
  * @param {string} args.idNumber 证件号码
  * @param {string} args.creditCode 组织唯一识别码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkIsCertByCertNo: function (args, options = {}) {
     
     return mdyAPI('Certification', 'CheckIsCertByCertNo', args, options);
   },
  /**
  * 个人认证
  * @param {Object} args 请求参数
  * @param {integer} args.certSource 认证来源 1组织认证  2市场认证
  * @param {string} args.projectId 组织Id 组织认证只能基于当前的AccountId 组织认证如果是选择个人的情况 直接per信息不传
  * @param {string} args.verifyCode 手机验证码
  * @param {} args.personalInfo
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   personalCertification: function (args, options = {}) {
     
     return mdyAPI('Certification', 'PersonalCertification', args, options);
   },
  /**
  * 组织认证
  * @param {Object} args 请求参数
  * @param {integer} args.certSource 认证来源 1组织认证  2市场认证
  * @param {string} args.entityId 认证实体Id  组织对应projectID  市场对应开发者AccountId
  * @param {string} args.mapProjectId 关联认证组织Id
  * @param {} args.enterpriseInfo
  * @param {boolean} args.isUpgrade 是否升级
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   enterpriseCertification: function (args, options = {}) {
     
     return mdyAPI('Certification', 'EnterpriseCertification', args, options);
   },
  /**
  * 获取已填认证失败的信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 认证实体Id  组织对应projectID
  * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
  * @param {integer} args.authType 认证 的 类型 1个人 2企业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCertFailedInfo: function (args, options = {}) {
     
     return mdyAPI('Certification', 'GetCertFailedInfo', args, options);
   },
};